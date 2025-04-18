const express = require('express');
const app = express();
const path = require('path');
const dotenv = require('dotenv');
const knex = require('knex');
const axios = require('axios');
const cors = require('cors');
const uuid = require('uuid'); // For generating unique affiliate codes
const router = express.Router();
const session = require('express-session');
const { Pool } = require('pg');  
const { body, validationResult } = require('express-validator');
//const bcrypt = require('bcrypt');
const LRU = require('lru-cache');

dotenv.config();

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 }
}))


// const db = knex({
//   client: 'pg',
//   connection: {
//     host: 'localhost',
//     port: 5432,
//     user: 'postgres',
//     password: 'LMsbffmc',
//     database: 'affilate'
//   }
// });
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'affilate',
  password: 'LMsbffmc',
  port: 5432,
});



const port = process.env.PORT || 5000; // Provide a default value

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
//let id;
// Route to display all products
app.get('/', async (req, res) => {
  try {
    const results = await pool.query('SELECT * FROM products');
    const products = results.rows;
   // res.json(products)
   res.render('home', { products: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Server error fetching products");
  }
});

app.get('/login', async function(req,res){
   res.render('login')
})
app.post('/login', async function(req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // 1. Retrieve the user from the database by email
    const result = await pool.query('SELECT * FROM account WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).send('Invalid email or password');
    }

    const user = result.rows[0];

    // 2. Compare the submitted password with the stored hash

    if (password) {
        // create the session object
      req.session.user = {
        id: user.id,
        email: user.email,
        fName: user.fname
      };
      // 3. Redirect to the user's account page or dashboard
      res.redirect(`/account/${user.id}`);
    } else {
      return res.status(401).send('Invalid email or password'); // 401 Unauthorized
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Login failed.');
  }
});
app.get('/register', async function(req, res) {
  try {
      // No ID needed for registration form
      res.render('register');
  } catch (error) {
      console.error('Error fetching initial data:', error);
      res.status(500).send('Error loading registration form.');
  }
});

// Handle Registration Form Submission
app.post('/register', [
  body('fname').trim().isLength({ min: 1, max: 50 }).withMessage('First name must be between 1 and 50 characters'),
  body('lname').trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be between 1 and 50 characters'),
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], async function(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  try {
      const fname = req.body.fname;
      const lname = req.body.lname;
      const email = req.body.email;
      const password = req.body.password;

      // 1. Check if the email already exists
      const emailCheckQuery = 'SELECT id FROM account WHERE email = $1';
      const emailCheckValues = [email];
      const emailCheckResult = await pool.query(emailCheckQuery, emailCheckValues);

      if (emailCheckResult.rows.length > 0) {
          return res.status(400).send('Email address already registered.');
      }
      // 2. Hash the password
     // const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
      // 3. Insert the user data into the database
      const insertQuery = `INSERT INTO account (fname, lname, email, password) VALUES($1, $2, $3, $4) RETURNING id`;
      const insertValues = [fname, lname, email, password];
      const insertResult = await pool.query(insertQuery, insertValues);

      const newUserId = insertResult.rows[0].id; // Get the ID of the newly created user
      console.log('Registration successful. New user ID:', newUserId);

      // 4. Redirect to the user's account page
      res.redirect(`/account/${newUserId}`); // Redirect to the user's account page
  } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).send('Registration failed. Please try again.');
  }
});

app.get('/account/:id', async function(req, res) {
  try {
      const id = parseInt(req.params.id);

      // 1. Fetch the account information
      const query = 'SELECT * FROM account WHERE id = $1';
      const values = [id];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
          return res.status(404).send('Account not found.');
      }

      const info = result.rows[0];

      // 2. Render the account page with the user information
      res.render('account', { info: info }); //account.ejs missing
  } catch (error) {
      console.error('Error fetching account information:', error);
      res.status(500).send('Error loading account information.');
  }
});
// Route to display product details
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await db('products').where({ id }).first();

    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.render('product_details', { product: product });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).send("Server error fetching product details");
  }
});

// Route to display the add product form
app.get('/products/add', (req, res) => {
  res.render('add_product');
});

// Route to handle the form submission and add a new product
app.post('/products', async (req, res) => {
  try {
    const { title, description, image_url, price, affiliate_link, category } = req.body;

    if (!title || !affiliate_link) {
      return res.status(400).send('Title and affiliate link are required.');
    }

    const newProduct = {
      title,
      description,
      image_url,
      price,
      affiliate_link,
      category
    };

    await db('products').insert(newProduct);
    res.redirect('/'); // Redirect to the product list after adding a product
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).send("Server error adding product");
  }
});

// app.get('/r/:referralCode', trackReferral, async (req, res) => {
//     try {
//       const { referralCode } = req.params;

//       // Validate the referral code (check if it exists in your referrals table)
//       const referral = await db('referrals').where({ referral_code: referralCode }).first();

//       if (!referral) {
//         console.warn(`Invalid referral code: ${referralCode}`);
//         return res.status(404).send('Invalid referral code.');
//       }

//       // Increment click count, update timestamp in the database, etc.
//       await db('referrals').where({ referral_code: referralCode }).update({
//         click_timestamp: new Date(),
//         // Increment a click counter if you have one
//       });

//       // Get the product based on the referral, or use the default link if that fails.
//       const productId = referral.product_id;
//       const product = await db('products').where({ id: productId }).first();
//       if(!product){
//         return res.status(404).send('Issue in processing code');
//       }

//       // Redirect the user to the actual product page
//       return res.redirect(product.link_url);

//     } catch (error) {
//       console.error("Error processing referral link:", error);
//       res.status(500).send('Error processing referral link.');
//     }
//   });
//Affiliate Code
//   router.post('/register', async (req, res) => {
//     try {
//       const { first_name, last_name, email, password } = req.body;

//       // 1. Basic validation
//       if (!first_name || !last_name || !email || !password) {
//         return res.status(400).send('All fields are required.');
//       }

//       // 2. Check if the email is already registered
//       const existingAffiliate = await db('affiliates').where({ email }).first();
//       if (existingAffiliate) {
//         return res.status(400).send('Email is already registered.');
//       }

//       // 3. Hash the password
//       const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

//       // 4. Generate a unique affiliate code
//       const affiliateCode = uuid.v4();  // Generate a UUID

//       // 5. Insert the affiliate data into the database
//       const newAffiliate = {
//         first_name,
//         last_name,
//         email,
//         password: hashedPassword,
//         affiliate_code: affiliateCode
//       };

//       await db('affiliates').insert(newAffiliate);

//       // 6. Send a welcome email (using Nodemailer or similar)
//       // TODO: Implement email sending logic here

//       res.status(201).send('Affiliate registered successfully.');

//     } catch (error) {
//       console.error("Error registering affiliate:", error);
//       res.status(500).send('Server error registering affiliate.');
//     }
//   });


app.listen(3000, function(){
    console.log('http://localhost:3000/register')
})
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
// Import the validator library
const validator = require('validator');
const LRU = require('lru-cache');
const { log } = require('util');
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

function generateReferralCode() {
  return uuid.v4(); // Generate a UUID for uniqueness
}



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


app.get('/tasks', async function(req, res) {
  try {
    const tasks = [
      {
        title: "Task One",
        description: "Kraven Kravinoff's complex relationship with his ruthless gangs most feared.",
        link: "https://t.me/bpay_coin_bot/bpay_mini_app?startapp=task_45_6294293419",
        linkText: "Task One Link",
        reward: 1.5
      },
      {
        title: "Task Two",
        description: "Kraven Kravinoff's complex relationship with his ruthless gangs most feared.",
        link: "https://example.com/task2", // Replace with your actual link
        linkText: "Task Two Link",
        reward: 3
      },
      {
        title: "Task Three",
        description: "Kraven Kravinoff's complex relationship with his ruthless gangs most feared.",
        link: "https://example.com/task3", // Replace with your actual link
        linkText: "Task Three Link",
        reward: 1
      }
    ];

    // 4. Render the Page:
    res.render('task3', { tasks: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).send('Server error fetching tasks.');
  }
});


app.get('/register', (req, res) => {
  // Extract the referral code from the query parameters
  const referral = req.query.referral;

  // Render the registration form, passing the referral code
  res.render('register', { referral: referral });
});


app.get('/referral', async (req, res) => {

    if (!req.session.user) {
      return res.redirect('/login');
    }

    const userId = req.session.user.id;
    if (isNaN(userId)) {
      return res.status(400).send("Invalid user ID.");
    }
    // Get user info, to retrieve from database. The referral code exist inside.
    const userQuery = 'SELECT referral_code FROM account WHERE id = $1';
    const userValues = [userId];
    const userResult = await pool.query(userQuery, userValues);

    const user = userResult.rows[0];
    console.log(userId);

    const referralLink = `http://${req.get('host')}/register?referral=${referral}`;

    // Render the referral page
res.render('register', { user:user })

});

app.get('/profile', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const userId = req.session.user.id;
    if (isNaN(userId)) {
      return res.status(400).send("Invalid user ID.");
    }

    // Fetch user profile data (you might already have this)
    const userQuery = 'SELECT fname, lname, email FROM account WHERE id = $1';
    const userValues = [userId];
    const userResult = await pool.query(userQuery, userValues);

    if (userResult.rows.length === 0) {
      return res.status(404).send('User not found.');
    }

    const user = userResult.rows[0];

    // Fetch the referral count for the user
    const referralCountQuery = `
      SELECT COUNT(*) AS referred_count
      FROM account
      WHERE referred_by_user_id = $1
    `;
    const referralCountValues = [userId];
    const referralCountResult = await pool.query(referralCountQuery, referralCountValues);
    const referredCount = referralCountResult.rows[0].referred_count; // Get the count


    // Render the profile page, passing user data and the referral count
    res.render('profile', {
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      referredCount: referredCount
    });

  } catch (error) {
    console.error('Error fetching profile data:', error);
    res.status(500).send('Error fetching profile data.');
  }
});

app.get('/login', async function(req,res){
  res.render('login')
})

app.get('/copy', async function(req,res){
  const query = 'SELECT * FROM account WHERE id = $1';
  const id = parseInt(req.params.id)
  const values = [id];
  const result = await pool.query(query, values); 
  const info = result.rows[0]
  res.render('copy')
})
// Task Route:
app.get('/tasks/:id', async function(req, res) {
  try {
    const query = 'SELECT * FROM account WHERE id = $1';
    const id = parseInt(req.params.id)
    const values = [id];
    const result = await pool.query(query, values); 
    const info = result.rows[0]

    res.render('task2', {info:info});
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).send('Server error fetching tasks.');
  }
});

app.get('/:id', async (req, res) => {
  try {

    const query = 'SELECT * FROM account WHERE id = $1';
    const id = parseInt(req.params.id)
    const values = [id];
    const result = await pool.query(query, values); 
    const info = result.rows[0]
    console.log(info)  // res.json(products)
   res.render('home', {info:info });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Server error fetching products");
  }
});


app.post('/login', async function(req, res) {
  try {
    const email = validator.normalizeEmail(req.body.email);
        const password = req.body.password;

    const result = await pool.query('SELECT * FROM account WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).send('Invalid email or password');
    }

    const user = result.rows[0];


    if (password) {
        // create the session object
      req.session.user = {
        id: user.id,
        email: user.email,
        fName: user.fname
      };
      // 3. Redirect to the user's account page or dashboard
      res.redirect(`/${user.id}`);
    } else {
      return res.status(401).send('Invalid email or password'); // 401 Unauthorized
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Login failed.');
  }
});




// Handle Registration Form Submission
app.post('/register', [
  body('fname').trim().isLength({ min: 1, max: 50 }).withMessage('First name must be between 1 and 50 characters'),
  body('lname').trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be between 1 and 50 characters'),
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { fname, lname, email, password } = req.body;

    const newReferralCode = generateReferralCode();

    // 3. Track which referral made this user, start as NULL
    let referredByUserId = null; // Declare it *outside* the if block
    const { referral } = req.body;

    if (referral) {
      const userQuery = 'SELECT id FROM account WHERE referral_code = $1';
      const userValues = [referral];
      const userResult = await pool.query(userQuery, userValues);

      if (userResult.rows.length > 0) {
        referredByUserId = userResult.rows[0].id;
      } else {
        console.warn(`Invalid referral code: ${referral}`);
        // Optionally, display a warning message to the user during registration
      }
    }

    // 4. Check if email already exists
    const emailCheckQuery = 'SELECT id FROM account WHERE email = $1';
    const emailCheckValues = [email];
    const emailCheckResult = await pool.query(emailCheckQuery, emailCheckValues);
    if (emailCheckResult.rows.length > 0) {
      return res.status(400).send('Email address already registered.');
    }

    // 5. Insert the user data into the database
    const insertQuery = `INSERT INTO account (fname, lname, email, password, referral_code, referred_by_user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id `;

    const insertValues = [fname, lname, email, password, newReferralCode, referredByUserId];
    const insertResult = await pool.query(insertQuery, insertValues);

    const newUserId = insertResult.rows[0].id;

    // 6. Handle new users for session data
    req.session.user = {
      id: newUserId,
      email: email,
      fName: fname
    };

    res.redirect(`/account/${newUserId}`);

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Registration failed. Please try again.');
  }
});





app.get('/account/:id', async function(req, res) {
  try {
    const accountId = parseInt(req.params.id);

    // 1. Validate user input
    if (isNaN(accountId) || accountId <= 0) {  // Ensure it's a positive integer
      return res.status(400).send("Invalid account ID. Must be a positive integer.");
    }

    // 2. Fetch the account information
    const query = 'SELECT * FROM account WHERE id = $1';
    const values = [accountId];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).send('Account not found.');
    }

    const info = result.rows[0];

    // 3. Get the number of referrals made by this account
    const referralCountQuery = `
      SELECT COUNT(*) AS referred_count
      FROM account
      WHERE referred_by_user_id = $1
    `;
    const referralCountValues = [accountId];
    const referralCountResult = await pool.query(referralCountQuery, referralCountValues);
    const referredCount = referralCountResult.rows[0].referred_count;

    // 4. Render the account page (assuming account.ejs exists)
    res.render('account', { info: info, referredCount: referredCount });

  } catch (error) {
    console.error('Error fetching account information:', error);
    res.status(500).send('Error loading account information.');
  }
});

// --- Separate function for awarding referral bonus (called during registration) ---
async function awardReferralBonus(refereeId) {
  try {
    // 1. Find the referrer (the user who referred the referee)
    const getReferrerQuery = 'SELECT referred_by_user_id FROM account WHERE id = $1';
    const referrerResult = await pool.query(getReferrerQuery, [refereeId]);

    if (referrerResult.rows.length === 0 || !referrerResult.rows[0].referred_by_user_id) {
      console.log(`No referrer found for account ID: ${refereeId}`);
      return; // No referrer, so no bonus to award.
    }

    const referrerId = referrerResult.rows[0].referred_by_user_id;

    // 2. Define the referral bonus amount
    const referralBonusAmount = 1.00;

    // 3. Start a database transaction to ensure atomicity
    await pool.query('BEGIN');

    try {
      // 4. Update the referrer's balance
      const updateBalanceQuery = 'UPDATE account SET balance = balance + $1 WHERE id = $2';
      await pool.query(updateBalanceQuery, [referralBonusAmount, referrerId]);

      // 5. Record the transaction
      const insertTransactionQuery = `
        INSERT INTO transactions (account_id, transaction_type, amount, transaction_date, related_account_id, notes)
        VALUES ($1, $2, $3, NOW(), $4, $5)
      `;
      const transactionValues = [
        referrerId,
        'referral_bonus',
        referralBonusAmount,
        refereeId, // Related account (the referee)
        `Referral bonus for referee ID: ${refereeId}`,
      ];
      await pool.query(insertTransactionQuery, transactionValues);

      // 6. Commit the transaction
      await pool.query('COMMIT');

      console.log(`Referral bonus of ${referralBonusAmount} awarded to referrer ${referrerId} for referee ${refereeId}`);

    } catch (transactionError) {
      // Rollback the transaction if any error occurred
      await pool.query('ROLLBACK');
      console.error('Error awarding referral bonus (transaction rolled back):', transactionError);
      throw transactionError; // Re-throw the error to be caught by the outer try...catch
    }

  } catch (error) {
    console.error('Error awarding referral bonus:', error);
    // Handle the error appropriately (e.g., log it, send an alert)
  }
}


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
// Display the referral link



// Make sure you have a /tasks route that handles the user ID:

// Function to approve a task submission and credit the user
async function approveTaskSubmission(submissionId) {
  try {
    // 1. Get Submission and Task Details
    const submissionQuery = `
      SELECT ts.user_id, t.reward
      FROM task_submissions ts
      JOIN tasks t ON ts.task_id = t.id
      WHERE ts.id = $1 AND ts.status = 'pending approval'
    `;
    const submissionValues = [submissionId];
    const submissionResult = await pool.query(submissionQuery, submissionValues);

    if (submissionResult.rows.length === 0) {
      console.warn(`Submission not found or already processed: ${submissionId}`);
      return false; // Indicate that the approval failed
    }

    const submission = submissionResult.rows[0];
    const userId = submission.user_id;
    const reward = submission.reward;

    // 2. Update User Balance
    const updateUserQuery = `
      UPDATE users
      SET balance = balance + $1
      WHERE id = $2
    `;
    const updateUserValues = [reward, userId];
    await pool.query(updateUserQuery, updateUserValues);

    // 3. Update Submission Status
    const updateSubmissionQuery = `
      UPDATE task_submissions
      SET status = 'approved'
      WHERE id = $1
    `;
    const updateSubmissionValues = [submissionId];
    await pool.query(updateSubmissionQuery, updateSubmissionValues);

    console.log(`Submission ${submissionId} approved. User ${userId} credited with ${reward}`);
    return true; // Indicate that the approval was successful

  } catch (error) {
    console.error("Error approving submission:", error);
    return false; // Indicate that the approval failed
  }
}


  
app.post('/api/claimReward', function(req,res){
  res.send('claimd')
})
app.listen(3000, function(){
    console.log('http://localhost:3000/register?referral=feb031fa-5bc9-47df-a8f2-5704f4245e97')
})
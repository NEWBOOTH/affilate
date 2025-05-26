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
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

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

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true }); 
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

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramUserId = msg.from.id;
  const telegramUsername = msg.from.username; // optional

  // 1. Get your application's user ID (you need to implement this)
  const applicationUserId = await getApplicationUserIdFromTelegramChatId(chatId);

  if (!applicationUserId) {
    console.error(`Could not find user in your app for chat ID ${chatId}`);
    bot.sendMessage(chatId, "Error: Could not link your Telegram account. Are you logged in on our website?");
    return;
  }

  try {
    // 2. Store Telegram info in your database
    const updateQuery = `
      UPDATE account
      SET telegram_user_id = $1, telegram_username = $2
      WHERE id = $3;
    `;
    await pool.query(updateQuery, [telegramUserId, telegramUsername, applicationUserId]);

    console.log(`Linked Telegram ID ${telegramUserId} and username @${telegramUsername} to user ID ${applicationUserId}`);
    bot.sendMessage(chatId, `Your Telegram account (@${telegramUsername}) has been successfully linked!${chatId}`);
  } catch (error) {
    console.error('Error updating Telegram info:', error);
    bot.sendMessage(chatId, "Error linking your Telegram account. Please try again later.");
  }
});
                                  
// Placeholder for your logic to get user ID from chatId
async function getApplicationUserIdFromTelegramChatId(chatId) {
  // Implement your logic here
  // For example, query your database to find user by chatId
  return 1; // Placeholder
}

app.get('/tasks/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).send('Invalid task ID.');
    }

    const result = await pool.query('SELECT * FROM account WHERE id = $1', [id]);
    const info = result.rows[0];

    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).send('Please log in.');
    }

    // Optionally, fetch user info if needed
    res.render('task2', { info });
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).send('Server error.');
  }
});
async function isUserInChannel(userId) {
  try {
    const chatMember = await bot.getChatMember('@sfdxcgbhjklkhjghfgdjkbj', userId);
    const status = chatMember.status;
    // Possible statuses: 'creator', 'administrator', 'member', 'restricted', 'left', 'kicked'
    return ['member', 'administrator', 'creator'].includes(status);
  } catch (error) {
    console.error('Error checking user membership:', error);
    // If user not found or other error, treat as not a member
    if (error.response && error.response.statusCode === 400 && error.response.body.description.includes('user not found')) {
      return false;
    }
    return false;
  }
}
app.post('/verify-task1', async (req, res) => {
  if (!req.session?.user?.id) {
    return res.status(401).send("Please log in to verify your task.");
  }

  const userId = 6294293419;

  try {
    

    const isMember = await isUserInChannel(userId);
    if (isMember) {
      res.send("You have joined the Telegram channel! Task completed.");
    } else {
      res.send("You are not a member of the Telegram channel. Please join.");
    }
  } catch (err) {
    console.error("Error verifying Telegram membership:", err);
    res.status(500).send("Error verifying membership.");
  }
});


app.get('/register', (req, res) => {
  // Extract the referral code from the query parameters
  const referral = req.query.referral;

  // Render the registration form, passing the referral code
  res.render('register', { referral: referral });
});
app.get('/link-telegram', async function(req,res){

  const result = await pool.query('SELECT * FROM account');
  const info = result.rows[0];

  res.render('teleInfo', { info })
})
app.post('/link-telegram', async (req, res) => {
  const userId = req.session.user.id; // assuming user is logged in
  const { telegram_user_id, telegram_username } = req.body;

  // Validate inputs here (e.g., check if telegram_user_id is numeric)

  try {
    await pool.query(
      'UPDATE account SET telegram_user_id = $1, telegram_username = $2 WHERE id = $3',
      [telegram_user_id, telegram_username, userId]
    );
    res.redirect('/profile'); // or wherever you want to redirect
  } catch (error) {
    console.error('Error linking Telegram account:', error);
    res.status(500).send('Internal Server Error');
  }
});




app.post('/verify-task1', async (req, res) => {
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).send("Please log in to verify your task.");
  }

  const userId = req.session.user.id;
  const userInfo = await getUserInfoFromDatabase(userId);
  if (!userInfo || !userInfo.telegram_user_id) {
    return res.send("Please connect your Telegram account first.");
  }

  const telegramUserId = userInfo.telegram_user_id;

  try {
    const isMember = await isUserInChannel(telegramUserId);
    if (isMember) {
      res.send("You have joined the Telegram channel! Task completed." + isMember);
    } else {
      res.send("You are not a member of the Telegram channel. Please join.");
    }
  } catch (error) {
    console.error("Error verifying Telegram membership:", error);
    res.status(500).send("Error verifying membership.");
  }
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
res.render('referral', { user:user })

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
    const referral= 'SELECT COUNT(*) AS referral_count FROM account WHERE referred_by_user_id = $1';
    const referralCountResult = await pool.query(referral, [accountId]);
    const referralCount = parseInt(referralCountResult.rows[0].referral_count);

    const ghValue = 0.50;
    const balance = referralCount * ghValue;

    // 3. Attach variables
    const infoBalance = balance;

    res.render('account', { info: info, referredCount: referralCount, infoBalance:infoBalance });

  } catch (error) {
    console.error('Error fetching account information:', error);
    res.status(500).send('Error loading account information.');
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




// Handle Registration Form Submission
app.post('/register', [
  body('fname').trim().isLength({ min: 1, max: 50 }).withMessage('First name must be between 1 and 50 characters'),
  body('lname').trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be between 1 and 50 characters'),
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('telegramUsername')
], async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { fname, lname, email, password, telegramUsername } = req.body;

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
    const insertQuery = `INSERT INTO account (fname, lname, email, password, referral_code, referred_by_user_id, telegram_username) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id `;

    const insertValues = [fname, lname, email, password, newReferralCode, referredByUserId, telegramUsername];
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

app.listen(3000, function(){
    console.log('http://localhost:3000/register?referral=feb031fa-5bc9-47df-a8f2-5704f4245e97')
})
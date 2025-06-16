const express = require('express');
const app = express();
const path = require('path');
const dotenv = require('dotenv');
const knex = require('knex');
const axios = require('axios');
const cors = require('cors');
const uuid = require('uuid'); 
const router = express.Router();
const session = require('express-session');
const { Pool } = require('pg');  
const { body, validationResult } = require('express-validator');
const validator = require('validator');
const LRU = require('lru-cache');
const { log } = require('util');
dotenv.config();
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const twilio = require('twilio');
const https = require('follow-redirects').https;
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
app.use(express.static(path.join(__dirname, 'public')))
// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Make sure this folder exists or create it
    },
    filename: function (req, file, cb) {
        // Use user id or timestamp + original filename to avoid conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const port = process.env.PORT || 5006

const upload = multer({ 
    storage,
    fileFilter: function(req, file, cb) {
        // Accept image files only
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password';

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
let pool;

if (process.env.DATABASE_URL) {
    // Running on Heroku or another environment with DATABASE_URL
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,  // Required for Heroku Postgres
        },
    });
} else {
    // Running locally (development)
    pool = new Pool({
        user: process.env.DB_USER || 'postgres',    // Use .env or default
        host: process.env.DB_HOST || 'localhost',  // Use .env or default
        database: process.env.DB_NAME || 'affilate', // Use .env or default
        password: process.env.DB_PASSWORD,        // Use .env - DO NOT hardcode
        port: process.env.DB_PORT || 5432,        // Use .env or default
    });
}

function generateReferralCode() {
  return uuid.v4(); 
}

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true }); 
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const accountSid = '67E540B3CAE56C3CF2B7118501A48EDE';
const authToken = 'b80fdf825696894347f120c71d77b117-076bf5fa-6509-4494-8e56-29c2800eb0c4';
const twilioPhoneNumber = '+447491163443';
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

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
    console.log(`Linked Telegram ID ${telegramUserId} and username @${telegramUsername} to user ID ${applicationUserId}`);
    bot.sendMessage(chatId, `Your Telegram account (@${telegramUsername}) has been successfully linked!${chatId}`);
  } catch (error) {
    console.error('Error updating Telegram info:', error);
    bot.sendMessage(chatId, "Error linking your Telegram account. Please try again later.");
  }
});                                 
async function getApplicationUserIdFromTelegramChatId(chatId) {
  return 1; 
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

    if (!req.session.rewardClaimed) {
      req.session.rewardClaimed = false;
  }
  if (!req.session.task4Completed) {
    req.session.task4Completed = false;
}
    // Optionally, fetch user info if needed
    res.render('task2', { info:info,rewardClaimed: req.session.rewardClaimed,task4Completed: req.session.task4Completed });
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).send('Server error.');
  }
});

app.post('/claim-reward', (req, res) => {
  req.session.rewardClaimed = true; // Mark reward as claimed
  res.redirect('/tasks');            // Redirect back to tasks or wherever appropriate
});

app.post('/mark/task4/complete', (req, res) => {
req.session.task4Completed = true;  // Mark task4 as completed in session
res.sendStatus(200);               // Respond with success status
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
};
app.get('/task', function(req,res){
  res.render('task3')
})

async function saveScreenshot({ userId, filename, path }) {
  console.log(`Saving screenshot info to DB: userId=${userId}, filename=${filename}, path=${path}`);
  return new Promise((resolve) => setTimeout(resolve, 100));
}

app.post('/submit-screenshot', upload.single('upload'), async (req, res) => {
  console.log('Session data:', req.session); // Debug session

  const userId = req.session.user.id;

 

  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  console.log(`User ${userId} uploaded file: ${req.file.filename}`);

  try {
    await saveScreenshot({ userId, filename: req.file.filename, path: req.file.path });
    res.send('Screenshot uploaded successfully!');
  } catch (error) {
    console.error('Error saving screenshot info:', error);
    res.status(500).send('Failed to save screenshot info.');
  }
});

app.get('/register', (req, res) => {
  // Extract the referral code from the query parameters
  const referral = req.query.referral;

  // Render the registration form, passing the referral code
  res.render('register', { referral: referral });
});

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

    // 6. Handle new account for session data
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

function isAdmin(req, res, next) {
  if (req.session && req.session.adminUser) {
      return next(); // User is admin, continue to route handler
  } else {
      // User is not admin, send an unauthorized response
      return res.status(403).send('Unauthorized: Admin access required.');
  }
}

app.get('/admin', isAdmin, async (req, res) => {
  try {
      const result = await pool.query(`
          SELECT 
              a.*, 
              COUNT(r.id) AS referral_count
          FROM 
              account a
          LEFT JOIN 
              account r ON r.referred_by_user_id = a.id
          GROUP BY 
              a.id
          ORDER BY 
              a.id ASC
      `);

      const users = result.rows.map(user => {
          return {
              ...user,
              balance: Number(user.referral_count) * 20
          };
      });

      res.render('admin', { users, adminUser: req.session.adminUser });
  } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.get('/link-telegram', async function(req,res){

  const result = await pool.query('SELECT * FROM account');
  const info = result.rows[0];

  res.render('teleInfo', { info })
});
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
async function getUserInfoFromDatabase(userId) {
  try {
    const query = `
      SELECT id, fname, lname, email, telegram_username, telegram_user_id
      FROM account
      WHERE id = $1
    `;
    const result = await pool.query(query, [userId]);
    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user info from database:", error);
    return null;
  }
};
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
    res.render('success', { userInfo })
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

app.get('/login', async function(req,res){
  res.render('login')
});
app.post('/login', async function(req, res) {
  try {
    const email = validator.normalizeEmail(req.body.email);
        const password = req.body.password;
        const fname = req.body.fname;

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
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.get('/admin/edit/account/:id', async function(req, res) {
  const id = req.params.id;

  try {
    // 1. Fetch a SINGLE account by ID (with referral count)
    const query = `SELECT a.*, COUNT(r.id) AS referral_count
      FROM account a
      LEFT JOIN account r ON r.referred_by_user_id = a.id
      WHERE a.id = $1
      GROUP BY a.id`;

    const result = await pool.query(query, [id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).send('User not found');
    }

    // 2. Calculate the "balance" for *this specific* account
    const balance = Number(user.referral_count) * 0.5;
    const userWithBalance = { ...user, balance: balance };

    console.log(userWithBalance);
    res.render('edit', { user: userWithBalance });  // Pass the single user with balance
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).send('DB error');
  }
});
app.post('/admin/edit/account/:id', async (req, res) => {
  const id = req.params.id;
  const { fname, verified, balance, email } = req.body;
  const verifiedInt = verified === 'on' ? 1 : 0;

  try {
    const sql = `
      UPDATE account 
      SET fname = $1, verified = $2, balance = $3, email = $4
      WHERE id = $5
    `;
    await pool.query(sql, [fname, verifiedInt, balance, email, id]);
    res.redirect('/admin');
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).send('DB error: ' + err.message);
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

// app.get('/earnings/:id', async function(req,res){
//   const id = parseInt(req.params.id);
//   const query = 'SELECT * FROM account WHERE id = $1';
//     const values = [id];
//     const result = await pool.query(query, values); 
//     const info = result.rows[0]
//     res.render('earnings', {info:info})
// })

app.get('/earnings/:id', async (req, res) => {
  try {
    const accountId = req.params.id;

    // Query to get the number of people referred by this user and tasks completed by this user
    const mainQuery = `
      SELECT
        (SELECT COUNT(*) FROM account WHERE referred_by_user_id = $1) AS people_referred,
        (SELECT COALESCE(SUM(tasks_completed), 0) FROM account WHERE id = $1) AS tasks_completed
    `;

    const result = await pool.query(mainQuery, [accountId]);

    if (result.rows.length === 0) {
      return res.status(404).send('No data found');
    }

    const data = result.rows[0];
    const peopleReferred = parseInt(data.people_referred) || 0;
    const tasksCompleted = parseInt(data.tasks_completed) || 0;
    const total = peopleReferred + tasksCompleted;

    // Render the EJS template with the data
    res.render('earnings', {
      referralCount: peopleReferred,
      tasksCompleted: tasksCompleted,
      total: total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching data from the database');
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
};

app.listen(port, () => {
  console.log(`Listening on ${port}`)
})
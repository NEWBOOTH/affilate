const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const twilioPhoneNumber = '+447491163443';
const { Pool } = require('pg');  

app.set('view engine', 'ejs');
//app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'affilate',
    password: 'LMsbffmc',
    port: 5432,
  });
  
function isAdmin(req, res, next) {
    if (req.session && req.session.adminUser) {
      return next();
    }
  }
  app.get('/one', isAdmin, async function(req,res){
    const result = await pool.query('SELECT * FROM account ORDER BY id DESC')

    res.render('admin')
  })

app.get('/register', function(req,res){
  res.render('admin')
})

app.post('/register', (req, res) => {
    const { phone } = req.body; // Assuming phone is sent from the registration form
    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    sendSMS(phone); // Call the function to send SMS
    res.json({ message: 'Verification code sent to your phone' });
});

  

app.listen(3000, () => {
    console.log('Server running on port http://localhost:3000/one');
});

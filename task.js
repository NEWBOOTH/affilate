// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse JSON request bodies

// In-memory user data store (replace with a database in a real app)
const users = {
    'user123': { balance: 100 } // Example user
};

app.get('/tasks', (req, res) => {
    try {
      res.render('tasks');
  
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
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
// API endpoint to claim the reward
app.post('/api/claimReward', (req, res) => {
    const userId = req.body.userId;

    // Validate user ID
    if (!userId || !users[userId]) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Update user balance (example: add 10 credits)
    users[userId].balance += 10;

    // Return the updated balance
    res.json({ newBalance: users[userId].balance });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

const { MongoClient } = require("mongodb");
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

// MongoDB connection URI
const uri = "mongodb+srv://<user>:<password>@ckmdb.5oxvqja.mongodb.net/?retryWrites=true&w=majority";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB client
const client = new MongoClient(uri);

// Default route
app.get('/', function(req, res) {
  res.send('Welcome to the default endpoint.');
});

// Registration endpoint
app.post('/register', async function(req, res) {
  const { username, password } = req.body;

  try {
    await client.connect();
    const database = client.db('ckmdb');
    const usersCollection = database.collection('users');

    // Insert new user into database
    await usersCollection.insertOne({ username, password });
    res.send('User registered successfully.');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('An error occurred while registering user.');
  } finally {
    await client.close();
  }
});

// Login endpoint
app.post('/login', async function(req, res) {
  const { username, password } = req.body;

  try {
    await client.connect();
    const database = client.db('ckmdb');
    const usersCollection = database.collection('users');

    // Check if user exists and credentials match
    const user = await usersCollection.findOne({ username, password });
    if (user) {
      // Set authentication cookie with short expiry time (e.g., 1 minute)
      res.cookie('authenticated', true, { maxAge: 60000 });
      res.send('Login successful. Authentication cookie set.');
    } else {
      res.status(401).send('Invalid username or password.');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('An error occurred while logging in.');
  } finally {
    await client.close();
  }
});

// Report all active cookies
app.get('/report-cookies', function(req, res) {
  const cookies = req.cookies;
  res.send('Active cookies: ' + JSON.stringify(cookies));
});

// Clear all cookies
app.get('/clear-cookies', function(req, res) {
  res.clearCookie('authenticated');
  res.send('All cookies cleared.');
});

// Start server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const JWT_SECRET = 'your_jwt_secret_key';
const userDetailsFilePath = path.join(__dirname, '../data/userDetails.json');

// Helper function to read user details from the JSON file
const readUserDetails = () => {
  if (!fs.existsSync(userDetailsFilePath)) {
    fs.writeFileSync(userDetailsFilePath, JSON.stringify([]));
  }

  try {
    const data = fs.readFileSync(userDetailsFilePath, 'utf-8');
    return JSON.parse(data || '[]'); // Handle empty file by returning an empty array
  } catch (err) {
    console.error('Error reading userDetails.json:', err);
    return []; // Return an empty array if the file is corrupted
  }
};

// Helper function to write user details to the JSON file
const writeUserDetails = (users) => {
  fs.writeFileSync(userDetailsFilePath, JSON.stringify(users, null, 2));
};

// Updated Register Route
router.post('/register', async (req, res) => {
  const { username, password, company, address, contact } = req.body;

  try {
    const users = readUserDetails();

    // Check if the user already exists
    if (users.find((u) => u.username === username)) {
      return res.status(400).send('User already exists');
    }

    // Hash the password and save the user
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword, company, address, contact });
    writeUserDetails(users);

    res.status(201).send('User registered');
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const users = readUserDetails();

    // Find the user in the JSON file
    const user = users.find((u) => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid credentials');
    }

    // Determine the user's role (e.g., admin or user)
    const role = username === 'admin' ? 'admin' : 'user';

    // Generate a JWT token with the role included
    const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: '1h' });

    // Respond with the token and role
    res.json({ token, role });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Verify token middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send('Access Token Required');
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send('Invalid Token');
    }
    req.user = user;
    next();
  });
};

// Update Profile Route
router.put('/profile', authenticateToken, (req, res) => {
  const { username } = req.user; // Extract username from the token
  const { company, address, contact } = req.body;

  try {
    const users = readUserDetails();

    // Find the user and update their details
    const userIndex = users.findIndex((u) => u.username === username);
    if (userIndex === -1) {
      return res.status(404).send('User not found');
    }

    users[userIndex] = { ...users[userIndex], company, address, contact };
    writeUserDetails(users);

    res.status(200).send('Profile updated successfully');
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Fetch Profile Route
router.get('/profile', authenticateToken, (req, res) => {
  const { username } = req.user;

  try {
    const users = readUserDetails();
    const user = users.find((u) => u.username === username);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const { company, address, contact } = user;
    res.json({ company, address, contact });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = { router, authenticateToken };
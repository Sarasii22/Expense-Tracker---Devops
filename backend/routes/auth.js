const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const trimmedEmail = email.trim().toLowerCase(); // Normalize email
  try {
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const user = new User({ username, email: trimmedEmail, password });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, user: { id: user._id, username, email: trimmedEmail } });
  } catch (err) {
    console.error(err); // Use console.error for better logging
    if (err.name === 'MongoServerError' && err.code === 11000) {
      return res.status(400).json({ message: 'User already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Login (with debug logs)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const trimmedEmail = email.trim().toLowerCase();
  console.log(`Login attempt with email: ${trimmedEmail}`); // Debug
  try {
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      console.log(`User not found for email: ${trimmedEmail}`); // Debug
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    console.log(`User found: ${user._id}, checking password...`); // Debug
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`Password mismatch for user: ${user._id}`); // Debug
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, username: user.username, email: trimmedEmail } });
  } catch (err) {
    console.error(`Login error: ${err.message}`); // Improved
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
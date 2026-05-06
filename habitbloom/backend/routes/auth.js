const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Habit = require('../models/Habit');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

const safeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  greetingName: user.greetingName,
  avatar: user.avatar,
  gender: user.gender,
});

const createDefaultHabits = async (userId) => {
  const defaults = [
    {
      userId, title: 'Drink Water',
      description: 'Stay hydrated throughout the day',
      icon: '💧', color: '#60a5fa', frequency: 'daily',
      type: 'default', defaultType: 'water',
      inputType: 'slider', unit: 'liters', maxValue: 10,
    },
    {
      userId, title: 'Study',
      description: 'Learn something new today',
      icon: '📚', color: '#a78bfa', frequency: 'daily',
      type: 'default', defaultType: 'study',
      inputType: 'number', unit: 'hours', maxValue: 24,
    },
    {
      userId, title: 'Workout / Play Sport',
      description: 'Move your body and stay active',
      icon: '🏃', color: '#34d399', frequency: 'daily',
      type: 'default', defaultType: 'workout',
      inputType: 'checkbox', unit: '', maxValue: 1,
    },
  ];
  await Habit.insertMany(defaults);
};

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, greetingName } = req.body;

    // Manual required-field check (gives clear message before Mongoose validation)
    const missing = [];
    if (!username)     missing.push('username');
    if (!email)        missing.push('email');
    if (!password)     missing.push('password');
    if (!greetingName) missing.push('greetingName');
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check for existing user before trying to insert (cleaner error message)
    const existing = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { username: username.toLowerCase().trim() },
      ],
    });
    if (existing) {
      const field = existing.email === email.toLowerCase().trim() ? 'Email' : 'Username';
      return res.status(400).json({
        success: false,
        message: `${field} is already registered`,
      });
    }

    const user = await User.create({ username, email, password, greetingName });
    await createDefaultHabits(user._id);

    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user: safeUser(user) });

  } catch (err) {
    console.error('Signup error:', err);

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ success: false, message });
    }

    // Mongo duplicate key (race condition safety net)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: err.message || 'Server error during signup',
    });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your username/email and password',
      });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { username: identifier.toLowerCase().trim() },
      ],
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials — check your username/email and password',
      });
    }

    const token = generateToken(user._id);
    res.json({ success: true, token, user: safeUser(user) });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during login',
    });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: safeUser(req.user) });
});

// ── PUT /api/auth/update-profile ──────────────────────────────────────────────
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { greetingName, username, avatar, gender } = req.body;
    const updates = {};
    if (greetingName !== undefined) updates.greetingName = greetingName;
    if (username     !== undefined) updates.username     = username;
    if (avatar       !== undefined) updates.avatar       = avatar;
    if (gender       !== undefined) updates.gender       = gender;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true, runValidators: true,
    });

    res.json({ success: true, user: safeUser(user) });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ success: false, message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/auth/change-password ─────────────────────────────────────────────
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS — allow all origins in dev, restrict in prod
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.CLIENT_URL || 'http://localhost:3000')
    : true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/logs',   require('./routes/logs'));

// Health / debug check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HabitBloom API is running',
    mongoState: mongoose.connection.readyState,
  });
});

// Global error handler — surfaces Mongoose errors properly
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message).join(', ');
    return res.status(400).json({ success: false, message: messages });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    const label = field.charAt(0).toUpperCase() + field.slice(1);
    return res.status(400).json({ success: false, message: `${label} already exists` });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set in your .env file!');
  console.error('Copy backend/.env.example to backend/.env and fill it in.');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`HabitBloom server running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

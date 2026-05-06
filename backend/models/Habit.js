const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Habit title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  icon: {
    type: String,
    default: '✨'
  },
  color: {
    type: String,
    default: '#f9a8d4'
  },
  frequency: {
    type: String,
    enum: ['daily', 'alternate', 'specific'],
    default: 'daily'
  },
  specificDays: {
    type: [String],
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    default: []
  },
  type: {
    type: String,
    enum: ['default', 'custom'],
    default: 'custom'
  },
  defaultType: {
    type: String,
    enum: ['water', 'study', 'workout', null],
    default: null
  },
  inputType: {
    type: String,
    enum: ['checkbox', 'slider', 'number'],
    default: 'checkbox'
  },
  unit: {
    type: String,
    default: ''
  },
  maxValue: {
    type: Number,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Habit', habitSchema);

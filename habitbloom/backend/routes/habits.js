const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/habits
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true }).sort({ createdAt: 1 });
    res.json({ success: true, habits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/habits
router.post('/', async (req, res) => {
  try {
    const { title, description, icon, color, frequency, specificDays, inputType, unit, maxValue } = req.body;
    const habit = await Habit.create({
      userId: req.user._id,
      title, description,
      icon: icon || '✨',
      color: color || '#f9a8d4',
      frequency: frequency || 'daily',
      specificDays: specificDays || [],
      type: 'custom',
      inputType: inputType || 'checkbox',
      unit: unit || '',
      maxValue: maxValue || 1,
    });
    res.status(201).json({ success: true, habit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/habits/:id
router.put('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    Object.keys(req.body).forEach(key => { habit[key] = req.body[key]; });
    await habit.save();
    res.json({ success: true, habit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/habits/:id
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    habit.isActive = false;
    await habit.save();
    res.json({ success: true, message: 'Habit deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/habits/stats/overview
router.get('/stats/overview', async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true });
    const habitIds = habits.map(h => h._id);

    const logs = await HabitLog.find({
      userId: req.user._id,
      habitId: { $in: habitIds },
    }).sort({ date: -1 });

    // Group logs by date
    const logsByDate = {};
    logs.forEach(log => {
      if (!logsByDate[log.date]) logsByDate[log.date] = [];
      logsByDate[log.date].push(log);
    });

    const todayStr = new Date().toISOString().split('T')[0];

    // ── Streak calculation ───────────────────────────────────────────────────
    // Rules:
    //   - A day "counts" if at least 1 habit was logged on it.
    //   - We walk backwards from yesterday (not today) to build the base streak,
    //     because today is still in progress — the user may log more habits.
    //   - If today already has at least 1 log, we add 1 to the streak on top.
    //   - Unchecking a habit today never reduces the streak because we only
    //     count today as a bonus if it has ANY log, regardless of unchecks.

    let baseStreak = 0;       // consecutive days BEFORE today
    let longestStreak = 0;
    let runningLongest = 0;

    // Walk from yesterday backwards
    for (let i = 1; i <= 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      if (logsByDate[dateStr] && logsByDate[dateStr].length > 0) {
        baseStreak++;
        runningLongest++;
        if (runningLongest > longestStreak) longestStreak = runningLongest;
      } else {
        runningLongest = 0;
        break; // streak broken
      }
    }

    // If today has at least one log, add it on top
    const todayHasLog = logsByDate[todayStr] && logsByDate[todayStr].length > 0;
    const currentStreak = todayHasLog ? baseStreak + 1 : baseStreak;

    // Update longestStreak if currentStreak exceeds it
    if (currentStreak > longestStreak) longestStreak = currentStreak;

    // Today's stats
    const todayLogs = logsByDate[todayStr] || [];
    const completedToday = todayLogs.length;
    const totalHabits = habits.length;

    res.json({
      success: true,
      stats: {
        currentStreak,
        longestStreak,
        completedToday,
        totalHabits,
        completionRate: totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

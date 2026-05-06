const express = require('express');
const router = express.Router();
const HabitLog = require('../models/HabitLog');
const Habit = require('../models/Habit');
const { protect } = require('../middleware/auth');

router.use(protect);

// POST /api/logs - toggle log (create or undo)
router.post('/', async (req, res) => {
  try {
    const { habitId, date, status, value } = req.body;
    const habit = await Habit.findOne({ _id: habitId, userId: req.user._id });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });

    const existingLog = await HabitLog.findOne({ habitId, userId: req.user._id, date });
    if (existingLog) {
      await HabitLog.deleteOne({ _id: existingLog._id });
      return res.json({ success: true, action: 'removed', log: null });
    }

    const log = await HabitLog.create({
      habitId,
      userId: req.user._id,
      date,
      status: status || 'completed',
      value: value || 1,
    });

    res.status(201).json({ success: true, action: 'created', log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/logs - upsert a log value
router.put('/', async (req, res) => {
  try {
    const { habitId, date, value, status } = req.body;
    const log = await HabitLog.findOneAndUpdate(
      { habitId, userId: req.user._id, date },
      { value, status: status || 'completed', completedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/logs - get logs for a date range
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, habitId } = req.query;
    const query = { userId: req.user._id };
    if (startDate && endDate) query.date = { $gte: startDate, $lte: endDate };
    if (habitId) query.habitId = habitId;
    const logs = await HabitLog.find(query).populate('habitId', 'title icon color');
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/logs/calendar - yearly 365-day grid
// Query params: year  (defaults to current year)
router.get('/calendar', async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const habits = await Habit.find({ userId: req.user._id, isActive: true });
    const totalHabits = habits.length;

    const logs = await HabitLog.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    });

    const logsByDate = {};
    logs.forEach((log) => {
      logsByDate[log.date] = (logsByDate[log.date] || 0) + 1;
    });

    const calendarData = [];
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year}-12-31`);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const completed = logsByDate[dateStr] || 0;
      calendarData.push({
        date: dateStr,
        completed,
        total: totalHabits,
        rate: totalHabits > 0 ? completed / totalHabits : 0,
      });
    }

    res.json({ success: true, calendarData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/logs/analytics
router.get('/analytics', async (req, res) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const [quantifiedHabitsList, currentLogs, prevLogs, recentLogs] = await Promise.all([
      Habit.find({
        userId: req.user._id,
        isActive: true,
        $or: [
          { defaultType: { $in: ['water', 'study'] } },
          { inputType: { $in: ['number', 'slider'] } },
        ],
      }),
      HabitLog.find({ userId: req.user._id, date: { $gte: currentMonthStart, $lte: currentMonthEnd } }).populate('habitId'),
      HabitLog.find({ userId: req.user._id, date: { $gte: prevMonthStart, $lte: prevMonthEnd } }).populate('habitId'),
      HabitLog.find({ userId: req.user._id, date: { $gte: thirtyDaysAgoStr } }).populate('habitId'),
    ]);

    const isQuantifiedHabit = (habit) =>
      habit && (habit.defaultType === 'water' || habit.defaultType === 'study' || ['number', 'slider'].includes(habit.inputType));

    const quantifiedHabitsMap = new Map();

    quantifiedHabitsList.forEach((habit) => {
      const habitId = String(habit._id);
      quantifiedHabitsMap.set(habitId, {
        habitId,
        title: habit.title,
        unit: habit.unit || '',
        color: habit.color || '#9B3C27',
        icon: habit.icon || '*',
        inputType: habit.inputType,
        defaultType: habit.defaultType || null,
        dataByDate: {},
      });
    });

    recentLogs.filter((log) => isQuantifiedHabit(log.habitId)).forEach((log) => {
      const habitId = String(log.habitId._id);
      const habit = quantifiedHabitsMap.get(habitId);
      if (!habit) return;
      habit.dataByDate[log.date] = log.value;
    });

    const weeklyData = [];
    for (let w = 6; w >= 0; w--) {
      const d = new Date(now);
      d.setDate(d.getDate() - w);
      const dateStr = d.toISOString().split('T')[0];
      weeklyData.push({
        date: dateStr,
        day: d.toLocaleDateString('en', { weekday: 'short' }),
        completed: recentLogs.filter((log) => log.date === dateStr).length,
      });
    }

    const getMonthTotal = (logs, habitId) =>
      logs
        .filter((log) => String(log.habitId?._id) === habitId)
        .reduce((sum, log) => sum + (log.value || 0), 0);

    const quantifiedHabits = Array.from(quantifiedHabitsMap.values())
      .map((habit) => {
        const data = Object.entries(habit.dataByDate)
          .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
          .map(([date, value]) => ({ date, value }))
          .slice(-14);

        const current = getMonthTotal(currentLogs, habit.habitId);
        const prev = getMonthTotal(prevLogs, habit.habitId);

        return {
          habitId: habit.habitId,
          title: habit.title,
          unit: habit.unit,
          color: habit.color,
          icon: habit.icon,
          inputType: habit.inputType,
          defaultType: habit.defaultType,
          data,
          comparison: {
            current,
            prev,
            diff: current - prev,
          },
        };
      })
      .sort((a, b) => {
        const priority = { water: 0, study: 1 };
        const aPriority = priority[a.defaultType] ?? 2;
        const bPriority = priority[b.defaultType] ?? 2;
        if (aPriority !== bPriority) return aPriority - bPriority;
        return a.title.localeCompare(b.title);
      });

    const waterHabit = quantifiedHabits.find((habit) => habit.defaultType === 'water');
    const studyHabit = quantifiedHabits.find((habit) => habit.defaultType === 'study');

    res.json({
      success: true,
      analytics: {
        waterData: waterHabit?.data || [],
        studyData: studyHabit?.data || [],
        weeklyData,
        quantifiedHabits,
        comparison: {
          water: waterHabit?.comparison || { current: 0, prev: 0, diff: 0 },
          study: studyHabit?.comparison || { current: 0, prev: 0, diff: 0 },
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2, TrendingUp, Trophy, Sprout } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getGreeting, getTodayStr, getMotivationMessage } from '../utils/helpers.js';
import api from '../utils/api.js';
import HabitCard from '../components/habits/HabitCard.jsx';
import StreakPopup from '../components/common/StreakPopup.jsx';
import EodReminder from '../components/common/EodReminder.jsx';
import { toast } from '../components/common/Toast.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const STAT_ICONS = {
  streak:     <Flame       size={26} color="white" strokeWidth={1.8} />,
  done:       <CheckCircle2 size={26} color="white" strokeWidth={1.8} />,
  completion: <TrendingUp  size={26} color="white" strokeWidth={1.8} />,
  best:       <Trophy      size={26} color="white" strokeWidth={1.8} />,
};

const StatCard = ({ iconKey, label, value, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="card"
    style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}
  >
    <div style={{
      width: 52, height: 52, borderRadius: 16,
      background: gradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {STAT_ICONS[iconKey]}
    </div>
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{value}</p>
    </div>
  </motion.div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ currentStreak: 0, completedToday: 0, totalHabits: 0, completionRate: 0, longestStreak: 0 });
  const [loading, setLoading] = useState(true);
  const [showStreak, setShowStreak] = useState(false);
  const [showEod, setShowEod] = useState(false);
  const eodTimerRef = useRef(null);
  const today = getTodayStr();
  const completedTodaySet = useRef(new Set());

  useEffect(() => { loadData(); return () => clearTimeout(eodTimerRef.current); }, []);
  useEffect(() => { if (!habits.length) return; scheduleEodReminder(habits, logs); }, [habits, logs]);

  const scheduleEodReminder = (currentHabits, currentLogs) => {
    clearTimeout(eodTimerRef.current);
    const now = new Date();
    const hours = now.getHours();
    const completedIds = new Set(currentLogs.map(l => l.habitId?._id || l.habitId));
    const incompleteCount = currentHabits.filter(h => !completedIds.has(h._id)).length;
    if (incompleteCount === 0) return;
    if (hours >= 20) {
      const shownKey = `eod_shown_${today}`;
      if (!sessionStorage.getItem(shownKey)) { sessionStorage.setItem(shownKey, '1'); setShowEod(true); }
      return;
    }
    const eightPm = new Date(); eightPm.setHours(20, 0, 0, 0);
    eodTimerRef.current = setTimeout(() => {
      const shownKey = `eod_shown_${today}`;
      if (!sessionStorage.getItem(shownKey)) { sessionStorage.setItem(shownKey, '1'); setShowEod(true); }
    }, eightPm - now);
  };

  const loadData = async () => {
    try {
      const [habitsRes, logsRes, statsRes] = await Promise.all([
        api.get('/habits'),
        api.get(`/logs?startDate=${today}&endDate=${today}`),
        api.get('/habits/stats/overview'),
      ]);
      setHabits(habitsRes.data.habits);
      const fetchedLogs = logsRes.data.logs;
      setLogs(fetchedLogs);
      setStats(statsRes.data.stats);
      fetchedLogs.forEach(l => { const id = l.habitId?._id || l.habitId; if (id) completedTodaySet.current.add(String(id)); });
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleToggle = async (habit, value) => {
    const habitIdStr = String(habit._id);
    const existingLog = logs.find(l => l.habitId?._id === habit._id || l.habitId === habit._id);
    try {
      if (habit.inputType === 'checkbox') {
        const res = await api.post('/logs', { habitId: habit._id, date: today, value: 1 });
        if (res.data.action === 'created') {
          setLogs(prev => [...prev, res.data.log]);
          const isFirstTimeToday = !completedTodaySet.current.has(habitIdStr);
          completedTodaySet.current.add(habitIdStr);
          if (isFirstTimeToday) {
            const statsRes = await api.get('/habits/stats/overview');
            setStats(statsRes.data.stats);
            setShowStreak(true);
            setTimeout(() => setShowStreak(false), 2500);
            toast.streak('Habit completed!');
          } else {
            setStats(s => ({ ...s, completedToday: s.completedToday + 1 }));
            toast.success('Habit re-checked');
          }
        } else {
          setLogs(prev => prev.filter(l => l.habitId?._id !== habit._id && l.habitId !== habit._id));
          setStats(s => ({ ...s, completedToday: Math.max(0, s.completedToday - 1) }));
          toast.info('Habit unchecked');
        }
      } else {
        const res = await api.put('/logs', { habitId: habit._id, date: today, value, status: 'completed' });
        if (existingLog) {
          setLogs(prev => prev.map(l => (l.habitId?._id === habit._id || l.habitId === habit._id) ? res.data.log : l));
          toast.success(`Updated to ${value} ${habit.unit || ''}`);
        } else {
          setLogs(prev => [...prev, res.data.log]);
          const isFirstTimeToday = !completedTodaySet.current.has(habitIdStr);
          completedTodaySet.current.add(habitIdStr);
          if (isFirstTimeToday) {
            const statsRes = await api.get('/habits/stats/overview');
            setStats(statsRes.data.stats);
            setShowStreak(true);
            setTimeout(() => setShowStreak(false), 2500);
          } else { setStats(s => ({ ...s, completedToday: s.completedToday + 1 })); }
          toast.success(`Logged ${value} ${habit.unit || ''}`);
        }
      }
    } catch { toast.error('Failed to update habit'); }
  };

  const isCompleted = (habit) => logs.some(l => l.habitId?._id === habit._id || l.habitId === habit._id);
  const getLogValue = (habit) => { const log = logs.find(l => l.habitId?._id === habit._id || l.habitId === habit._id); return log?.value || 0; };
  const incompleteCount = habits.filter(h => !isCompleted(h)).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <StreakPopup show={showStreak} streak={stats.currentStreak} />
      <EodReminder show={showEod} incomplete={incompleteCount} onDismiss={() => setShowEod(false)} />

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          {getGreeting(user?.greetingName)}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>
          {getMotivationMessage(stats.completedToday, stats.totalHabits, stats.currentStreak)}
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard iconKey="streak"     label="Current Streak" value={`${stats.currentStreak}d`}                        gradient="linear-gradient(135deg, #EB7347, #FFA85D)" delay={0.10} />
        <StatCard iconKey="done"       label="Done Today"      value={`${stats.completedToday}/${stats.totalHabits}`}  gradient="linear-gradient(135deg, #2D3A38, #4a6461)" delay={0.15} />
        <StatCard iconKey="completion" label="Completion"      value={`${stats.completionRate}%`}                      gradient="linear-gradient(135deg, #CB9650, #D5B16C)" delay={0.20} />
        <StatCard iconKey="best"       label="Best Streak"     value={`${stats.longestStreak}d`}                       gradient="linear-gradient(135deg, #9B3C27, #EB7347)" delay={0.25} />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>Today's Habits</h2>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', background: 'rgba(155,60,39,0.08)', padding: '4px 12px', borderRadius: 100 }}>
            {new Date().toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {habits.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, color: 'var(--accent-secondary)' }}>
              <Sprout size={48} strokeWidth={1.5} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No habits yet. Go to Habits to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {habits.map((habit, i) => (
              <motion.div key={habit._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                <HabitCard habit={habit} completed={isCompleted(habit)} logValue={getLogValue(habit)} onToggle={handleToggle} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardPage;

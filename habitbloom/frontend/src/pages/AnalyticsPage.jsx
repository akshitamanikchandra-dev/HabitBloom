import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { Droplets, BookOpen, Sparkles, Trophy } from 'lucide-react';
import api from '../utils/api.js';
import CalendarGrid from '../components/analytics/CalendarGrid.jsx';
import { toast } from '../components/common/Toast.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const INSIGHT_ICONS = {
  water: <Droplets size={24} color="#60a5fa" />,
  study: <BookOpen size={24} color="#a78bfa" />,
  default: <Sparkles size={24} color="var(--accent-primary)" />,
};

const DEFAULT_CHART_COLORS = ['#60a5fa', '#a78bfa', '#f97316', '#34d399', '#f472b6', '#fbbf24'];

const InsightCard = ({ iconKey, message, color }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
    className="card"
    style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, borderLeft: `4px solid ${color}` }}
  >
    {INSIGHT_ICONS[iconKey] || INSIGHT_ICONS.default}
    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{message}</p>
  </motion.div>
);

const ChartCard = ({ title, icon, children }) => (
  <div className="card" style={{ padding: 24 }}>
    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
      {icon} {title}
    </h3>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: 12, padding: '10px 14px', boxShadow: 'var(--shadow-md)' }}>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ fontSize: 14, fontWeight: 700, color: entry.color }}>{entry.value} {entry.name}</p>
      ))}
    </div>
  );
};

const getHabitColor = (habit, index) => habit.color || DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length];
const getHabitDisplayName = (habit) => habit?.title || 'Habit';
const formatValueWithUnit = (value, unit) => `${value}${unit ? ` ${unit}` : ''}`;
const getTrendWord = (unit = '') => {
  const normalizedUnit = unit.trim().toLowerCase();
  if (normalizedUnit.includes('hour')) return 'logged';
  if (normalizedUnit.includes('liter') || normalizedUnit === 'l' || normalizedUnit.includes('ml')) return 'tracked';
  return 'logged';
};
const getInsightIconKey = (habit) => {
  if (habit.defaultType === 'water') return 'water';
  if (habit.defaultType === 'study') return 'study';
  return 'default';
};
const getGradientId = (habitId) => `habitGrad-${habitId}`;
const ChartIcon = ({ habit }) => {
  if (habit.defaultType === 'water') return <Droplets size={16} color={habit.color} />;
  if (habit.defaultType === 'study') return <BookOpen size={16} color={habit.color} />;
  return <span style={{ fontSize: 16, lineHeight: 1 }}>{habit.icon || '✨'}</span>;
};

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAnalytics(); }, []);

  const loadAnalytics = async () => {
    try {
      const { data } = await api.get('/logs/analytics');
      setAnalytics(data.analytics);
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner />;

  const { quantifiedHabits = [], weeklyData = [] } = analytics || {};

  const insights = quantifiedHabits.flatMap((habit, index) => {
    const diff = habit.comparison?.diff || 0;
    if (diff === 0) return [];

    const trendWord = getTrendWord(habit.unit);
    const direction = diff > 0 ? 'more' : 'less';
    const toneColor = diff > 0 ? getHabitColor(habit, index) : '#f87171';
    const encouragement =
      diff > 0
        ? `${trendWord.charAt(0).toUpperCase() + trendWord.slice(1)} ${direction} than last month. Nice work!`
        : `${trendWord.charAt(0).toUpperCase() + trendWord.slice(1)} ${direction} than last month. Let's build it back up.`;

    return [{
      iconKey: getInsightIconKey(habit),
      message: `${getHabitDisplayName(habit)}: ${formatValueWithUnit(Math.abs(diff).toFixed(1), habit.unit)} ${direction} than last month. ${encouragement}`,
      color: toneColor,
    }];
  });
  if (insights.length === 0) insights.push({ iconKey: 'default', message: 'Start logging your habits to see personalized insights!', color: 'var(--accent-primary)' });

  const tickStyle = { fill: 'var(--text-muted)', fontSize: 11, fontWeight: 600 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>Your habit progress at a glance</p>
      </motion.div>

      <section>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={14} /> Insights
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
        </div>
      </section>

      <ChartCard title="Weekly Performance" icon={<Trophy size={16} color="var(--accent-primary)" />}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="day" tick={tickStyle} />
            <YAxis tick={tickStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="completed" name="habits" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-primary)" />
                <stop offset="100%" stopColor="var(--accent-tertiary)" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {quantifiedHabits.length === 0 ? (
          <ChartCard title="Quantified Habits" icon={<Sparkles size={16} color="var(--accent-primary)" />}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
              No number or slider habit data yet. Start logging!
            </p>
          </ChartCard>
        ) : quantifiedHabits.map((habit, index) => {
          const chartColor = getHabitColor(habit, index);
          const gradientId = getGradientId(habit.habitId);
          const unitLabel = habit.unit || 'value';

          return (
            <ChartCard
              key={habit.habitId}
              title={getHabitDisplayName(habit)}
              icon={<ChartIcon habit={{ ...habit, color: chartColor }} />}
            >
              {habit.data.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
                  No {getHabitDisplayName(habit).toLowerCase()} data yet. Start logging!
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={habit.data} margin={{ top: 0, right: 0, bottom: 0, left: -25 }}>
                    <defs>
                      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={tickStyle} />
                    <YAxis tick={tickStyle} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name={unitLabel}
                      stroke={chartColor}
                      strokeWidth={2.5}
                      fill={`url(#${gradientId})`}
                      dot={{ fill: chartColor, r: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          );
        })}
      </div>

      <CalendarGrid />
    </div>
  );
};

export default AnalyticsPage;

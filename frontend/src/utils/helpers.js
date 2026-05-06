export const getGreeting = (name) => {
  const hour = new Date().getHours();
  if (hour < 12) return `Good Morning, ${name} ☀️`;
  if (hour < 17) return `Good Afternoon, ${name} 🌸`;
  if (hour < 21) return `Good Evening, ${name} 🌙`;
  return `Good Night, ${name} ✨`;
};

export const getTodayStr = () => new Date().toISOString().split('T')[0];

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en', {
    month: 'short', day: 'numeric'
  });
};

export const getMotivationMessage = (completedCount, totalCount, streak) => {
  const rate = totalCount > 0 ? completedCount / totalCount : 0;
  if (rate === 1) return "Perfect day! You're unstoppable! 🔥";
  if (rate >= 0.7) return "You're doing amazing! Keep going 💪";
  if (rate >= 0.4) return "Good progress! Finish strong 🌸";
  if (streak > 0) return `Don't break your ${streak}-day streak 😭`;
  return "Every habit counts. Start now! 🌱";
};

export const AVATAR_OPTIONS = [
  { id: 'cat', emoji: '🐱', label: 'Cat' },
  { id: 'bunny', emoji: '🐰', label: 'Bunny' },
  { id: 'bear', emoji: '🐻', label: 'Bear' },
  { id: 'fox', emoji: '🦊', label: 'Fox' },
  { id: 'panda', emoji: '🐼', label: 'Panda' },
];

export const getAvatarEmoji = (avatarId) => {
  return AVATAR_OPTIONS.find(a => a.id === avatarId)?.emoji || '🐱';
};

export const HABIT_ICONS = ['✨', '💧', '📚', '🏃', '🎯', '🎨', '🎵', '🧘', '🌿', '💊', '😴', '🍎', '🧠', '❤️', '🌟', '🔥'];
export const HABIT_COLORS = [
  '#f9a8d4', '#fb923c', '#fbbf24', '#34d399',
  '#60a5fa', '#a78bfa', '#f472b6', '#2dd4bf',
  '#4ade80', '#f87171', '#c084fc', '#38bdf8'
];

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

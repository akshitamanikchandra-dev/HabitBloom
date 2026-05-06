import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      style={{
        width: '100%', padding: '8px 12px',
        borderRadius: 12, border: '1.5px solid var(--border-color)',
        background: 'var(--bg-card)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
        transition: 'all 0.2s',
      }}
    >
      {isDark ? <Moon size={16} /> : <Sun size={16} />}
      {isDark ? 'Dark Mode' : 'Light Mode'}
    </motion.button>
  );
};

export default ThemeToggle;

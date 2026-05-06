import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Check } from 'lucide-react';

const HabitCard = ({ habit, completed, logValue, onToggle }) => {
  const [numberValue, setNumberValue] = useState(logValue || 0);

  const handleCheckbox = () => onToggle(habit, 1);
  const handleNumberCommit = () => { if (numberValue > 0) onToggle(habit, numberValue); };
  const isNumeric = habit.inputType === 'slider' || habit.inputType === 'number';

  return (
    <motion.div
      layout animate={{ opacity: completed ? 0.65 : 1 }} transition={{ duration: 0.3 }}
      className="card" style={{ padding: '16px 20px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: habit.color + '22', border: `2px solid ${habit.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
        }}>
          {habit.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <h3 style={{
              fontSize: 15, fontWeight: 700, color: 'var(--text-primary)',
              textDecoration: completed && !isNumeric ? 'line-through' : 'none',
            }}>
              {habit.title}
            </h3>
            {completed && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <CheckCircle2 size={16} color={habit.color} strokeWidth={2.5} />
              </motion.span>
            )}
          </div>

          {habit.description && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: isNumeric ? 6 : 0 }}>
              {habit.description}
            </p>
          )}

          {isNumeric && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: habit.description ? 0 : 6 }}>
              <input
                type="number" min={0} max={habit.maxValue} step={0.5}
                value={numberValue}
                onChange={e => setNumberValue(parseFloat(e.target.value) || 0)}
                style={{
                  width: 72, padding: '5px 9px', borderRadius: 8,
                  border: `1.5px solid ${habit.color}55`,
                  background: 'var(--bg-input)', color: 'var(--text-primary)',
                  fontSize: 13, fontWeight: 700,
                }}
              />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{habit.unit}</span>
              <motion.button
                whileTap={{ scale: 0.9 }} onClick={handleNumberCommit}
                style={{
                  padding: '5px 14px', borderRadius: 8,
                  background: habit.color + '22', border: `1.5px solid ${habit.color}44`,
                  color: 'var(--text-primary)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >Log</motion.button>
              {completed && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                  ({logValue} {habit.unit} logged)
                </span>
              )}
            </div>
          )}
        </div>

        {!isNumeric && (
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }}
            onClick={handleCheckbox}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              border: `2.5px solid ${completed ? habit.color : 'var(--border-color)'}`,
              background: completed ? habit.color : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0,
            }}
          >
            {completed && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Check size={16} color="white" strokeWidth={3} />
              </motion.span>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default HabitCard;

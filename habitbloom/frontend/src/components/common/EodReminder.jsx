import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlarmClock, Frown, ArrowRight } from 'lucide-react';

const EodReminder = ({ show, incomplete, onDismiss }) => (
  <AnimatePresence>
    {show && (
      <div className="modal-overlay" style={{ zIndex: 9000 }} onClick={onDismiss}>
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg-card)', borderRadius: 24,
            padding: '36px 32px', maxWidth: 400, width: '100%',
            textAlign: 'center',
            border: '1.5px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <motion.div
            animate={{ rotate: [0, -12, 12, -12, 12, 0] }}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: 'var(--accent-secondary)' }}
          >
            <AlarmClock size={56} strokeWidth={1.5} />
          </motion.div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            End of Day Reminder!
          </h2>

          <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.6, marginBottom: 20 }}>
            You still have{' '}
            <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>
              {incomplete} habit{incomplete !== 1 ? 's' : ''}
            </span>{' '}
            left to complete today.<br />
            Don't let your streak slip!{' '}
            <Frown size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </p>

          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 14,
            padding: '14px 16px', marginBottom: 22, textAlign: 'left',
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Remaining today
            </p>
            {incomplete > 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                You have {incomplete} habit{incomplete !== 1 ? 's' : ''} still pending. Head to the dashboard to log them!
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onDismiss}
              style={{
                flex: 1, padding: '11px',
                background: 'var(--gradient-primary)',
                color: 'white', border: 'none', borderRadius: 12,
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <ArrowRight size={15} /> Go Log Habits
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onDismiss}
              style={{
                padding: '11px 16px', background: 'transparent',
                color: 'var(--text-muted)', border: '1.5px solid var(--border-color)',
                borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Later
            </motion.button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default EodReminder;

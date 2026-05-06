import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';

const StreakPopup = ({ show, streak }) => (
  <AnimatePresence>
    {show && (
      <div className="streak-popup">
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: -50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{
            background: 'linear-gradient(135deg, #fb923c, #f97316)',
            padding: '20px 32px', borderRadius: 24,
            textAlign: 'center',
            boxShadow: '0 8px 40px rgba(251, 146, 60, 0.5)',
            border: '2px solid rgba(255,255,255,0.3)',
          }}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}
          >
            <Flame size={52} color="white" strokeWidth={1.8} />
          </motion.div>
          <p style={{ color: 'white', fontWeight: 800, fontSize: 22, margin: '8px 0 4px' }}>
            Streak +1!
          </p>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: 14 }}>
            {streak} day{streak !== 1 ? 's' : ''} strong
          </p>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default StreakPopup;

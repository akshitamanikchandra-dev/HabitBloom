import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, Flame } from 'lucide-react';

const ICONS = {
  success: <CheckCircle2 size={18} color="#16a34a" />,
  error:   <XCircle      size={18} color="#dc2626" />,
  info:    <Info         size={18} color="#2563eb" />,
  streak:  <Flame        size={18} color="#f97316" />,
};

const COLORS = {
  success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
  error:   { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
  info:    { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
  streak:  { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
};

let addToastFn = null;

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => { addToastFn = addToast; return () => { addToastFn = null; }; }, [addToast]);

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map(t => {
          const c = COLORS[t.type] || COLORS.info;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', borderRadius: 14,
                background: c.bg, border: `1.5px solid ${c.border}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
                minWidth: 220, maxWidth: 320,
              }}
            >
              {ICONS[t.type]}
              <p style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{t.message}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

const ToastProvider = ({ children }) => (
  <>
    {children}
    <ToastContainer />
  </>
);

export const toast = {
  success: (msg) => addToastFn?.('success', msg),
  error:   (msg) => addToastFn?.('error',   msg),
  info:    (msg) => addToastFn?.('info',     msg),
  streak:  (msg) => addToastFn?.('streak',   msg),
};

export default ToastProvider;

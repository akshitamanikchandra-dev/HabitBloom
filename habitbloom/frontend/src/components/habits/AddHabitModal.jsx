import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Calendar, RefreshCw, CalendarDays, Check, Hash, SlidersHorizontal } from 'lucide-react';
import { HABIT_ICONS, HABIT_COLORS, DAYS_OF_WEEK } from '../../utils/helpers.js';
import api from '../../utils/api.js';
import { toast } from '../common/Toast.jsx';

const AddHabitModal = ({ onClose, onAdded }) => {
  const [form, setForm] = useState({
    title: '', description: '', icon: '✨',
    color: '#f9a8d4', frequency: 'daily',
    specificDays: [], inputType: 'checkbox', unit: '', maxValue: 1,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Please enter a habit title');
    setLoading(true);
    try {
      const res = await api.post('/habits', form);
      toast.success('New habit created!');
      onAdded(res.data.habit);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create habit');
    } finally { setLoading(false); }
  };

  const toggleDay = (day) => setForm(f => ({
    ...f,
    specificDays: f.specificDays.includes(day)
      ? f.specificDays.filter(d => d !== day)
      : [...f.specificDays, day],
  }));

  const FREQ_OPTS = [
    { id: 'daily',    label: 'Daily',    icon: <Calendar    size={13} /> },
    { id: 'alternate',label: 'Alternate', icon: <RefreshCw   size={13} /> },
    { id: 'specific', label: 'Specific',  icon: <CalendarDays size={13} /> },
  ];

  const TYPE_OPTS = [
    { id: 'checkbox', label: 'Done/Not Done', icon: <Check          size={13} /> },
    { id: 'number',   label: 'Number',        icon: <Hash           size={13} /> },
    { id: 'slider',   label: 'Slider',        icon: <SlidersHorizontal size={13} /> },
  ];

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg-card)', borderRadius: 24, padding: 28,
            width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto',
            border: '1.5px solid var(--border-color)', boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="var(--accent-secondary)" /> New Habit
            </h2>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--bg-secondary)', border: 'none',
              cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Icon picker (habit icons are still emojis — kept as-is from helpers.js) */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Icon</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {HABIT_ICONS.map(icon => (
                  <button key={icon} type="button"
                    onClick={() => setForm(f => ({ ...f, icon }))}
                    style={{
                      width: 40, height: 40, borderRadius: 10, fontSize: 20,
                      background: form.icon === icon ? form.color + '33' : 'var(--bg-secondary)',
                      border: `2px solid ${form.icon === icon ? form.color : 'transparent'}`,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >{icon}</button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Color</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {HABIT_COLORS.map(color => (
                  <button key={color} type="button"
                    onClick={() => setForm(f => ({ ...f, color }))}
                    style={{
                      width: 28, height: 28, borderRadius: '50%', background: color,
                      border: `3px solid ${form.color === color ? 'var(--text-primary)' : 'transparent'}`,
                      cursor: 'pointer', transition: 'transform 0.15s',
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Title *</label>
              <input className="input-field" type="text" placeholder="e.g. Morning meditation"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Description</label>
              <input className="input-field" type="text" placeholder="Optional note about this habit"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            {/* Tracking type */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Tracking Type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {TYPE_OPTS.map(opt => (
                  <button key={opt.id} type="button"
                    onClick={() => setForm(f => ({ ...f, inputType: opt.id }))}
                    style={{
                      flex: 1, padding: '8px 4px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                      background: form.inputType === opt.id ? 'var(--gradient-primary)' : 'var(--bg-secondary)',
                      color: form.inputType === opt.id ? 'white' : 'var(--text-secondary)',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    }}
                  >{opt.icon} {opt.label}</button>
                ))}
              </div>
            </div>

            {form.inputType !== 'checkbox' && (
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Unit</label>
                  <input className="input-field" placeholder="e.g. hours, km" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Max Value</label>
                  <input className="input-field" type="number" min={1} value={form.maxValue} onChange={e => setForm(f => ({ ...f, maxValue: parseInt(e.target.value) || 1 }))} />
                </div>
              </div>
            )}

            {/* Frequency */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Frequency</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: form.frequency === 'specific' ? 10 : 0 }}>
                {FREQ_OPTS.map(opt => (
                  <button key={opt.id} type="button"
                    onClick={() => setForm(f => ({ ...f, frequency: opt.id }))}
                    style={{
                      flex: 1, padding: '8px 4px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                      background: form.frequency === opt.id ? 'var(--gradient-primary)' : 'var(--bg-secondary)',
                      color: form.frequency === opt.id ? 'white' : 'var(--text-secondary)',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    }}
                  >{opt.icon} {opt.label}</button>
                ))}
              </div>
              {form.frequency === 'specific' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  {DAYS_OF_WEEK.map(day => (
                    <button key={day} type="button" onClick={() => toggleDay(day)}
                      style={{
                        flex: 1, padding: '6px 2px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                        background: form.specificDays.includes(day) ? form.color : 'var(--bg-secondary)',
                        color: form.specificDays.includes(day) ? 'white' : 'var(--text-muted)',
                        border: 'none', cursor: 'pointer',
                      }}
                    >{day}</button>
                  ))}
                </div>
              )}
            </div>

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{
                padding: '13px', marginTop: 4,
                background: 'var(--gradient-primary)',
                color: 'white', border: 'none', borderRadius: 14,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Sparkles size={16} /> {loading ? 'Creating...' : 'Create Habit'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddHabitModal;

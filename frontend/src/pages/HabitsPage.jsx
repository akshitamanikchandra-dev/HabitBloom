import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Trash2 } from 'lucide-react';
import api from '../utils/api.js';
import { toast } from '../components/common/Toast.jsx';
import AddHabitModal from '../components/habits/AddHabitModal.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const HabitsPage = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { loadHabits(); }, []);

  const loadHabits = async () => {
    try {
      const { data } = await api.get('/habits');
      setHabits(data.habits);
    } catch { toast.error('Failed to load habits'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this habit?')) return;
    setDeleting(id);
    try {
      await api.delete(`/habits/${id}`);
      setHabits(prev => prev.filter(h => h._id !== id));
      toast.success('Habit deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  if (loading) return <LoadingSpinner />;

  const defaultHabits = habits.filter(h => h.type === 'default');
  const customHabits  = habits.filter(h => h.type === 'custom');

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            My Habits
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>
            {habits.length} habit{habits.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
          style={{ padding: '10px 20px', borderRadius: 14, fontSize: 14 }}
        >
          + New Habit
        </motion.button>
      </motion.div>

      {defaultHabits.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            Default Habits
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {defaultHabits.map((habit, i) => (
              <HabitListItem key={habit._id} habit={habit} index={i} onDelete={handleDelete} deleting={deleting === habit._id} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
          Custom Habits
        </h2>
        <AnimatePresence>
          {customHabits.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, color: 'var(--accent-secondary)' }}>
                <Sprout size={48} strokeWidth={1.5} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: 16 }}>
                No custom habits yet. Create your first one!
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setShowModal(true)} className="btn btn-primary"
              >
                + Add Habit
              </motion.button>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {customHabits.map((habit, i) => (
                <HabitListItem key={habit._id} habit={habit} index={i} onDelete={handleDelete} deleting={deleting === habit._id} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </section>

      {showModal && (
        <AddHabitModal onClose={() => setShowModal(false)} onAdded={(h) => setHabits(prev => [...prev, h])} />
      )}
    </div>
  );
};

const HabitListItem = ({ habit, index, onDelete, deleting }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
    transition={{ delay: index * 0.05 }}
    className="card"
    style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}
  >
    <div style={{
      width: 46, height: 46, borderRadius: 14,
      background: habit.color + '22', border: `2px solid ${habit.color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 22, flexShrink: 0,
    }}>
      {habit.icon}
    </div>

    <div style={{ flex: 1, minWidth: 0 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{habit.title}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {habit.description && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{habit.description}</p>
        )}
        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: habit.color + '22', color: habit.color, textTransform: 'capitalize', flexShrink: 0 }}>
          {habit.frequency}
        </span>
        {habit.inputType !== 'checkbox' && (
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
            • {habit.inputType} ({habit.unit || 'units'})
          </span>
        )}
      </div>
    </div>

    {habit.type === 'custom' && (
      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => onDelete(habit._id)} disabled={deleting}
        style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#fee2e222', border: '1.5px solid #fca5a555',
          color: '#ef4444', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {deleting ? '...' : <Trash2 size={14} />}
      </motion.button>
    )}

    {habit.type === 'default' && (
      <span className="default-habit-badge" style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: 'rgba(167,139,250,0.15)', color: 'var(--accent-tertiary)' }}>
        Default
      </span>
    )}
  </motion.div>
);

export default HabitsPage;

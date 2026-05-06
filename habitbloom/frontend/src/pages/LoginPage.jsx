import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Flame, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.identifier, form.password);
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.message === 'Network Error'
          ? 'Cannot reach the server. Is the backend running on port 5000?'
          : 'Login failed. Please check your credentials.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/auth-bg.jpg)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.55)', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(45,58,56,0.55) 0%, rgba(155,60,39,0.35) 100%)',
        zIndex: 1,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'relative', zIndex: 2,
          width: '100%', maxWidth: 420, margin: '20px',
          background: 'rgba(245, 245, 220, 0.82)',
          backdropFilter: 'blur(18px)', borderRadius: 24,
          padding: '40px 36px',
          boxShadow: '0 24px 64px rgba(45,58,56,0.35)',
          border: '1.5px solid rgba(213,177,108,0.4)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="animate-float" style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <img src="/habitbloom-logo.png" alt="HabitBloom" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 16px rgba(155,60,39,0.25)' }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#2D3A38', marginBottom: 4 }}>HabitBloom</h1>
          <p style={{ color: '#9B3C27', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            Welcome back! Keep the streak alive <Flame size={14} color="#f97316" />
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '11px 14px', borderRadius: 12,
              background: '#fee2e2', border: '1px solid #fca5a5',
              color: '#dc2626', fontSize: 13, marginBottom: 18,
              fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <AlertTriangle size={15} /> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#2D3A38', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Username or Email
            </label>
            <input type="text" className="auth-input" placeholder="Enter your username or email"
              value={form.identifier} onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#2D3A38', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Password
            </label>
            <input type="password" className="auth-input" placeholder="Enter your password"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>

          <motion.button
            type="submit" disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.97 }}
            style={{
              marginTop: 4, padding: '13px',
              background: loading ? '#CB9650' : 'linear-gradient(135deg, #9B3C27, #EB7347)',
              color: 'white', border: 'none', borderRadius: 14,
              fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(155,60,39,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : <><LogIn size={16} /> Sign In</>}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6b5a4a' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#9B3C27', fontWeight: 700 }}>Sign up free</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;

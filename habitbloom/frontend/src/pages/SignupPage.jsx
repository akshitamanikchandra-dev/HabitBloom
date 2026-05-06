import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const Field = ({ label, type = 'text', placeholder, value, onChange }) => (
  <div>
    <label style={{
      display: 'block', fontSize: 12, fontWeight: 700,
      color: '#2D3A38', marginBottom: 6,
      textTransform: 'uppercase', letterSpacing: 0.5,
    }}>
      {label}
    </label>
    <input type={type} className="auth-input" placeholder={placeholder}
      value={value} onChange={onChange} required />
  </div>
);

const SignupPage = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', greetingName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username.trim())     return setError('Username is required.');
    if (!form.email.trim())        return setError('Email is required.');
    if (!form.greetingName.trim()) return setError('Display name is required.');
    if (form.password.length < 6)  return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.message === 'Network Error'
          ? 'Cannot reach the server. Is the backend running on port 5000?'
          : 'Signup failed. Please try again.');
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
          width: '100%', maxWidth: 440, margin: '20px',
          background: 'rgba(245, 245, 220, 0.82)',
          backdropFilter: 'blur(18px)', borderRadius: 24,
          padding: '36px',
          boxShadow: '0 24px 64px rgba(45,58,56,0.35)',
          border: '1.5px solid rgba(213,177,108,0.4)',
          maxHeight: '95vh', overflowY: 'auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="animate-float" style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <img src="/habitbloom-logo.png" alt="HabitBloom" style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 16px rgba(155,60,39,0.25)' }} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#2D3A38', marginBottom: 4 }}>Create Account</h1>
          <p style={{ color: '#9B3C27', fontSize: 13, fontWeight: 600 }}>Start your habit journey today</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '11px 14px', borderRadius: 12,
              background: '#fee2e2', border: '1px solid #fca5a5',
              color: '#dc2626', fontSize: 13, marginBottom: 16,
              fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <AlertTriangle size={15} /> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Display Name"  placeholder="e.g. Akshaya (shown in greetings)" value={form.greetingName} onChange={handleChange('greetingName')} />
          <Field label="Username"      placeholder="e.g. akshaya123"                   value={form.username}     onChange={handleChange('username')} />
          <Field label="Email"         type="email" placeholder="you@example.com"       value={form.email}        onChange={handleChange('email')} />
          <Field label="Password"      type="password" placeholder="Min. 6 characters"  value={form.password}     onChange={handleChange('password')} />

          <motion.button
            type="submit" disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.97 }}
            style={{
              marginTop: 6, padding: '13px',
              background: loading ? '#CB9650' : 'linear-gradient(135deg, #9B3C27, #EB7347)',
              color: 'white', border: 'none', borderRadius: 14,
              fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(155,60,39,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? <><Loader2 size={16} /> Creating account...</> : <><UserPlus size={16} /> Create Account</>}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#6b5a4a' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#9B3C27', fontWeight: 700 }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;

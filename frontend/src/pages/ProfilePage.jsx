import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Lock, Key, LogOut, Save, AlertTriangle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { AVATAR_OPTIONS, getAvatarEmoji } from '../utils/helpers.js';
import api from '../utils/api.js';
import { toast } from '../components/common/Toast.jsx';

const Section = ({ title, icon, children }) => (
  <div className="card" style={{ padding: 24, marginBottom: 20 }}>
    <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
      {icon} {title}
    </h2>
    {children}
  </div>
);

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const [profileForm, setProfileForm] = useState({
    greetingName: user?.greetingName || '',
    username: user?.username || '',
    avatar: user?.avatar || 'cat',
    gender: user?.gender || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/update-profile', profileForm);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error("Passwords don't match");
    if (pwForm.newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setChangingPw(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setChangingPw(false); }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
          <User size={24} /> Profile
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>Manage your account settings</p>
      </motion.div>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="card"
        style={{ padding: 28, marginBottom: 20, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', gap: 20 }}
      >
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 38, border: '3px solid rgba(255,255,255,0.5)',
        }}>
          {getAvatarEmoji(user?.avatar)}
        </div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>{user?.greetingName}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: 14 }}>@{user?.username}</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 }}>{user?.email}</p>
        </div>
      </motion.div>

      <Section title="Edit Profile" icon={<Pencil size={16} />}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>
            Choose Avatar
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            {AVATAR_OPTIONS.map(avatar => (
              <motion.button
                key={avatar.id} type="button"
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setProfileForm(f => ({ ...f, avatar: avatar.id }))}
                style={{
                  width: 52, height: 52, borderRadius: '50%', fontSize: 26,
                  background: profileForm.avatar === avatar.id ? 'var(--gradient-primary)' : 'var(--bg-secondary)',
                  border: profileForm.avatar === avatar.id ? '3px solid var(--accent-primary)' : '3px solid transparent',
                  cursor: 'pointer', boxShadow: profileForm.avatar === avatar.id ? 'var(--shadow-md)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                title={avatar.label}
              >
                {avatar.emoji}
              </motion.button>
            ))}
          </div>
        </div>

        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'greetingName', label: 'Display Name', placeholder: 'Your display name' },
            { key: 'username', label: 'Username', placeholder: 'Your username' },
          ].map(field => (
            <div key={field.key}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{field.label}</label>
              <input className="input-field" placeholder={field.placeholder}
                value={profileForm[field.key]} onChange={e => setProfileForm(f => ({ ...f, [field.key]: e.target.value }))} />
            </div>
          ))}

          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Gender (optional)</label>
            <select className="input-field" value={profileForm.gender}
              onChange={e => setProfileForm(f => ({ ...f, gender: e.target.value }))}
              style={{ background: 'var(--bg-input)' }}>
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
            </select>
          </div>

          <motion.button
            type="submit" disabled={saving}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{
              padding: '11px', background: 'var(--gradient-primary)',
              color: 'white', border: 'none', borderRadius: 12,
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </form>
      </Section>

      <Section title="Change Password" icon={<Lock size={16} />}>
        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
            { key: 'newPassword',     label: 'New Password',     placeholder: 'Min. 6 characters' },
            { key: 'confirm',         label: 'Confirm New Password', placeholder: 'Repeat new password' },
          ].map(field => (
            <div key={field.key}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{field.label}</label>
              <input type="password" className="input-field" placeholder={field.placeholder}
                value={pwForm[field.key]} onChange={e => setPwForm(f => ({ ...f, [field.key]: e.target.value }))} required />
            </div>
          ))}
          <motion.button
            type="submit" disabled={changingPw}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{
              padding: '11px', background: 'var(--gradient-secondary)',
              color: 'white', border: 'none', borderRadius: 12,
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Key size={15} /> {changingPw ? 'Updating...' : 'Update Password'}
          </motion.button>
        </form>
      </Section>

      <div className="card" style={{ padding: 24, border: '1.5px solid #fca5a5' }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#ef4444', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} /> Danger Zone
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>This will log you out from all sessions.</p>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={logout}
          style={{
            padding: '10px 20px', background: '#fee2e2', color: '#ef4444',
            border: '1.5px solid #fca5a5', borderRadius: 12,
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <LogOut size={15} /> Logout
        </motion.button>
      </div>
    </div>
  );
};

export default ProfilePage;

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ClipboardList, BarChart2, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';
import { getAvatarEmoji } from '../../utils/helpers.js';

const NAV_ITEMS = [
  { path: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { path: '/habits',    icon: <ClipboardList  size={18} />, label: 'Habits' },
  { path: '/analytics', icon: <BarChart2      size={18} />, label: 'Analytics' },
  { path: '/profile',   icon: <User           size={18} />, label: 'Profile' },
];

const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebarContent = (
    <div style={{
      width: 'var(--sidebar-width)', height: '100vh',
      background: 'var(--bg-sidebar)',
      borderRight: '1.5px solid var(--border-color)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 16px', gap: 8,
      position: 'fixed', top: 0, left: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 8px 20px', borderBottom: '1.5px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <img
            src="/habitbloom-logo.png"
            alt="HabitBloom Logo"
            className="animate-float"
            style={{
              width: 42, height: 42, borderRadius: '50%',
              objectFit: 'cover', flexShrink: 0,
              boxShadow: '0 2px 10px rgba(155, 60, 39, 0.20)',
              border: '2px solid rgba(213, 177, 108, 0.45)',
            }}
          />
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              HabitBloom
            </h1>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
              Grow every day ✨
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 8 }}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path} to={item.path} onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 14,
              fontWeight: 600, fontSize: 14,
              textDecoration: 'none', transition: 'all 0.2s ease',
              background: isActive ? 'var(--gradient-primary)' : 'transparent',
              color: isActive ? 'white' : 'var(--text-secondary)',
              boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
            })}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Profile & Logout */}
      <div style={{ borderTop: '1.5px solid var(--border-color)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <NavLink to="/profile" onClick={onClose} style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 14,
            background: 'var(--bg-card)', border: '1.5px solid var(--border-color)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>
              {getAvatarEmoji(user?.avatar)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.greetingName}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                @{user?.username}
              </p>
            </div>
          </div>
        </NavLink>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 14px', borderRadius: 12,
            background: 'transparent', border: '1.5px solid var(--border-color)',
            color: 'var(--text-muted)', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fca5a5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="desktop-sidebar" style={{ display: 'block' }}>{sidebarContent}</div>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99, display: 'none' }}
              className="mobile-overlay"
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ position: 'fixed', top: 0, left: 0, zIndex: 100 }}
              className="mobile-sidebar-slide"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-overlay { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-sidebar-slide { display: none; }
        }
      `}</style>
    </>
  );
};

export default Sidebar;

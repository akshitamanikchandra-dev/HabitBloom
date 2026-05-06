import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../layout/Sidebar.jsx';

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Mobile top bar */}
      <div style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0,
        height: 56, background: 'var(--bg-sidebar)',
        borderBottom: '1.5px solid var(--border-color)',
        alignItems: 'center', padding: '0 16px',
        zIndex: 90, gap: 12,
      }} className="mobile-topbar">
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            background: 'none', border: 'none',
            color: 'var(--text-primary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
          }}
        >
          <Menu size={22} />
        </button>
        <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>HabitBloom</span>
      </div>

      <main className="main-content">
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .mobile-topbar { display: flex !important; }
          .main-content { margin-top: 56px; }
        }
      `}</style>
    </div>
  );
};

export default AppLayout;

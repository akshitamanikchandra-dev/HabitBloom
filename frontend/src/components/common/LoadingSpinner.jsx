import React from 'react';
import { Leaf } from 'lucide-react';

const LoadingSpinner = ({ fullScreen }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: fullScreen ? '100vh' : '60vh', gap: 16,
  }}>
    <div className="animate-float" style={{ color: 'var(--accent-secondary)' }}>
      <Leaf size={52} strokeWidth={1.5} />
    </div>
    <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>
      Loading...
    </p>
  </div>
);

export default LoadingSpinner;

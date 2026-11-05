import React, { useEffect } from 'react';

export function Toast({ message, type = 'success', duration = 3000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'ℹ',
  }[type];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        background: bgColor,
        color: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '15px',
        fontWeight: '500',
        zIndex: 2000,
        animation: 'slideInUp 0.3s ease, slideOutDown 0.3s ease 2.7s forwards',
        maxWidth: '400px',
      }}
    >
      <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{icon}</span>
      <span>{message}</span>
    </div>
  );
}

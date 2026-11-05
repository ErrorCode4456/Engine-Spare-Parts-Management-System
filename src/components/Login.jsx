import React, { useState } from 'react';
import { Toast } from './Toast';

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const CORRECT_PASSWORD = '130547';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password === CORRECT_PASSWORD) {
      setToast({ message: 'เข้าสู่ระบบสำเร็จ', type: 'success' });
      setTimeout(() => {
        onLogin();
      }, 500);
    } else {
      setError('รหัสผ่านไม่ถูกต้อง');
      setPassword('');
      setToast({ message: 'รหัสผ่านไม่ถูกต้อง', type: 'error' });
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{
        background: 'white',
        padding: '50px',
        borderRadius: '20px',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
        width: '100%',
        maxWidth: '420px',
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '12px',
          color: '#0f172a',
          textAlign: 'center',
        }}>
          ระบบจัดการอะไหล่
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#64748b',
          textAlign: 'center',
          marginBottom: '40px',
          fontWeight: '400',
        }}>
          Garage Stock Manager
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#2d3748',
              fontSize: '14px',
            }}>
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="กรุณาใส่รหัสผ่าน"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: error ? '2px solid #f56565' : '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '16px',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
                background: '#fafbfc',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.background = 'white';
                e.target.style.outline = 'none';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = error ? '#f56565' : '#e2e8f0';
                e.target.style.background = '#fafbfc';
                e.target.style.boxShadow = 'none';
              }}
              autoFocus
            />
            {error && (
              <p style={{
                color: '#f56565',
                fontSize: '13px',
                marginTop: '6px',
                fontWeight: '500',
              }}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 4px 14px rgba(102, 126, 234, 0.4)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            เข้าสู่ระบบ
          </button>
        </form>

        <p style={{
          fontSize: '12px',
          color: '#94a3b8',
          textAlign: 'center',
          marginTop: '24px',
          fontWeight: '500',
        }}>
          Garage Stock Manager v1.0
        </p>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export default Login;

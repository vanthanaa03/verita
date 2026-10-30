import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertTriangle, Shield, UserCheck } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErrorMsg(data.error || 'Invalid credentials.');
      } else {
        onLoginSuccess(data.token, data.user);
        if (data.user.role === 'FACULTY') navigate('/dashboard/faculty');
        else if (data.user.role === 'HOD') navigate('/dashboard/hod');
        else if (data.user.role === 'PRINCIPAL') navigate('/dashboard/principal');
        else if (data.user.role === 'CEO') navigate('/dashboard/ceo');
        else navigate('/');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Network error connecting to backend API.');
    }
  };

  const fillDemoUser = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="container" style={{ maxWidth: '440px', padding: '2.5rem 1rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '8px',
          backgroundColor: 'var(--primary)', color: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 0.75rem'
        }}>
          <Lock size={22} />
        </div>
        <h1 className="page-title" style={{ fontSize: '1.4rem' }}>Staff & Management Sign In</h1>
        <p className="page-subtitle">Authorized portal for Faculty, HODs, Principal & CEO</p>
      </div>

      {errorMsg && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <div>{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleLogin} className="card">
        <div className="form-group">
          <label className="form-label">Email or Faculty ID</label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} color="var(--text-light)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="email"
              className="form-control"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="e.g. faculty1@verita.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} color="var(--text-light)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="password"
              className="form-control"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.65rem' }} disabled={loading}>
          {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
        </button>
      </form>

      {/* Demo Credentials Quick Switcher */}
      <div className="card" style={{ marginTop: '1.25rem', backgroundColor: 'var(--bg-subtle)' }}>
        <h4 style={{ fontSize: '0.8125rem', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <UserCheck size={15} color="var(--primary)" /> Demo Test Credentials
        </h4>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.75rem' }}>
          Click any role below to pre-fill test email (Password: <code>password123</code>):
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <button 
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => fillDemoUser('faculty1@verita.edu')}
            style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
          >
            Faculty Demo
          </button>

          <button 
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => fillDemoUser('hod_cse@verita.edu')}
            style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
          >
            HOD Demo
          </button>

          <button 
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => fillDemoUser('principal@verita.edu')}
            style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
          >
            Principal Demo
          </button>

          <button 
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => fillDemoUser('ceo@verita.edu')}
            style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
          >
            CEO Demo
          </button>
        </div>
      </div>

    </div>
  );
}

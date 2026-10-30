import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Send, Search, LogIn, LogOut, User, LayoutDashboard } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isCurrent = (path) => location.pathname === path;

  return (
    <header className="header-bar">
      <div className="container" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Institutional Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '6px',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Verita</span>
              <span className="badge badge-approved" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>AI Moderated</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', margin: 0, lineHeight: 1 }}>
              Anonymous Grievance System
            </p>
          </div>
        </Link>

        {/* Navigation Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link to="/submit" className={`btn btn-sm ${isCurrent('/submit') ? 'btn-primary' : 'btn-secondary'}`}>
            <Send size={15} /> Submit Grievance
          </Link>

          <Link to="/track" className={`btn btn-sm ${isCurrent('/track') ? 'btn-primary' : 'btn-secondary'}`}>
            <Search size={15} /> Track Status
          </Link>

          {/* User Role & Auth */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: '0.5rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--border-color)' }}>
              <Link to={`/dashboard/${user.role.toLowerCase()}`} className="btn btn-sm btn-secondary">
                <LayoutDashboard size={15} /> Dashboard
              </Link>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)', lineHeight: 1.2 }}>{user.name}</span>
                <span className={`badge badge-${user.role.toLowerCase()}`} style={{ fontSize: '0.6rem', padding: '0.05rem 0.35rem', marginTop: '2px' }}>
                  {user.role} {user.department_code ? `(${user.department_code})` : ''}
                </span>
              </div>

              <button 
                onClick={() => {
                  onLogout();
                  navigate('/login');
                }} 
                className="btn btn-sm btn-secondary"
                title="Log out"
                style={{ color: '#dc2626' }}
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className={`btn btn-sm ${isCurrent('/login') ? 'btn-primary' : 'btn-secondary'}`} style={{ marginLeft: '0.25rem' }}>
              <LogIn size={15} /> Staff Login
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}

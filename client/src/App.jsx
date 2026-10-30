import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import StudentHome from './pages/StudentHome';
import SubmitComplaint from './pages/SubmitComplaint';
import TrackComplaint from './pages/TrackComplaint';
import Login from './pages/Login';
import FacultyDashboard from './pages/FacultyDashboard';
import HodDashboard from './pages/HodDashboard';
import PrincipalDashboard from './pages/PrincipalDashboard';
import CeoDashboard from './pages/CeoDashboard';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('verita_token') || '');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('verita_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('verita_token', newToken);
    localStorage.setItem('verita_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('verita_token');
    localStorage.removeItem('verita_user');
  };

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar user={user} onLogout={handleLogout} />

        <main style={{ flex: 1 }}>
          <Routes>
            {/* Student Public Routes */}
            <Route path="/" element={<StudentHome />} />
            <Route path="/submit" element={<SubmitComplaint />} />
            <Route path="/track" element={<TrackComplaint />} />
            
            {/* Staff Auth Route */}
            <Route 
              path="/login" 
              element={user ? <Navigate to={`/dashboard/${user.role.toLowerCase()}`} replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
            />

            {/* Protected Staff Role Dashboards */}
            <Route 
              path="/dashboard/faculty" 
              element={user && user.role === 'FACULTY' ? <FacultyDashboard user={user} token={token} /> : <Navigate to="/login" replace />} 
            />

            <Route 
              path="/dashboard/hod" 
              element={user && user.role === 'HOD' ? <HodDashboard user={user} token={token} /> : <Navigate to="/login" replace />} 
            />

            <Route 
              path="/dashboard/principal" 
              element={user && user.role === 'PRINCIPAL' ? <PrincipalDashboard user={user} token={token} /> : <Navigate to="/login" replace />} 
            />

            <Route 
              path="/dashboard/ceo" 
              element={user && user.role === 'CEO' ? <CeoDashboard user={user} token={token} /> : <Navigate to="/login" replace />} 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer style={{
          padding: '2rem 1.5rem',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          background: 'rgba(15, 23, 42, 0.9)'
        }}>
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} <strong>Verita</strong> - Anonymous College Grievance & Support System. Built with AI Moderation Safety Protocols.
          </p>
        </footer>
      </div>
    </Router>
  );
}

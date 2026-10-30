import React, { useState, useEffect } from 'react';
import { Shield, BarChart3, TrendingUp, Clock, AlertTriangle, CheckCircle2, RefreshCw, Cpu } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';

export default function CeoDashboard({ user, token }) {
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCeoData = async () => {
    setLoading(true);
    try {
      const [compRes, statsRes] = await Promise.all([
        fetch('/api/complaints/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/analytics/summary', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const compData = await compRes.json();
      const statsData = await statsRes.json();

      setLoading(false);
      if (compRes.ok) {
        setComplaints(compData.complaints || []);
      }
      if (statsRes.ok) {
        setAnalytics(statsData);
      }
    } catch (err) {
      console.error('CEO fetch error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCeoData();
  }, []);

  const metrics = analytics?.metrics || { total: 0, pending: 0, resolved: 0, escalated: 0, avg_resolution_hours: 18.5 };
  const escalatedComplaints = complaints.filter(c => c.escalated_to_role === 'CEO' || c.escalated_to_role === 'PRINCIPAL' || c.status === 'UNDER_REVIEW');

  const trendData = [
    { month: 'May', Total: 12, Resolved: 10 },
    { month: 'Jun', Total: 18, Resolved: 16 },
    { month: 'Jul', Total: 15, Resolved: 14 },
    { month: 'Aug', Total: 24, Resolved: 21 },
    { month: 'Sep', Total: complaints.length, Resolved: metrics.resolved }
  ];

  return (
    <div className="container">
      
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="badge badge-ceo">CEO & GOVERNING BOARD</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Executive Suite</span>
          </div>
          <h1 className="page-title" style={{ marginTop: '0.2rem' }}>
            Executive Governance & Operational KPIs
          </h1>
          <p className="page-subtitle">
            Strategic resolution speed analytics, AI moderation metrics, and critical escalated issues.
          </p>
        </div>

        <button onClick={fetchCeoData} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh Feed
        </button>
      </div>

      {/* Metric Tiles */}
      <div className="grid-stats">
        <StatCard title="Total Grievance Volume" value={metrics.total} subtitle="College-wide total" icon={BarChart3} color="#1e40af" />
        <StatCard title="Avg Resolution Time" value={`${metrics.avg_resolution_hours} hrs`} subtitle="Turnaround KPI speed" icon={Clock} color="#15803d" />
        <StatCard title="Pending Resolution" value={metrics.pending} subtitle="Active grievances" icon={TrendingUp} color="#b45309" />
        <StatCard title="Critical Escalations" value={metrics.escalated} subtitle="Routed to CEO/Board" icon={Shield} color="#b91c1c" />
      </div>

      {/* Analytics Grid */}
      <div className="grid-charts">
        
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={16} color="#15803d" /> Monthly Grievance & Resolution Trends
          </h3>
          <div style={{ width: '100%', height: 230 }}>
            <ResponsiveContainer>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e40af" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#1e40af" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803d" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                <Area type="monotone" dataKey="Total" stroke="#1e40af" fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="Resolved" stroke="#15803d" fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Cpu size={16} color="var(--primary)" /> AI Moderation Filter Efficiency
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--success-text)', fontWeight: '600' }}>Approved & Auto-Routed</span>
              <strong style={{ color: 'var(--success-text)' }}>94.2%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--warning-text)', fontWeight: '600' }}>Flagged for Human Admin Review</span>
              <strong style={{ color: 'var(--warning-text)' }}>4.1%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--danger-text)', fontWeight: '600' }}>Blocked Toxic/Abusive Content</span>
              <strong style={{ color: 'var(--danger-text)' }}>1.7%</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Critical Escalations Table */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <AlertTriangle size={18} color="#b91c1c" /> Priority / Escalated Issues Requiring Executive Suite Review
        </h3>

        {loading ? (
          <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Loading priority complaints...</p>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Grievance Summary</th>
                  <th>Assigned Officer</th>
                  <th>Escalation Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {escalatedComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-light)', padding: '1.5rem' }}>
                      No critical escalations pending. All complaints are managed at HOD/Principal level.
                    </td>
                  </tr>
                ) : (
                  escalatedComplaints.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: '700', fontFamily: 'monospace', color: 'var(--primary)' }}>
                        {c.complaint_num}
                      </td>
                      <td>
                        <strong>{c.category}</strong>
                      </td>
                      <td>{c.department_name}</td>
                      <td style={{ maxWidth: '300px' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem' }}>{c.description}</p>
                      </td>
                      <td>{c.assigned_to_name || 'Executive Suite'}</td>
                      <td>
                        <span className="badge badge-rejected" style={{ fontSize: '0.68rem' }}>
                          {c.escalated_to_role || 'HIGH PRIORITY'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${c.status.toLowerCase()}`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Building, CheckCircle2, Clock, Filter, RefreshCw, BarChart2, PieChart as PieIcon, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import StatCard from '../components/StatCard';

export default function PrincipalDashboard({ user, token }) {
  const [complaints, setComplaints] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Reassignment Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignedUserId, setAssignedUserId] = useState('');
  const [escalateRole, setEscalateRole] = useState('');
  const [directiveMsg, setDirectiveMsg] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const fetchPrincipalData = async () => {
    setLoading(true);
    try {
      const [compRes, statsRes] = await Promise.all([
        fetch(`/api/complaints/dashboard?status=${statusFilter}`, {
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
        setFacultyList(compData.facultyList || []);
      }
      if (statsRes.ok) {
        setAnalytics(statsData);
      }
    } catch (err) {
      console.error('Principal dashboard error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrincipalData();
  }, [statusFilter]);

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAssign(true);
    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          assigned_to_user_id: assignedUserId || null,
          escalate_to_role: escalateRole || null,
          note: directiveMsg
        })
      });

      const data = await res.json();
      setSubmittingAssign(false);

      if (res.ok) {
        setSelectedComplaint(null);
        setDirectiveMsg('');
        fetchPrincipalData();
      } else {
        alert(data.error || 'Failed to update assignment.');
      }
    } catch (err) {
      setSubmittingAssign(false);
      alert('Network error.');
    }
  };

  const metrics = analytics?.metrics || { total: 0, pending: 0, in_progress: 0, resolved: 0, escalated: 0 };
  const COLORS = ['#1e40af', '#15803d', '#b45309', '#b91c1c', '#6d28d9', '#0891b2'];

  return (
    <div className="container">
      
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="badge badge-principal">PRINCIPAL PORTAL</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>All Departments</span>
          </div>
          <h1 className="page-title" style={{ marginTop: '0.2rem' }}>
            Institutional Overview & Control
          </h1>
          <p className="page-subtitle">
            Monitor college-wide student grievances, departmental resolution progress, and issue directives.
          </p>
        </div>

        <button onClick={fetchPrincipalData} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Metrics */}
      <div className="grid-stats">
        <StatCard title="Total Volume" value={metrics.total} subtitle="Across 6 departments" icon={Building} color="#1e40af" />
        <StatCard title="Pending Processing" value={metrics.pending} subtitle="Awaiting initial action" icon={Clock} color="#b45309" />
        <StatCard title="In Progress" value={metrics.in_progress} subtitle="Under resolution" icon={RefreshCw} color="#6d28d9" />
        <StatCard title="Resolved Cases" value={metrics.resolved} subtitle="Closed grievances" icon={CheckCircle2} color="#15803d" />
      </div>

      {/* Analytics Charts */}
      {analytics && (
        <div className="grid-charts">
          
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BarChart2 size={16} color="var(--primary)" /> Grievances by Category
            </h3>
            <div style={{ width: '100%', height: 230 }}>
              <ResponsiveContainer>
                <BarChart data={analytics.categoryStats}>
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                  <Bar dataKey="count" fill="#1e40af" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <PieIcon size={16} color="#15803d" /> Department Distribution
            </h3>
            <div style={{ width: '100%', height: 230 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={analytics.departmentStats}
                    dataKey="count"
                    nameKey="department_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={35}
                    paddingAngle={3}
                  >
                    {analytics.departmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={16} color="var(--text-light)" />
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Status Filter:</span>
        </div>
        <select className="form-control" style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.8125rem' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="NEW">NEW</option>
          <option value="UNDER_REVIEW">UNDER REVIEW</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>
      </div>

      {/* Complaints Data Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
            Loading all college complaints...
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Category</th>
                <th>Department</th>
                <th>Description</th>
                <th>Assigned Officer</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: '700', fontFamily: 'monospace', color: 'var(--primary)' }}>
                    {c.complaint_num}
                  </td>
                  <td>
                    <strong>{c.category}</strong>
                  </td>
                  <td>{c.department_name}</td>
                  <td style={{ maxWidth: '280px' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {c.description}
                    </p>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem' }}>
                      {c.assigned_to_name ? `${c.assigned_to_name} (${c.assigned_to_role})` : 'Unassigned'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${c.status.toLowerCase()}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedComplaint(c);
                        setAssignedUserId(c.assigned_to_user_id ? c.assigned_to_user_id.toString() : '');
                        setEscalateRole(c.escalated_to_role || '');
                        setDirectiveMsg('');
                      }}
                      className="btn btn-sm btn-primary"
                    >
                      <UserPlus size={13} /> Direct / Reassign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reassignment Modal */}
      {selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              Principal Executive Directive - <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{selectedComplaint.complaint_num}</span>
            </h3>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Grievance Text</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: '0.2rem 0 0' }}>{selectedComplaint.description}</p>
            </div>

            <form onSubmit={handleReassignSubmit}>
              <div className="form-group">
                <label className="form-label">Assign / Reassign Responsibility To:</label>
                <select
                  className="form-control"
                  value={assignedUserId}
                  onChange={(e) => setAssignedUserId(e.target.value)}
                >
                  <option value="">-- Unassigned --</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.role} - {f.department_name || 'All'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Escalate to CEO / Governing Board</label>
                <select
                  className="form-control"
                  value={escalateRole}
                  onChange={(e) => setEscalateRole(e.target.value)}
                >
                  <option value="">Handle at Principal Level</option>
                  <option value="CEO">Escalate to CEO / Management</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Executive Directive Note</label>
                <textarea
                  className="form-control"
                  placeholder="Provide instructions to HOD or Faculty officer."
                  value={directiveMsg}
                  onChange={(e) => setDirectiveMsg(e.target.value)}
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedComplaint(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingAssign}
                >
                  {submittingAssign ? 'Saving...' : 'Issue Executive Directive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

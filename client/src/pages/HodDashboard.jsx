import React, { useState, useEffect } from 'react';
import { Building2, UserPlus, ArrowUpRight, CheckCircle2, Clock, Filter, RefreshCw, Paperclip } from 'lucide-react';
import StatCard from '../components/StatCard';

export default function HodDashboard({ user, token }) {
  const [complaints, setComplaints] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Assignment Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignedFacultyId, setAssignedFacultyId] = useState('');
  const [escalateRole, setEscalateRole] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const fetchHodData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/complaints/dashboard?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setComplaints(data.complaints || []);
        setFacultyList(data.facultyList || []);
      }
    } catch (err) {
      console.error('HOD fetch error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHodData();
  }, [statusFilter]);

  const handleAssignSubmit = async (e) => {
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
          assigned_to_user_id: assignedFacultyId || null,
          escalate_to_role: escalateRole || null,
          note: assignNote
        })
      });

      const data = await res.json();
      setSubmittingAssign(false);

      if (res.ok) {
        setSelectedComplaint(null);
        setAssignNote('');
        fetchHodData();
      } else {
        alert(data.error || 'Failed to update assignment.');
      }
    } catch (err) {
      setSubmittingAssign(false);
      alert('Network error.');
    }
  };

  const totalDept = complaints.length;
  const pendingDept = complaints.filter(c => c.status === 'NEW' || c.status === 'UNDER_REVIEW').length;
  const resolvedDept = complaints.filter(c => c.status === 'RESOLVED').length;
  const escalatedDept = complaints.filter(c => c.escalated_to_role).length;

  return (
    <div className="container">
      
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="badge badge-hod">HOD PORTAL</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Dept: {user.department_name} ({user.department_code})</span>
          </div>
          <h1 className="page-title" style={{ marginTop: '0.2rem' }}>
            Department Management - {user.name}
          </h1>
          <p className="page-subtitle">
            Manage departmental grievances, assign tasks to faculty, or escalate unresolved issues.
          </p>
        </div>

        <button onClick={fetchHodData} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh Feed
        </button>
      </div>

      {/* Metrics */}
      <div className="grid-stats">
        <StatCard title="Department Volume" value={totalDept} subtitle={`In ${user.department_code || 'Department'}`} icon={Building2} color="#b45309" />
        <StatCard title="Pending Resolution" value={pendingDept} subtitle="Awaiting action" icon={Clock} color="#1d4ed8" />
        <StatCard title="Resolved Cases" value={resolvedDept} subtitle="Closed grievances" icon={CheckCircle2} color="#15803d" />
        <StatCard title="Escalated Issues" value={escalatedDept} subtitle="Sent to Principal/CEO" icon={ArrowUpRight} color="#b91c1c" />
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={16} color="var(--text-light)" />
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Status Filter:</span>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['ALL', 'NEW', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem' }}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
            Loading department complaints...
          </div>
        ) : complaints.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
            No complaints found for your department.
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Category</th>
                <th>Description</th>
                <th>Assigned Officer</th>
                <th>Status</th>
                <th>Escalation</th>
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
                    {c.escalated_to_role ? (
                      <span className="badge badge-rejected" style={{ fontSize: '0.68rem' }}>
                        Escalated: {c.escalated_to_role}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Standard</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedComplaint(c);
                        setAssignedFacultyId(c.assigned_to_user_id ? c.assigned_to_user_id.toString() : '');
                        setEscalateRole(c.escalated_to_role || '');
                        setAssignNote('');
                      }}
                      className="btn btn-sm btn-secondary"
                    >
                      <UserPlus size={13} /> Assign / Forward
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Assignment Modal */}
      {selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              Assign or Forward Grievance - <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{selectedComplaint.complaint_num}</span>
            </h3>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Grievance Description</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: '0.2rem 0 0' }}>{selectedComplaint.description}</p>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div className="form-group">
                <label className="form-label">Assign to Faculty Member</label>
                <select
                  className="form-control"
                  value={assignedFacultyId}
                  onChange={(e) => setAssignedFacultyId(e.target.value)}
                >
                  <option value="">-- Keep Unassigned --</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.role} - {f.department_name || 'All'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Escalate Serious Issue To:</label>
                <select
                  className="form-control"
                  value={escalateRole}
                  onChange={(e) => setEscalateRole(e.target.value)}
                >
                  <option value="">Handle at HOD Level</option>
                  <option value="PRINCIPAL">Forward to Principal</option>
                  <option value="CEO">Forward to CEO / Management</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Directive Note</label>
                <textarea
                  className="form-control"
                  placeholder="Provide instructions to the assigned faculty or reasoning for escalation."
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
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
                  {submittingAssign ? 'Saving...' : 'Save & Forward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

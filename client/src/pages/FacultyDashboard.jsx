import React, { useState, useEffect } from 'react';
import { UserCheck, CheckCircle2, Clock, MessageSquare, Filter, RefreshCw, Paperclip } from 'lucide-react';
import StatCard from '../components/StatCard';

export default function FacultyDashboard({ user, token }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Update status modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [updateMessage, setUpdateMessage] = useState('');
  const [updating, setUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchDashboardComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/complaints/dashboard?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setComplaints(data.complaints || []);
      }
    } catch (err) {
      console.error('Faculty dashboard fetch error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardComplaints();
  }, [statusFilter]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!updateMessage || updateMessage.trim().length < 5) {
      alert('Please provide a clear official update message of at least 5 characters.');
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, message: updateMessage })
      });

      const data = await res.json();
      setUpdating(false);

      if (res.ok) {
        setFeedbackMsg('Status and official response updated successfully.');
        setTimeout(() => setFeedbackMsg(''), 3000);
        setSelectedComplaint(null);
        setUpdateMessage('');
        fetchDashboardComplaints();
      } else {
        alert(data.error || 'Failed to update status.');
      }
    } catch (err) {
      setUpdating(false);
      alert('Network error.');
    }
  };

  // Metrics
  const totalAssigned = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'NEW' || c.status === 'UNDER_REVIEW').length;
  const inProgressCount = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;

  return (
    <div className="container">
      
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="badge badge-faculty">FACULTY PORTAL</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Faculty ID: {user.faculty_id}</span>
          </div>
          <h1 className="page-title" style={{ marginTop: '0.2rem' }}>
            Faculty Queue - {user.name}
          </h1>
          <p className="page-subtitle">
            Manage assigned grievances ({user.department_code || 'Department'}). Student identity remains anonymous.
          </p>
        </div>

        <button onClick={fetchDashboardComplaints} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh Queue
        </button>
      </div>

      {feedbackMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} />
          <div>{feedbackMsg}</div>
        </div>
      )}

      {/* Metric Tiles */}
      <div className="grid-stats">
        <StatCard title="Total Assigned" value={totalAssigned} subtitle="In your queue" icon={UserCheck} color="#1e40af" />
        <StatCard title="Pending Review" value={pendingCount} subtitle="Requires attention" icon={Clock} color="#b45309" />
        <StatCard title="In Progress" value={inProgressCount} subtitle="Under active review" icon={RefreshCw} color="#6d28d9" />
        <StatCard title="Resolved" value={resolvedCount} subtitle="Closed cases" icon={CheckCircle2} color="#15803d" />
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={16} color="var(--text-light)" />
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Status Filter:</span>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['ALL', 'NEW', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((st) => (
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

      {/* Table Data */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
            Loading assigned complaints...
          </div>
        ) : complaints.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
            No complaints found in this view.
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Category</th>
                <th>Department</th>
                <th>Description</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
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
                    {c.attachment_url && (
                      <a href={c.attachment_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem' }}>
                        <Paperclip size={12} /> View File
                      </a>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                    {new Date(c.created_at).toLocaleDateString()}
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
                        setNewStatus(c.status);
                        setUpdateMessage('');
                      }}
                      className="btn btn-sm btn-primary"
                    >
                      <MessageSquare size={13} /> Respond / Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Response Modal */}
      {selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              Update Grievance Status - <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{selectedComplaint.complaint_num}</span>
            </h3>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Anonymous Description</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: '0.2rem 0 0' }}>{selectedComplaint.description}</p>
            </div>

            <form onSubmit={handleUpdateSubmit}>
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select
                  className="form-control"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                >
                  <option value="NEW">NEW</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Official Response / Action Note (Visible to Student)</label>
                <textarea
                  className="form-control"
                  placeholder="Provide official update text (e.g. 'Meeting scheduled with course instructor on Monday.')"
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  required
                  rows={4}
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
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Submit Official Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

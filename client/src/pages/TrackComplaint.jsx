import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, AlertCircle, Calendar, Paperclip, Clock } from 'lucide-react';
import Timeline from '../components/Timeline';

export default function TrackComplaint() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [complaintNum, setComplaintNum] = useState(searchParams.get('id') || '');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTracking = async (idToFetch) => {
    if (!idToFetch || !idToFetch.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setData(null);

    try {
      const res = await fetch(`/api/complaints/track/${encodeURIComponent(idToFetch.trim())}`);
      const json = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErrorMsg(json.error || 'Complaint ID not found.');
      } else {
        setData(json);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Failed to connect to backend server.');
    }
  };

  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setComplaintNum(idFromUrl);
      fetchTracking(idFromUrl);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (complaintNum) {
      setSearchParams({ id: complaintNum.trim() });
      fetchTracking(complaintNum.trim());
    }
  };

  return (
    <div className="container" style={{ maxWidth: '820px' }}>
      
      <div className="page-header">
        <h1 className="page-title">Track Anonymous Complaint Status</h1>
        <p className="page-subtitle">
          Enter your unique Complaint ID (e.g. VRT-2026-00101) to check progress updates and official responses.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} color="var(--text-light)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.4rem', fontFamily: 'monospace', fontSize: '0.95rem' }}
            placeholder="Enter Complaint ID (e.g. VRT-2026-00101)"
            value={complaintNum}
            onChange={(e) => setComplaintNum(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Searching...' : 'Track Status'}
        </button>
      </form>

      {/* Error Message */}
      {errorMsg && (
        <div className="alert alert-danger" style={{ textAlign: 'center', justifyContent: 'center' }}>
          <AlertCircle size={18} />
          <div>{errorMsg} Check Complaint ID format. Sample: <code>VRT-2026-00101</code></div>
        </div>
      )}

      {/* Complaint Output */}
      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Metadata Card */}
          <div className="card">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h2 style={{ fontSize: '1.3rem', fontFamily: 'monospace', color: 'var(--primary)', margin: 0 }}>
                    {data.complaint.complaint_num}
                  </h2>
                  <span className={`badge badge-${data.complaint.status.toLowerCase()}`}>
                    {data.complaint.status.replace('_', ' ')}
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-light)', margin: '0.2rem 0 0' }}>
                  Submitted on {new Date(data.complaint.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </p>
              </div>

              <div>
                <span className="badge badge-approved">
                  AI {data.ai_moderation ? data.ai_moderation.result : 'VERIFIED'}
                </span>
              </div>
            </div>

            {/* Grid Attributes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>Category</span>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>{data.complaint.category}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>Department</span>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>{data.complaint.department_name}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block' }}>Assigned Level</span>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>{data.complaint.assigned_to_role || 'College Management'}</strong>
              </div>
            </div>

            {/* Complaint Text */}
            <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.25rem' }}>Grievance Description</span>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.5 }}>
                {data.complaint.description}
              </p>

              {data.complaint.attachment_url && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
                  <a 
                    href={data.complaint.attachment_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-secondary"
                  >
                    <Paperclip size={13} /> View Attachment Document
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Progress Timeline */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={18} color="var(--primary)" /> Complaint Resolution Timeline
            </h3>

            <Timeline 
              currentStatus={data.complaint.status} 
              updates={data.timeline}
              aiLog={data.ai_moderation}
            />
          </div>

        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Shield, AlertTriangle, CheckCircle2, Paperclip, Copy, Check, Info } from 'lucide-react';

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  // Form State
  const [category, setCategory] = useState('Academic Issues');
  const [departmentId, setDepartmentId] = useState('');
  const [preferredAuthority, setPreferredAuthority] = useState('ANY');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [resultModal, setResultModal] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const categories = [
    'Academic Issues',
    'Faculty Related',
    'Examination',
    'Infrastructure',
    'Hostel',
    'Transport',
    'Fees',
    'Harassment/Bullying',
    'Facilities',
    'Technical Issues',
    'General Complaint',
    'Suggestions',
    'Other'
  ];

  useEffect(() => {
    fetch('/api/complaints/departments')
      .then(res => res.json())
      .then(data => {
        setDepartments(data);
        if (data.length > 0) {
          setDepartmentId(data[0].id.toString());
        }
        setLoadingDepts(false);
      })
      .catch(err => {
        console.error('Failed to load departments:', err);
        setLoadingDepts(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!description || description.trim().length < 10) {
      setErrorMsg('Please write a clear description of at least 10 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('department_id', departmentId);
      formData.append('preferred_authority', preferredAuthority);
      formData.append('description', description);
      if (attachment) {
        formData.append('attachment', attachment);
      }

      const res = await fetch('/api/complaints/submit', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.status === 422) {
        // AI Rejection
        setResultModal({
          success: false,
          aiStatus: 'REJECTED',
          message: data.message,
          reason: data.reason || 'Content contained prohibited harmful language or spam.'
        });
      } else if (res.ok && data.success) {
        // AI Approved or Needs Review
        setResultModal({
          success: true,
          complaintId: data.complaint_id,
          aiStatus: data.ai_status,
          message: data.message,
          instruction: data.tracking_instruction,
          feedback: data.ai_feedback
        });
      } else {
        setErrorMsg(data.error || 'Failed to submit complaint. Please try again.');
      }

    } catch (err) {
      setSubmitting(false);
      setErrorMsg('Network error connecting to backend API.');
    }
  };

  const copyComplaintId = (id) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container" style={{ maxWidth: '720px' }}>
      
      <div className="page-header">
        <h1 className="page-title">Submit Anonymous Grievance</h1>
        <p className="page-subtitle">
          Your complaint is routed safely through AI verification directly to college management. Identity is not logged.
        </p>
      </div>

      {errorMsg && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} style={{ shrink: 0 }} />
          <div>{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        
        {/* Category & Department */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          
          <div className="form-group">
            <label className="form-label">Complaint Category *</label>
            <select 
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Department *</label>
            {loadingDepts ? (
              <p style={{ color: 'var(--text-light)', fontSize: '0.8125rem' }}>Loading departments...</p>
            ) : (
              <select 
                className="form-control"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                ))}
              </select>
            )}
          </div>

        </div>

        {/* Preferred Authority */}
        <div className="form-group">
          <label className="form-label">Preferred Authority for Resolution</label>
          <select 
            className="form-control"
            value={preferredAuthority}
            onChange={(e) => setPreferredAuthority(e.target.value)}
          >
            <option value="ANY">Any Appropriate Authority (Auto-Assign)</option>
            <option value="FACULTY">Faculty Member / Advisor</option>
            <option value="HOD">Head of Department (HOD)</option>
            <option value="PRINCIPAL">Principal</option>
            <option value="CEO">CEO / College Management</option>
          </select>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Complaint Description *</label>
          <textarea
            className="form-control"
            placeholder="Describe your concern clearly with relevant factual details. (Constructive complaints regarding teachers, internal marks, or exams are allowed.)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
          />
        </div>

        {/* Attachment */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Paperclip size={15} /> Optional Attachment (Evidence Document / Image)
          </label>
          <input 
            type="file"
            className="form-control"
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => setAttachment(e.target.files[0] || null)}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.15rem' }}>
            Accepted: PDF, PNG, JPG, DOC (Max 5MB).
          </span>
        </div>

        {/* AI Information Alert */}
        <div className="alert alert-info" style={{ marginTop: '1rem', marginBottom: '1.25rem' }}>
          <Info size={18} style={{ shrink: 0 }} />
          <div style={{ fontSize: '0.8125rem' }}>
            <strong>AI Moderation Safeguard:</strong> Submissions are analyzed for abusive language, threats, and spam. Legitimate complaints about internal marks, teachers, or exams are permitted.
          </div>
        </div>

        <button 
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
          style={{ width: '100%', padding: '0.65rem' }}
        >
          {submitting ? 'Verifying AI Safety Rules...' : 'Submit Anonymous Grievance'}
        </button>

      </form>

      {/* Result Modal */}
      {resultModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {resultModal.success ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  backgroundColor: 'var(--success-bg)', color: 'var(--success-text)',
                  border: '1px solid var(--success-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem'
                }}>
                  <CheckCircle2 size={28} />
                </div>

                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>
                  {resultModal.message}
                </h2>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  {resultModal.instruction}
                </p>

                {/* Complaint ID Card */}
                <div style={{
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.25rem'
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Your Secret Complaint ID
                  </span>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: 'var(--primary)',
                    letterSpacing: '0.04em',
                    margin: '0.2rem 0',
                    fontFamily: 'monospace'
                  }}>
                    {resultModal.complaintId}
                  </div>

                  <button 
                    onClick={() => copyComplaintId(resultModal.complaintId)}
                    className="btn btn-sm btn-secondary"
                    style={{ marginTop: '0.25rem' }}
                  >
                    {copied ? <Check size={14} color="var(--success-text)" /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Complaint ID'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button 
                    onClick={() => navigate(`/track?id=${resultModal.complaintId}`)}
                    className="btn btn-primary"
                  >
                    Track Status Now
                  </button>
                  <button 
                    onClick={() => {
                      setResultModal(null);
                      setDescription('');
                      setAttachment(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Submit Another
                  </button>
                </div>
              </div>
            ) : (
              /* AI Rejection Feedback */
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)',
                  border: '1px solid var(--danger-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem'
                }}>
                  <AlertTriangle size={28} />
                </div>

                <h2 style={{ fontSize: '1.2rem', color: 'var(--danger-text)', marginBottom: '0.5rem' }}>
                  Inappropriate Content Detected
                </h2>

                <div className="alert alert-danger" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
                  <div>
                    <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{resultModal.message}</p>
                    <p style={{ fontSize: '0.8125rem', margin: 0 }}>Reason: {resultModal.reason}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setResultModal(null)}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  Edit & Rewrite Complaint
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

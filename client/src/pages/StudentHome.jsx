import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Send, Search, Lock, Cpu, CheckCircle2, ChevronDown, ChevronUp, UserX, FileText } from 'lucide-react';

export default function StudentHome() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "Can the college faculty or management trace my identity?",
      a: "No. Verita is engineered with a zero-identity data architecture. The system never asks for or logs student names, register numbers, email addresses, IP logs, or phone numbers. Authorities only see the complaint text and category."
    },
    {
      q: "Will my complaint be rejected if it is about a teacher or internal marks?",
      a: "No. Verita AI is explicitly configured to permit constructive grievances regarding faculty members, internal marks reduction, exam schedule conflicts, or administration. AI only filters out toxic profanity, personal threats, harassment, and spam."
    },
    {
      q: "How do I check the progress of my complaint?",
      a: "Upon submitting a grievance, Verita generates a unique Complaint ID (e.g. VRT-2026-00125). Save this ID. You can enter it on the 'Track Status' page anytime to view real-time updates and official responses."
    },
    {
      q: "What happens if the AI flags my complaint as 'NEEDS REVIEW'?",
      a: "If a complaint contains sensitive or complex context, it is routed to an authorized administrator for human review rather than being automatically rejected."
    }
  ];

  return (
    <div>
      {/* Top Banner Header */}
      <section style={{
        padding: '3rem 1rem 2.5rem',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.75rem',
            borderRadius: '999px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.8125rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>
            <Shield size={15} /> Student Voice – Anonymous College Grievance System
          </div>

          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: '800',
            color: 'var(--text-main)',
            marginBottom: '0.75rem',
            lineHeight: 1.2
          }}>
            Speak Up. Be Heard. <span style={{ color: 'var(--primary)' }}>Stay Anonymous.</span>
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'var(--text-muted)',
            maxWidth: '640px',
            margin: '0 auto 1.75rem',
            lineHeight: 1.5
          }}>
            A secure, open-access platform for college students to report grievances, academic concerns, or suggestions directly to campus authorities without creating an account or revealing their identity.
          </p>

          {/* Core Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
            <Link to="/submit" className="btn btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
              <Send size={16} /> Submit a Complaint
            </Link>
            <Link to="/track" className="btn btn-secondary" style={{ padding: '0.65rem 1.4rem' }}>
              <Search size={16} /> Track Complaint
            </Link>
            <a href="#how-it-works" className="btn btn-secondary" style={{ padding: '0.65rem 1.2rem' }}>
              <Cpu size={16} /> How It Works
            </a>
            <a href="#privacy" className="btn btn-secondary" style={{ padding: '0.65rem 1.2rem' }}>
              <Lock size={16} /> Privacy & Anonymity
            </a>
          </div>

        </div>
      </section>

      {/* Main Content Layout */}
      <div className="container" style={{ padding: '2.5rem 1rem' }}>
        
        {/* Quick Portal Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Send size={20} />
              </div>
              <h2 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Submit Anonymous Grievance</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                File an academic, infrastructure, fee, or faculty-related issue securely. No personal details required.
              </p>
            </div>
            <Link to="/submit" className="btn btn-primary" style={{ width: '100%' }}>
              File Grievance Form →
            </Link>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Search size={20} />
              </div>
              <h2 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Track Existing Complaint</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Enter your unique Complaint ID (e.g. VRT-2026-00125) to view live progress updates and official responses.
              </p>
            </div>
            <Link to="/track" className="btn btn-secondary" style={{ width: '100%' }}>
              Check Status Tracker →
            </Link>
          </div>

        </div>

        {/* How It Works Section */}
        <section id="how-it-works" style={{ marginBottom: '2.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>AI Moderated Resolution Workflow</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Structured workflow from student submission to official resolution</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            
            <div className="card" style={{ padding: '1.15rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Step 1</span>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.35rem' }}>Anonymous Submission</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                Student submits grievance without account login or identity details.
              </p>
            </div>

            <div className="card" style={{ padding: '1.15rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Step 2</span>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.35rem' }}>AI Moderation</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                AI analyzes language safety while safeguarding legitimate complaints against faculty.
              </p>
            </div>

            <div className="card" style={{ padding: '1.15rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Step 3</span>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.35rem' }}>Authority Routing</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                Approved complaints route automatically to Faculty, HOD, Principal, or CEO.
              </p>
            </div>

            <div className="card" style={{ padding: '1.15rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Step 4</span>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.35rem' }}>Status & Resolution</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                Student tracks real-time progress using secret Complaint ID.
              </p>
            </div>

          </div>
        </section>

        {/* Privacy & Guarantee Section */}
        <section id="privacy" style={{ marginBottom: '2.5rem' }}>
          <div className="card" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <div style={{ maxWidth: '700px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Lock size={18} color="var(--primary)" />
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Privacy & Anonymity Protocol</h2>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
                Verita guarantees complete student privacy. No register numbers, phone numbers, or email addresses are stored in the database. Faculty and administration receive only the category, department, and description of the grievance.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--text-main)', marginBottom: '0.15rem' }}>No User Registration</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Students can file complaints without logging in or creating an account.</span>
                </div>
                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--text-main)', marginBottom: '0.15rem' }}>Fair Moderation</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Grievances about teachers, marks, or administration are allowed.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} className="card" style={{ padding: '1rem', cursor: 'pointer' }} onClick={() => toggleFaq(idx)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '0.925rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>{faq.q}</h3>
                  {openFaq === idx ? <ChevronUp size={18} color="var(--primary)" /> : <ChevronDown size={18} color="var(--text-light)" />}
                </div>
                {openFaq === idx && (
                  <p style={{ marginTop: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: '0.5rem 0 0' }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

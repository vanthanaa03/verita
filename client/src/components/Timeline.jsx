import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

export default function Timeline({ currentStatus, updates = [], aiLog }) {
  const stages = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'AI_VERIFIED', label: 'AI Verified' },
    { key: 'FORWARDED', label: 'Forwarded' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'RESOLVED', label: 'Resolved' }
  ];

  const getActiveIndex = (status) => {
    switch (status) {
      case 'NEW': return 2;
      case 'UNDER_REVIEW': return 3;
      case 'IN_PROGRESS': return 3;
      case 'RESOLVED': return 4;
      case 'REJECTED': return 1;
      default: return 1;
    }
  };

  const activeIndex = getActiveIndex(currentStatus);

  return (
    <div style={{ margin: '1rem 0' }}>
      {/* Horizontal Step Progress Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        marginBottom: '1.75rem',
        padding: '0 0.5rem'
      }}>
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '6%',
          right: '6%',
          height: '2px',
          backgroundColor: 'var(--border-color)',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '6%',
          width: `${(activeIndex / (stages.length - 1)) * 88}%`,
          height: '2px',
          backgroundColor: 'var(--primary)',
          transition: 'width 0.3s ease',
          zIndex: 1
        }} />

        {stages.map((stage, idx) => {
          const isDone = idx <= activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={stage.key} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 2,
              gap: '0.3rem',
              flex: 1
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: isDone ? 'var(--primary)' : 'var(--bg-surface)',
                border: isDone ? '2px solid var(--primary)' : '2px solid var(--border-color)',
                color: isDone ? '#ffffff' : 'var(--text-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '700'
              }}>
                {isDone ? '✓' : idx + 1}
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: isCurrent ? '700' : '500',
                color: isCurrent ? 'var(--primary)' : isDone ? 'var(--text-main)' : 'var(--text-light)',
                textAlign: 'center'
              }}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Official Log & Response History */}
      <div style={{ marginTop: '1.25rem' }}>
        <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Official Activity & Response History
        </h4>

        {updates.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic' }}>No activity records available yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {updates.map((update, idx) => (
              <div key={idx} style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge badge-${update.status.toLowerCase()}`}>
                      {update.status.replace('_', ' ')}
                    </span>
                    <strong style={{ color: 'var(--text-main)' }}>
                      {update.updated_by_name} ({update.updated_by_role})
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                    {new Date(update.timestamp).toLocaleString()}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', margin: 0, marginTop: '0.25rem', lineHeight: 1.4 }}>
                  {update.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

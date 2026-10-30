import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = '#1e40af', badgeText }) {
  return (
    <div className="card" style={{ padding: '1.1rem', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-muted)' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            padding: '0.35rem',
            borderRadius: '4px',
            backgroundColor: `${color}10`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={16} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: 1.1 }}>
          {value}
        </span>
        {badgeText && (
          <span style={{ fontSize: '0.7rem', color: color, fontWeight: '600', backgroundColor: `${color}12`, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem', margin: 0 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

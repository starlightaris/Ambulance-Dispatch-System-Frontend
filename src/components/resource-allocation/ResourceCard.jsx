import React from 'react';

const getToneClass = (tone) => {
  switch (tone) {
    case 'ok': return 'ra-tone-ok';
    case 'warning': return 'ra-tone-warning';
    case 'danger': return 'ra-tone-danger';
    case 'info': return 'ra-tone-info';
    default: return 'ra-tone-default';
  }
};

export default function ResourceCard({ title, value, meta, tone = 'default' }) {
  const toneClass = getToneClass(tone);

  return (
    <div className={`ra-stat-card ${toneClass}`}>
      <span className="ra-stat-title">{title}</span>
      <strong className="ra-stat-value">{value}</strong>
      {meta ? <span className="ra-stat-meta">{meta}</span> : null}
    </div>
  );
}

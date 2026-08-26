import React from 'react';

const CIRC = 2 * Math.PI * 40;

export default function CoverageGauge({ covered, total }) {
  const pct = total > 0 ? (covered / total) * 100 : 0;
  const offset = CIRC - (pct / 100) * CIRC;
  const color = pct >= 90 ? '#2ed8a7' : pct >= 60 ? '#f5a623' : '#ff4d5e';

  return (
    <div className="gauge-wrap">
      <div className="gauge">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle className="gauge-bg" cx="48" cy="48" r="40" />
          <circle
            className="gauge-fg"
            cx="48" cy="48" r="40"
            stroke={color}
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="gauge-label">
          <div className="pct">{total > 0 ? Math.round(pct) + '%' : '—'}</div>
          <div className="cap">COVERED</div>
        </div>
      </div>
      <div className="gauge-meta">
        <div><b>{covered}</b> / <b>{total}</b> nodes within threshold</div>
        <div style={{ marginTop: 6 }}><b>{total - covered}</b> blind spot(s) flagged</div>
      </div>
    </div>
  );
}
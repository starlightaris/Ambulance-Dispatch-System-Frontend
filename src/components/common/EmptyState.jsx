import React from 'react';

// Small italic placeholder shown wherever a list/chart/page has nothing to
// display yet (no data loaded, or a module still being built).
export default function EmptyState({ children }) {
  return <div className="empty-note">{children}</div>;
}

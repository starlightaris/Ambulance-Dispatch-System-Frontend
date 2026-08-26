import React from 'react';
import EmptyState from '../components/common/EmptyState.jsx';
import '../styles/triage.css';

// Placeholder — swap this out once components/triage/* screens exist.
export default function TriagePage() {
  return (
    <div className="page-placeholder triage-page">
      <h1>Triage</h1>
      <EmptyState>This module hasn't been built yet — components go in components/triage/, API calls in api/triage.api.js.</EmptyState>
    </div>
  );
}

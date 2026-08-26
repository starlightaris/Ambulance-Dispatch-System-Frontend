import React from 'react';
import EmptyState from '../components/common/EmptyState.jsx';
import '../styles/scheduling.css';

// Placeholder — swap this out once components/scheduling/* screens exist.
export default function SchedulingPage() {
  return (
    <div className="page-placeholder scheduling-page">
      <h1>Scheduling</h1>
      <EmptyState>This module hasn't been built yet — components go in components/scheduling/, API calls in api/scheduling.api.js.</EmptyState>
    </div>
  );
}

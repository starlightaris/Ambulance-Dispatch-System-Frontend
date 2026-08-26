import React from 'react';
import EmptyState from '../components/common/EmptyState.jsx';
import '../styles/routing.css';

// Placeholder — swap this out once components/routing/* screens exist.
export default function RoutingPage() {
  return (
    <div className="page-placeholder routing-page">
      <h1>Routing</h1>
      <EmptyState>This module hasn't been built yet — components go in components/routing/, API calls in api/routing.api.js.</EmptyState>
    </div>
  );
}

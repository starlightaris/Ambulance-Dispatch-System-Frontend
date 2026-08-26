import React from 'react';
import EmptyState from '../components/common/EmptyState.jsx';
import '../styles/resource-allocation.css';

// Placeholder — swap this out once components/resource-allocation/* screens exist.
export default function ResourceAllocationPage() {
  return (
    <div className="page-placeholder resource-allocation-page">
      <h1>Resource Allocation</h1>
      <EmptyState>This module hasn't been built yet — components go in components/resource-allocation/, API calls in api/resourceAllocation.api.js.</EmptyState>
    </div>
  );
}

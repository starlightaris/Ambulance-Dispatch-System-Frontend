import React, { useState } from 'react';
import ScheduleTabs from '../components/scheduling/ScheduleTabs.jsx';
import '../styles/scheduling.css';

export default function SchedulingPage() {
  const [activeTab, setActiveTab] = useState('roster');

  return (
    <div className="schedule-page">
      <ScheduleTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="schedule-tab-content">
        {activeTab === 'roster' && <div className="empty-note">Roster tab — coming soon.</div>}
        {activeTab === 'run-compare' && <div className="empty-note">Run & Compare tab — coming soon.</div>}
        {activeTab === 'staff' && <div className="empty-note">Staff tab — coming soon.</div>}
        {activeTab === 'shift-template' && <div className="empty-note">Shift Template tab — coming soon.</div>}
      </div>
    </div>
  );
}
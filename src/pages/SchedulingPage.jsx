import React, { useState } from 'react';
import ScheduleTabs from '../components/scheduling/ScheduleTabs.jsx';
import StaffTab from '../components/scheduling/StaffTab.jsx';
import ShiftSlotTab from '../components/scheduling/ShiftSlotTab.jsx';
import RunCompareTab from '../components/scheduling/RunCompareTab.jsx';
import RosterTab from '../components/scheduling/RosterTab.jsx';
import '../styles/scheduling.css';

export default function SchedulingPage() {
  const [activeTab, setActiveTab] = useState('roster');

  return (
    <div className="schedule-page">
      <ScheduleTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="schedule-tab-content">
        {activeTab === 'roster' && <RosterTab />}
        {activeTab === 'run-compare' && <RunCompareTab />}
        {activeTab === 'staff' && <StaffTab />}
        {activeTab === 'shift-template' && <ShiftSlotTab />}
      </div>
    </div>
  );
}
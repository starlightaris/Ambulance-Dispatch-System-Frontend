import React from 'react';
import { NavLink } from 'react-router-dom';

const GROUPS = [
  {
    label: 'Live Dispatch',
    links: [
      { to: '/', label: 'Network Detection', end: true },
      { to: '/routing', label: 'Routing' },
      { to: '/triage', label: 'Triage' },
    ],
  },
  {
    label: 'Command & Planning',
    links: [
      { to: '/resource-allocation', label: 'Resource Allocation' },
      { to: '/scheduling', label: 'Scheduling' },
    ],
  },
];

// Top-level nav shared by every module page.
export default function NavBar() {
  return (
    <nav className="top-nav">
      <div className="top-nav-brand">Ambulance Dispatch</div>
      {GROUPS.map((group) => (
        <div className="top-nav-group" key={group.label}>
          <span className="top-nav-group-label">{group.label}</span>
          <div className="top-nav-links">
            {group.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
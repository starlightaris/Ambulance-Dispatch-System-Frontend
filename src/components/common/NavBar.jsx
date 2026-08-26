import React from 'react';
import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Network Detection', end: true },
  { to: '/triage', label: 'Triage' },
  { to: '/scheduling', label: 'Scheduling' },
  { to: '/resource-allocation', label: 'Resource Allocation' },
  { to: '/routing', label: 'Routing' },
];

// Top-level nav shared by every module page.
export default function NavBar() {
  return (
    <nav className="top-nav">
      <div className="top-nav-brand">Ambulance Dispatch</div>
      <div className="top-nav-links">
        {LINKS.map((link) => (
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
    </nav>
  );
}

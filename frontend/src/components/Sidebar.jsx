import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const navItems = [
    { to: '/dashboard', icon: '▣', label: 'Dashboard' },
    { to: '/projects', icon: '◫', label: 'Projects' },
    { to: '/tasks', icon: '✓', label: 'Tasks' },
    ...(user?.role === 'admin' ? [{ to: '/users', icon: '◍', label: 'Users' }] : []),
  ];

  return (
    <div className="d-flex flex-column h-100 p-3 text-white">
      <div className="d-flex align-items-center gap-2 mb-4 p-2 rounded-3 bg-white bg-opacity-10">
        <div className="brand-badge">TM</div>
        <div>
          <div className="fw-bold">TaskManager</div>
          <div className="small text-white-50">Workspace</div>
        </div>
      </div>

      <nav className="nav flex-column gap-1 flex-grow-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link sidebar-link d-flex align-items-center gap-2 px-3 py-2 ${isActive ? 'active' : ''}`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-top border-light border-opacity-10 pt-3 mt-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="brand-badge" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
            {initials}
          </div>
          <div className="overflow-hidden">
            <div className="fw-semibold small text-truncate">{user?.name}</div>
            <div className="small text-white-50 text-capitalize">{user?.role}</div>
          </div>
        </div>
        <button className="btn btn-outline-light btn-sm w-100" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
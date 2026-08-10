import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/Badge';
import {
  LayoutDashboard,
  Users,
  Package,
  ArrowUpDown,
  FileText,
  UserCheck,
  LogOut,
  Building2,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Redesigned Enterprise Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-badge">
            <Building2 size={20} />
          </div>
          <div>
            <div className="brand-name">Mini ERP + CRM</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Operations Hub</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {/* Section 1: Operations */}
          <div className="nav-section">
            <div className="nav-section-title">Operations</div>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={17} /> Dashboard
            </NavLink>
            <NavLink to="/customers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={17} /> Customer CRM
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Package size={17} /> Product Catalog
            </NavLink>
            <NavLink to="/stock-movements" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ArrowUpDown size={17} /> Stock Movements
            </NavLink>
          </div>

          {/* Section 2: Sales */}
          <div className="nav-section">
            <div className="nav-section-title">Sales Pipeline</div>
            <NavLink to="/sales-challans" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FileText size={17} /> Sales Challans
            </NavLink>
          </div>

          {/* Section 3: Administration */}
          {hasRole('ADMIN') && (
            <div className="nav-section">
              <div className="nav-section-title">Administration</div>
              <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <UserCheck size={17} /> User Management
              </NavLink>
            </div>
          )}
        </nav>

        {/* Sidebar Footer User Info & Logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>
            <LogOut size={15} /> Logout Session
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="main-content">
        <header className="top-navbar">
          <div className="page-breadcrumb">
            <Building2 size={16} color="#64748b" />
            <span>Enterprise Distribution Operations</span>
          </div>

          <div className="user-profile-bar">
            {user && <RoleBadge role={user.role} />}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{user?.name}</div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{user?.email}</div>
            </div>
          </div>
        </header>

        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, token, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', fontWeight: 600 }}>Loading Portal...</div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(...allowedRoles)) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-danger)' }}>
        <h2>Access Denied</h2>
        <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
          Your role (<strong>{user.role}</strong>) does not have authorization to view this module.
        </p>
      </div>
    );
  }

  return <Outlet />;
};

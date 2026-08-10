import React from 'react';
import { ChallanStatus, CustomerStatus, Role } from '../../types';

export const ChallanStatusBadge: React.FC<{ status: ChallanStatus }> = ({ status }) => {
  const map: Record<ChallanStatus, string> = {
    DRAFT: 'badge-draft',
    APPROVED: 'badge-approved',
    DISPATCHED: 'badge-dispatched',
    DELIVERED: 'badge-delivered',
    CANCELLED: 'badge-cancelled',
  };
  return <span className={`badge ${map[status] || 'badge-draft'}`}>{status}</span>;
};

export const CustomerStatusBadge: React.FC<{ status: CustomerStatus }> = ({ status }) => {
  const map: Record<CustomerStatus, string> = {
    ACTIVE: 'badge-delivered',
    INACTIVE: 'badge-draft',
    BLOCKED: 'badge-cancelled',
  };
  return <span className={`badge ${map[status] || 'badge-draft'}`}>{status}</span>;
};

export const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  const map: Record<Role, string> = {
    ADMIN: 'role-admin',
    SALES: 'role-sales',
    WAREHOUSE: 'role-warehouse',
    ACCOUNTS: 'role-accounts',
  };
  return <span className={`role-pill ${map[role] || 'role-sales'}`}>{role}</span>;
};

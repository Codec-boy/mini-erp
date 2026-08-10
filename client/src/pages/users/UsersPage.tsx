import React, { useEffect, useState } from 'react';
import { userApi } from '../../api/userApi';
import { User, PaginationMeta, Role } from '../../types';
import { RoleBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { Plus, Search, Check, X } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SALES' as Role,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getUsers({ page, limit: 10, search });
      setUsers(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleOpenModal = () => {
    setFormData({
      name: '',
      email: '',
      password: 'Password123!',
      role: 'SALES',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await userApi.createUser(formData);
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'Failed to create user');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await userApi.toggleStatus(user.id, !user.isActive);
      fetchUsers();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            User Management & RBAC Provisioning
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            System Access Accounts & Role Permission Hierarchy (Admin Controls)
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenModal}>
          <Plus size={16} /> Provision User Account
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search system users by Name or Email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Users Data Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Account Status</th>
                <th>Created Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading system user accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No system users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 700 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <RoleBadge role={u.role} />
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-sm)',
                          background: u.isActive ? '#f0fdf4' : '#fef2f2',
                          color: u.isActive ? '#15803d' : '#b91c1c',
                          border: `1px solid ${u.isActive ? '#bbf7d0' : '#fecaca'}`,
                        }}
                      >
                        {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className={`btn ${u.isActive ? 'btn-danger' : 'btn-success'} btn-sm`}
                        onClick={() => handleToggleStatus(u)}
                      >
                        {u.isActive ? <X size={13} /> : <Check size={13} />}
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Modal Dialog */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Provision New User Account">
        {formError && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger-border)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Full Name</label>
            <input
              type="text"
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ramesh Kumar"
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Email Address</label>
            <input
              type="email"
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ramesh@minierp.com"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label className="input-label">Initial Password</label>
              <input
                type="password"
                className="input-field"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label">System Role</label>
              <select
                className="input-field"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                required
              >
                <option value="ADMIN">ADMIN</option>
                <option value="SALES">SALES</option>
                <option value="WAREHOUSE">WAREHOUSE</option>
                <option value="ACCOUNTS">ACCOUNTS</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create User Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

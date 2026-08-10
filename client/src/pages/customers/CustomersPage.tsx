import React, { useEffect, useState } from 'react';
import { customerApi } from '../../api/customerApi';
import { Customer, PaginationMeta } from '../../types';
import { CustomerStatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Edit } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { hasRole } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    creditLimit: 100000,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerApi.getCustomers({ page, limit: 10, search });
      setCustomers(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const handleOpenCreateModal = () => {
    setEditingCustomer(null);
    setFormData({
      code: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      gstin: '',
      creditLimit: 100000,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      code: cust.code,
      companyName: cust.companyName,
      contactPerson: cust.contactPerson,
      email: cust.email,
      phone: cust.phone,
      address: cust.address,
      gstin: cust.gstin || '',
      creditLimit: cust.creditLimit,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (editingCustomer) {
        await customerApi.updateCustomer(editingCustomer.id, formData);
      } else {
        await customerApi.createCustomer(formData);
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'Failed to save customer');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Customer CRM Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Enterprise Account Profiles, Credit Control & Ledger Summaries
          </p>
        </div>

        {hasRole('ADMIN', 'SALES') && (
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={16} /> Add New Customer
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by Company Name, Code, Phone, Contact Person..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
      </div>

      {/* Customers Data Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Company & Contact</th>
                <th>Phone / Email</th>
                <th style={{ textAlign: 'right' }}>Credit Limit</th>
                <th style={{ textAlign: 'right' }}>Outstanding</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading customer profiles...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No customer accounts found matching search.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{cust.code}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{cust.companyName}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Contact: {cust.contactPerson}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>{cust.phone}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{cust.email}</div>
                    </td>
                    <td className="num-cell" style={{ textAlign: 'right' }}>₹{cust.creditLimit.toLocaleString('en-IN')}</td>
                    <td className="num-cell" style={{ textAlign: 'right', color: cust.outstandingBalance > 0 ? 'var(--color-warning)' : 'inherit' }}>
                      ₹{cust.outstandingBalance.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <CustomerStatusBadge status={cust.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {hasRole('ADMIN', 'SALES', 'ACCOUNTS') && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEditModal(cust)}>
                          <Edit size={13} /> Edit Profile
                        </button>
                      )}
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? `Edit Customer: ${editingCustomer.companyName}` : 'Add New CRM Customer Account'}
      >
        {formError && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger-border)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="input-label">Customer Code</label>
              <input
                type="text"
                className="input-field"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label">Company Name</label>
              <input
                type="text"
                className="input-field"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="input-label">Contact Person</label>
              <input
                type="text"
                className="input-field"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label">Phone Number</label>
              <input
                type="text"
                className="input-field"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="input-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label">GSTIN (Optional)</label>
              <input
                type="text"
                className="input-field"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Credit Limit (₹)</label>
            <input
              type="number"
              className="input-field"
              value={formData.creditLimit}
              onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label">Full Address</label>
            <textarea
              className="input-field"
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Customer Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

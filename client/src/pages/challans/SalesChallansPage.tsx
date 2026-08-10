import React, { useEffect, useState } from 'react';
import { challanApi } from '../../api/challanApi';
import { customerApi } from '../../api/customerApi';
import { productApi } from '../../api/productApi';
import { SalesChallan, Customer, Product, PaginationMeta, ChallanStatus } from '../../types';
import { ChallanStatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, CheckCircle, Truck, PackageCheck, XCircle, Trash2, ArrowRight, FileText } from 'lucide-react';

export const SalesChallansPage: React.FC = () => {
  const { user, hasRole } = useAuth();

  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Global Alert/Error Message state (e.g. Insufficient stock error)
  const [alertError, setAlertError] = useState<string | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState<
    { productId: string; quantity: number; unitPrice: number }[]
  >([]);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const res = await challanApi.getChallans({
        page,
        limit: 10,
        search,
        status: statusFilter || undefined,
      });
      setChallans(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error('Failed to fetch sales challans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [page, statusFilter, search]);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          customerApi.getCustomers({ page: 1, limit: 100 }),
          productApi.getProducts({ page: 1, limit: 100 }),
        ]);
        setCustomers(custRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        console.error('Failed to load dropdowns:', err);
      }
    };
    loadDropdowns();
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedCustomerId(customers[0]?.id || '');
    setNotes('');
    setOrderItems([
      {
        productId: products[0]?.id || '',
        quantity: 1,
        unitPrice: products[0]?.unitPrice || 0,
      },
    ]);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleAddItemRow = () => {
    const firstProd = products[0];
    if (!firstProd) return;
    setOrderItems([
      ...orderItems,
      { productId: firstProd.id, quantity: 1, unitPrice: firstProd.unitPrice },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...orderItems];
    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      updated[index].productId = value;
      if (prod) updated[index].unitPrice = prod.unitPrice;
    } else if (field === 'quantity') {
      updated[index].quantity = parseInt(value, 10) || 1;
    } else if (field === 'unitPrice') {
      updated[index].unitPrice = parseFloat(value) || 0;
    }
    setOrderItems(updated);
  };

  const calculateGrandTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    try {
      await challanApi.createChallan({
        customerId: selectedCustomerId,
        notes,
        items: orderItems,
      });
      setIsModalOpen(false);
      setAlertSuccess('Sales Challan created successfully in DRAFT state.');
      fetchChallans();
    } catch (err: any) {
      setModalError(err.response?.data?.error?.message || 'Failed to create sales challan');
    }
  };

  // Workflow State Transition Actions
  const handleApprove = async (id: string) => {
    setAlertError(null);
    setAlertSuccess(null);
    try {
      await challanApi.approveChallan(id);
      setAlertSuccess('Sales Challan approved successfully.');
      fetchChallans();
    } catch (err: any) {
      setAlertError(err.response?.data?.error?.message || 'Approval failed');
    }
  };

  const handleDispatch = async (id: string) => {
    setAlertError(null);
    setAlertSuccess(null);
    try {
      await challanApi.dispatchChallan(id);
      setAlertSuccess('Sales Challan dispatched! Inventory stock deducted atomically.');
      fetchChallans();
    } catch (err: any) {
      // Handles INSUFFICIENT_STOCK error gracefully!
      setAlertError(err.response?.data?.error?.message || 'Dispatch failed');
    }
  };

  const handleDeliver = async (id: string) => {
    setAlertError(null);
    setAlertSuccess(null);
    try {
      await challanApi.deliverChallan(id);
      setAlertSuccess('Sales Challan delivered. Customer account outstanding balance updated.');
      fetchChallans();
    } catch (err: any) {
      setAlertError(err.response?.data?.error?.message || 'Delivery mark failed');
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this Sales Challan?')) return;
    setAlertError(null);
    setAlertSuccess(null);
    try {
      await challanApi.cancelChallan(id);
      setAlertSuccess('Sales Challan cancelled. (Any dispatched inventory restored).');
      fetchChallans();
    } catch (err: any) {
      setAlertError(err.response?.data?.error?.message || 'Cancellation failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Sales Challans Pipeline
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Enterprise Wholesale Sales Order State Machine
          </p>
        </div>

        {hasRole('ADMIN', 'SALES') && (
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={16} /> Create Sales Challan
          </button>
        )}
      </div>

      {/* Challan Pipeline State Stepper */}
      <div className="challan-pipeline">
        <div className="pipeline-step active">
          <FileText size={16} color="#2563eb" /> 1. DRAFT (Order Created)
        </div>
        <ArrowRight size={16} color="#cbd5e1" />
        <div className="pipeline-step active">
          <CheckCircle size={16} color="#2563eb" /> 2. APPROVED (Sales Auth)
        </div>
        <ArrowRight size={16} color="#cbd5e1" />
        <div className="pipeline-step active">
          <Truck size={16} color="#b45309" /> 3. DISPATCHED (Stock Deducted)
        </div>
        <ArrowRight size={16} color="#cbd5e1" />
        <div className="pipeline-step completed">
          <PackageCheck size={16} color="#15803d" /> 4. DELIVERED (Ledger Billed)
        </div>
      </div>

      {/* Global Alerts */}
      {alertError && (
        <div
          style={{
            padding: '0.85rem 1.1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            border: '1px solid var(--color-danger-border)',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <XCircle size={18} />
          {alertError}
        </div>
      )}

      {alertSuccess && (
        <div
          style={{
            padding: '0.85rem 1.1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            border: '1px solid var(--color-success-border)',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle size={18} />
          {alertSuccess}
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by Challan #, Customer Name, Code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <select
            className="input-field"
            style={{ width: '190px' }}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="APPROVED">APPROVED</option>
            <option value="DISPATCHED">DISPATCHED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Challans Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Challan #</th>
                <th>Customer</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Grand Total</th>
                <th style={{ textAlign: 'center' }}>Line Items</th>
                <th>Created Date</th>
                <th>Workflow Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading sales challans pipeline...
                  </td>
                </tr>
              ) : challans.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No sales challans recorded.
                  </td>
                </tr>
              ) : (
                challans.map((ch) => (
                  <tr key={ch.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{ch.challanNumber}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{ch.customer?.companyName}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Code: {ch.customer?.code}</div>
                    </td>
                    <td>
                      <ChallanStatusBadge status={ch.status} />
                    </td>
                    <td className="num-cell" style={{ textAlign: 'right' }}>₹{ch.totalAmount.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'center' }}>{ch._count?.items || 0} items</td>
                    <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      {new Date(ch.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {/* DRAFT -> Approve */}
                        {ch.status === 'DRAFT' && hasRole('ADMIN', 'SALES') && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleApprove(ch.id)}>
                            <CheckCircle size={13} color="#2563eb" /> Approve
                          </button>
                        )}

                        {/* APPROVED -> Dispatch */}
                        {ch.status === 'APPROVED' && hasRole('ADMIN', 'WAREHOUSE') && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleDispatch(ch.id)}>
                            <Truck size={13} color="#b45309" /> Dispatch
                          </button>
                        )}

                        {/* DISPATCHED -> Deliver */}
                        {ch.status === 'DISPATCHED' && hasRole('ADMIN', 'ACCOUNTS') && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleDeliver(ch.id)}>
                            <PackageCheck size={13} color="#15803d" /> Deliver
                          </button>
                        )}

                        {/* Cancel Button */}
                        {ch.status !== 'CANCELLED' && ch.status !== 'DELIVERED' && hasRole('ADMIN', 'SALES') && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleCancel(ch.id)}>
                            <XCircle size={13} /> Cancel
                          </button>
                        )}
                      </div>
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
        title="Create New Sales Order Challan"
      >
        {modalError && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger-border)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {modalError}
          </div>
        )}

        <form onSubmit={handleCreateSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Select Customer</label>
            <select
              className="input-field"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.code}) - Credit Limit: ₹{c.creditLimit.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>Order Line Items</label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItemRow}>
                <Plus size={14} /> Add Line Item
              </button>
            </div>

            {orderItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <select
                  className="input-field"
                  style={{ flex: 2 }}
                  value={item.productId}
                  onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} - {p.name} (Stock: {p.stock?.currentQuantity || 0} {p.unit})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  className="input-field"
                  style={{ flex: 1 }}
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                  min={1}
                  required
                />

                <input
                  type="number"
                  className="input-field"
                  style={{ flex: 1 }}
                  placeholder="Price"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                  min={0}
                  required
                />

                {orderItems.length > 1 && (
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveItemRow(idx)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ padding: '0.75rem', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Order Grand Total:</span>
            <span style={{ color: 'var(--accent-primary)', fontSize: '1.1rem' }} className="num-cell">₹{calculateGrandTotal().toLocaleString('en-IN')}</span>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label">Order Notes / Instructions</label>
            <input
              type="text"
              className="input-field"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Special freight packaging required"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Generate Sales Challan (DRAFT)
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

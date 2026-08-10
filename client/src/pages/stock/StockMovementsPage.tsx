import React, { useEffect, useState } from 'react';
import { inventoryApi } from '../../api/inventoryApi';
import { productApi } from '../../api/productApi';
import { StockMovement, Product, PaginationMeta } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { useAuth } from '../../context/AuthContext';
import { ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react';

export const StockMovementsPage: React.FC = () => {
  const { hasRole } = useAuth();

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    type: 'INWARD_PURCHASE',
    quantity: 10,
    reason: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getStockMovements({ page, limit: 10, type: typeFilter || undefined });
      setMovements(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error('Failed to fetch stock movements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [page, typeFilter]);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await productApi.getProducts({ page: 1, limit: 100 });
        setProducts(res.data);
        if (res.data.length > 0) {
          setFormData((prev) => ({ ...prev, productId: res.data[0].id }));
        }
      } catch (err) {
        console.error('Failed to load products for movement modal:', err);
      }
    };
    fetchAllProducts();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      productId: products[0]?.id || '',
      type: 'INWARD_PURCHASE',
      quantity: 10,
      reason: 'Purchase Inward Stock Entry',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await inventoryApi.recordMovement(formData);
      setIsModalOpen(false);
      fetchMovements();
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'Failed to record stock movement');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Stock Movement Audit Ledger
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Audit Log of Inward Purchases, Dispatches & Manual Adjustments
          </p>
        </div>

        {hasRole('ADMIN', 'WAREHOUSE') && (
          <button className="btn btn-primary" onClick={handleOpenModal}>
            <Plus size={16} /> Record Stock Inward / Adjustment
          </button>
        )}
      </div>

      {/* Filter Options */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Filter Movement Type:</label>
          <select
            className="input-field"
            style={{ width: '230px' }}
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Movement Types</option>
            <option value="INWARD_PURCHASE">INWARD_PURCHASE</option>
            <option value="OUTWARD_DISPATCH">OUTWARD_DISPATCH</option>
            <option value="ADJUSTMENT_ADD">ADJUSTMENT_ADD</option>
            <option value="ADJUSTMENT_SUBTRACT">ADJUSTMENT_SUBTRACT</option>
            <option value="RETURN">RETURN</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Product & SKU</th>
                <th>Movement Type</th>
                <th style={{ textAlign: 'right' }}>Quantity</th>
                <th>Reference / Reason</th>
                <th>Logged By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading audit ledger records...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No stock movements logged yet.
                  </td>
                </tr>
              ) : (
                movements.map((mov) => {
                  const isInward = mov.type === 'INWARD_PURCHASE' || mov.type === 'ADJUSTMENT_ADD' || mov.type === 'RETURN';
                  return (
                    <tr key={mov.id}>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                        {new Date(mov.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{mov.product?.name}</div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{mov.product?.sku}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-sm)',
                            background: isInward ? '#f0fdf4' : '#fef2f2',
                            color: isInward ? '#15803d' : '#b91c1c',
                            border: `1px solid ${isInward ? '#bbf7d0' : '#fecaca'}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          {isInward ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                          {mov.type}
                        </span>
                      </td>
                      <td className="num-cell" style={{ textAlign: 'right', fontWeight: 700, color: isInward ? '#15803d' : '#b91c1c' }}>
                        {isInward ? `+${mov.quantity}` : `-${mov.quantity}`} {mov.product?.unit}
                      </td>
                      <td style={{ fontSize: '0.825rem' }}>
                        <div style={{ fontWeight: 600 }}>{mov.referenceType}</div>
                        {mov.reason && <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{mov.reason}</div>}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.825rem', fontWeight: 700 }}>{mov.createdBy?.name}</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{mov.createdBy?.role}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Record Stock Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Manual Stock Movement Entry"
      >
        {formError && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger-border)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Select Product</label>
            <select
              className="input-field"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.name} (Current Stock: {p.stock?.currentQuantity || 0} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="input-label">Movement Type</label>
              <select
                className="input-field"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="INWARD_PURCHASE">INWARD_PURCHASE (+ Stock)</option>
                <option value="ADJUSTMENT_ADD">ADJUSTMENT_ADD (+ Stock)</option>
                <option value="ADJUSTMENT_SUBTRACT">ADJUSTMENT_SUBTRACT (- Stock)</option>
              </select>
            </div>

            <div>
              <label className="input-label">Quantity</label>
              <input
                type="number"
                className="input-field"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 0 })}
                min={1}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label">Reason / Reference Notes</label>
            <input
              type="text"
              className="input-field"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g. Purchase order PO-998 received"
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Log Stock Movement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

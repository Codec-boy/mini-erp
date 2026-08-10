import React, { useEffect, useState } from 'react';
import { productApi } from '../../api/productApi';
import { Product, PaginationMeta } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, AlertTriangle, Edit } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const ProductsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(searchParams.get('lowStockOnly') === 'true');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: 'Electronics',
    unit: 'PCS',
    unitPrice: 1000,
    costPrice: 700,
    initialStock: 50,
    minThresholdQuantity: 10,
    reorderQuantity: 50,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getProducts({
        page,
        limit: 10,
        search,
        lowStockOnly,
      });
      setProducts(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, lowStockOnly]);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      sku: `SKU-PROD-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      description: '',
      category: 'Electronics',
      unit: 'PCS',
      unitPrice: 1000,
      costPrice: 700,
      initialStock: 50,
      minThresholdQuantity: 10,
      reorderQuantity: 50,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      sku: prod.sku,
      name: prod.name,
      description: prod.description || '',
      category: prod.category,
      unit: prod.unit,
      unitPrice: prod.unitPrice,
      costPrice: prod.costPrice,
      initialStock: prod.stock?.currentQuantity || 0,
      minThresholdQuantity: prod.stock?.minThresholdQuantity || 10,
      reorderQuantity: prod.stock?.reorderQuantity || 50,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (editingProduct) {
        await productApi.updateProduct(editingProduct.id, formData);
      } else {
        await productApi.createProduct(formData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'Failed to save product');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Product & Inventory Catalog
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Stock Quantity Monitoring, SKU Catalog & Reorder Thresholds
          </p>
        </div>

        {hasRole('ADMIN') && (
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={16} /> Add New Product
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by SKU, Product Name, Category..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)', userSelect: 'none', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => {
                setLowStockOnly(e.target.checked);
                setPage(1);
              }}
              style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
            />
            <AlertTriangle size={15} color={lowStockOnly ? 'var(--color-warning)' : 'inherit'} />
            Low Stock Watchlist Only
          </label>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name & Description</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                <th style={{ textAlign: 'right' }}>Stock Inventory</th>
                <th style={{ textAlign: 'right' }}>Min Threshold</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading product catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const currentQty = prod.stock?.currentQuantity || 0;
                  const minThreshold = prod.stock?.minThresholdQuantity || 10;
                  const isLowStock = currentQty <= minThreshold;
                  const isOutOfStock = currentQty === 0;

                  return (
                    <tr key={prod.id}>
                      <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{prod.sku}</td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{prod.name}</div>
                        {prod.description && <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{prod.description}</div>}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontWeight: 600, color: '#475569' }}>
                          {prod.category}
                        </span>
                      </td>
                      <td className="num-cell" style={{ textAlign: 'right' }}>₹{prod.unitPrice.toLocaleString('en-IN')} / {prod.unit}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span
                          className="num-cell"
                          style={{
                            fontWeight: 700,
                            padding: '0.2rem 0.58rem',
                            borderRadius: 'var(--radius-sm)',
                            background: isOutOfStock ? '#fef2f2' : isLowStock ? '#fffbeb' : '#f0fdf4',
                            color: isOutOfStock ? '#b91c1c' : isLowStock ? '#b45309' : '#15803d',
                            border: `1px solid ${isOutOfStock ? '#fecaca' : isLowStock ? '#fde68a' : '#bbf7d0'}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          {isLowStock && <AlertTriangle size={13} />}
                          {currentQty} {prod.unit}
                        </span>
                      </td>
                      <td className="num-cell" style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                        {minThreshold} {prod.unit}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {hasRole('ADMIN') && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEditModal(prod)}>
                            <Edit size={13} /> Edit
                          </button>
                        )}
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

      {/* Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit Product: ${editingProduct.sku}` : 'Add New Product to Catalog'}
      >
        {formError && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger-border)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="input-label">Product SKU</label>
              <input
                type="text"
                className="input-field"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label">Category</label>
              <input
                type="text"
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Product Name</label>
            <input
              type="text"
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="input-label">Unit Price (₹)</label>
              <input
                type="number"
                className="input-field"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <label className="input-label">Cost Price (₹)</label>
              <input
                type="number"
                className="input-field"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <label className="input-label">Unit Type</label>
              <input
                type="text"
                className="input-field"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              />
            </div>
          </div>

          {!editingProduct && (
            <div style={{ marginBottom: '1rem' }}>
              <label className="input-label">Initial Opening Stock Quantity</label>
              <input
                type="number"
                className="input-field"
                value={formData.initialStock}
                onChange={(e) => setFormData({ ...formData, initialStock: parseInt(e.target.value, 10) || 0 })}
                required
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label className="input-label">Min Low-Stock Threshold</label>
              <input
                type="number"
                className="input-field"
                value={formData.minThresholdQuantity}
                onChange={(e) => setFormData({ ...formData, minThresholdQuantity: parseInt(e.target.value, 10) || 0 })}
                required
              />
            </div>
            <div>
              <label className="input-label">Reorder Quantity Target</label>
              <input
                type="number"
                className="input-field"
                value={formData.reorderQuantity}
                onChange={(e) => setFormData({ ...formData, reorderQuantity: parseInt(e.target.value, 10) || 0 })}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Product Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

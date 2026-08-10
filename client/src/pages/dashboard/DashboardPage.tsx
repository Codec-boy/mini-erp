import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { inventoryApi, InventoryOverview } from '../../api/inventoryApi';
import { challanApi } from '../../api/challanApi';
import { productApi } from '../../api/productApi';
import { Product, SalesChallan } from '../../types';
import { ChallanStatusBadge } from '../../components/common/Badge';
import {
  Package,
  AlertTriangle,
  FileText,
  Boxes,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState<InventoryOverview | null>(null);
  const [recentChallans, setRecentChallans] = useState<SalesChallan[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, challansRes, lowStockRes] = await Promise.all([
          inventoryApi.getOverview(),
          challanApi.getChallans({ page: 1, limit: 5 }),
          productApi.getProducts({ page: 1, limit: 5, lowStockOnly: true }),
        ]);

        setOverview(overviewRes.data);
        setRecentChallans(challansRes.data);
        setLowStockProducts(lowStockRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Loading enterprise metrics...</div>;
  }

  return (
    <div>
      {/* Header Banner */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.name}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Operations & Inventory Overview | Session Role: <strong style={{ color: 'var(--accent-primary)' }}>{user?.role}</strong>
          </p>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', background: 'var(--bg-secondary)', padding: '0.35rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
          Live Workspace Mode
        </div>
      </div>

      {/* Inventory Action Required Alert */}
      {overview && (overview.lowStockItemsCount > 0 || overview.outOfStockItemsCount > 0) && (
        <div
          style={{
            background: 'var(--color-warning-bg)',
            border: '1px solid var(--color-warning-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <AlertTriangle color="var(--color-warning)" size={22} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--color-warning)', fontSize: '0.9rem' }}>Inventory Reorder Action Required</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                {overview.lowStockItemsCount} item(s) below threshold reorder level and {overview.outOfStockItemsCount} item(s) out of stock.
              </div>
            </div>
          </div>
          <Link to="/products?lowStockOnly=true" className="btn btn-secondary btn-sm">
            View Low Stock Watchlist <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Corporate KPI Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Catalog Products</div>
            <div className="stat-value">{overview?.totalProducts || 0}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Package size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Total Inventory Units</div>
            <div className="stat-value">{overview?.totalUnitsInStock || 0}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <Boxes size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Low Stock Items</div>
            <div className="stat-value" style={{ color: overview?.lowStockItemsCount ? 'var(--color-warning)' : 'inherit' }}>
              {overview?.lowStockItemsCount || 0}
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#b45309' }}>
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Recent Sales Challans</div>
            <div className="stat-value">{recentChallans.length}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#f5f3ff', color: '#4f46e5' }}>
            <FileText size={22} />
          </div>
        </div>
      </div>

      {/* Main Operations Split Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Sales Challans Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Recent Sales Challans</h3>
            <Link to="/sales-challans" style={{ color: 'var(--accent-primary)', fontSize: '0.825rem', textDecoration: 'none', fontWeight: 700 }}>
              View All Pipeline →
            </Link>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Challan #</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentChallans.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                      No sales challans recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentChallans.map((ch) => (
                    <tr key={ch.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{ch.challanNumber}</td>
                      <td>{ch.customer?.companyName}</td>
                      <td>
                        <ChallanStatusBadge status={ch.status} />
                      </td>
                      <td className="num-cell" style={{ textAlign: 'right' }}>₹{ch.totalAmount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Stock Reorder Watchlist</h3>
            <Link to="/products" style={{ color: 'var(--accent-primary)', fontSize: '0.825rem', textDecoration: 'none', fontWeight: 700 }}>
              Catalog Settings →
            </Link>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th style={{ textAlign: 'right' }}>Available</th>
                  <th style={{ textAlign: 'right' }}>Min Threshold</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                      All items are above minimum reorder threshold level.
                    </td>
                  </tr>
                ) : (
                  lowStockProducts.map((prod) => (
                    <tr key={prod.id}>
                      <td style={{ fontWeight: 700 }}>{prod.sku}</td>
                      <td>{prod.name}</td>
                      <td className="num-cell" style={{ textAlign: 'right', color: 'var(--color-danger)', fontWeight: 700 }}>
                        {prod.stock?.currentQuantity || 0} {prod.unit}
                      </td>
                      <td className="num-cell" style={{ textAlign: 'right' }}>{prod.stock?.minThresholdQuantity} {prod.unit}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

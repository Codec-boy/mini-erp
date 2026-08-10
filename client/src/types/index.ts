export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export type CustomerType = 'WHOLESALE' | 'RETAIL' | 'DISTRIBUTOR';

export type ProductStatus = 'ACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK';

export type MovementType =
  | 'INWARD_PURCHASE'
  | 'OUTWARD_DISPATCH'
  | 'ADJUSTMENT_ADD'
  | 'ADJUSTMENT_SUBTRACT'
  | 'RETURN';

export type MovementRefType =
  | 'SALES_CHALLAN'
  | 'PURCHASE_ORDER'
  | 'MANUAL_ADJUSTMENT'
  | 'STOCK_TAKE';

export type ChallanStatus = 'DRAFT' | 'APPROVED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  code: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  customerType?: CustomerType;
  address: string;
  gstin?: string | null;
  creditLimit: number;
  outstandingBalance: number;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  followUpNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Stock {
  id: string;
  productId: string;
  currentQuantity: number;
  minThresholdQuantity: number;
  reorderQuantity: number;
  warehouseLocation?: string | null;
  updatedAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  category: string;
  unit: string;
  unitPrice: number;
  costPrice: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  stock?: Stock;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  referenceType: MovementRefType;
  referenceId?: string | null;
  reason?: string | null;
  createdById: string;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    unit: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export interface SalesChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productName?: string | null;
  productSku?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: Product;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  status: ChallanStatus;
  totalAmount: number;
  notes?: string | null;
  createdById: string;
  approvedById?: string | null;
  dispatchedById?: string | null;
  deliveredById?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  createdBy?: { id: string; name: string; email: string; role: Role };
  approvedBy?: { id: string; name: string };
  dispatchedBy?: { id: string; name: string };
  deliveredBy?: { id: string; name: string };
  items?: SalesChallanItem[];
  _count?: { items: number };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

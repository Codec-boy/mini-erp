import { z } from 'zod';
import { ProductStatus } from '@prisma/client';

export const createProductSchema = z.object({
  body: z.object({
    sku: z.string().min(3, 'SKU must be at least 3 characters'),
    name: z.string().min(2, 'Product name is required'),
    description: z.string().optional().nullable(),
    category: z.string().min(2, 'Category is required'),
    unit: z.string().default('PCS'),
    unitPrice: z.number().positive('Unit price must be positive'),
    costPrice: z.number().positive('Cost price must be positive'),
    initialStock: z.number().int().min(0, 'Initial stock cannot be negative').default(0),
    minThresholdQuantity: z.number().int().min(0).default(10),
    reorderQuantity: z.number().int().min(0).default(50),
    warehouseLocation: z.string().optional().default('Main Warehouse - Section A'),
    status: z.nativeEnum(ProductStatus).optional().default(ProductStatus.ACTIVE),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    sku: z.string().min(3).optional(),
    name: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    category: z.string().min(2).optional(),
    unit: z.string().optional(),
    unitPrice: z.number().positive().optional(),
    costPrice: z.number().positive().optional(),
    minThresholdQuantity: z.number().int().min(0).optional(),
    reorderQuantity: z.number().int().min(0).optional(),
    warehouseLocation: z.string().optional(),
    status: z.nativeEnum(ProductStatus).optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid Product ID'),
  }),
});

export const getProductsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    category: z.string().optional(),
    lowStockOnly: z.string().optional().transform((val) => val === 'true'),
    status: z.nativeEnum(ProductStatus).optional(),
  }),
});

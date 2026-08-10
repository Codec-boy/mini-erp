import { z } from 'zod';
import { ChallanStatus } from '@prisma/client';

export const challanItemSchema = z.object({
  productId: z.string().uuid('Invalid Product ID'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  unitPrice: z.number().positive('Unit price must be positive'),
});

export const createChallanSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid Customer ID'),
    notes: z.string().optional().nullable(),
    items: z.array(challanItemSchema).min(1, 'Sales Challan must contain at least one item'),
  }),
});

export const updateChallanSchema = z.object({
  body: z.object({
    customerId: z.string().uuid().optional(),
    notes: z.string().optional().nullable(),
    items: z.array(challanItemSchema).min(1).optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid Sales Challan ID'),
  }),
});

export const getChallansQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    status: z.nativeEnum(ChallanStatus).optional(),
    customerId: z.string().optional(),
  }),
});

export const updateChallanStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Sales Challan ID'),
  }),
});

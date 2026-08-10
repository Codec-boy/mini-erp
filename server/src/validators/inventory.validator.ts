import { z } from 'zod';
import { MovementType, MovementRefType } from '@prisma/client';

export const createStockMovementSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid Product ID'),
    type: z.nativeEnum(MovementType, { message: 'Invalid movement type' }),
    quantity: z.number().int().positive('Quantity must be greater than 0'),
    referenceType: z.nativeEnum(MovementRefType).optional().default(MovementRefType.MANUAL_ADJUSTMENT),
    referenceId: z.string().optional().nullable(),
    reason: z.string().optional().nullable(),
  }),
});

export const getStockMovementsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    productId: z.string().optional(),
    type: z.nativeEnum(MovementType).optional(),
  }),
});

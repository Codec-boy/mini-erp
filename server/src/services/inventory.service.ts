import { prisma } from '../config/db.config';
import { InsufficientStockError, NotFoundError } from '../errors/custom.error';
import { MovementType, MovementRefType, Prisma } from '@prisma/client';

export class InventoryService {
  static async recordStockMovement(
    data: {
      productId: string;
      type: MovementType;
      quantity: number;
      referenceType?: MovementRefType;
      referenceId?: string | null;
      reason?: string | null;
    },
    userId: string
  ) {
    const { productId, type, quantity, referenceType = MovementRefType.MANUAL_ADJUSTMENT, referenceId, reason } = data;

    return prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findUnique({
        where: { productId },
        include: { product: true },
      });

      if (!stock) {
        throw new NotFoundError(`Stock record not found for product ID '${productId}'`);
      }

      let quantityDelta = 0;
      if (type === MovementType.INWARD_PURCHASE || type === MovementType.ADJUSTMENT_ADD || type === MovementType.RETURN) {
        quantityDelta = quantity;
      } else if (type === MovementType.OUTWARD_DISPATCH || type === MovementType.ADJUSTMENT_SUBTRACT) {
        quantityDelta = -quantity;
      }

      const newQuantity = stock.currentQuantity + quantityDelta;

      if (newQuantity < 0) {
        throw new InsufficientStockError(
          `Operation rejected: Product '${stock.product.name}' (SKU: ${stock.product.sku}) has current stock of ${stock.currentQuantity}, which is insufficient for dispatching ${quantity} units.`
        );
      }

      // Update Stock
      const updatedStock = await tx.stock.update({
        where: { productId },
        data: { currentQuantity: newQuantity },
      });

      // Log Movement
      const movement = await tx.stockMovement.create({
        data: {
          productId,
          type,
          quantity,
          referenceType,
          referenceId,
          reason,
          createdById: userId,
        },
        include: {
          product: { select: { id: true, name: true, sku: true, unit: true } },
          createdBy: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      return { movement, updatedStock };
    });
  }

  static async getStockMovements(
    page: number = 1,
    limit: number = 10,
    productId?: string,
    type?: MovementType
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.StockMovementWhereInput = {};

    if (productId) where.productId = productId;
    if (type) where.type = type;

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, sku: true, unit: true } },
          createdBy: { select: { id: true, name: true, email: true, role: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return { movements, total };
  }

  static async getInventoryOverview() {
    const [totalProducts, totalStockItems, lowStockItems, outOfStockItems] = await Promise.all([
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.stock.aggregate({
        _sum: { currentQuantity: true },
      }),
      prisma.stock.count({
        where: {
          currentQuantity: {
            gt: 0,
            lte: prisma.stock.fields.minThresholdQuantity,
          },
        },
      }),
      prisma.stock.count({
        where: {
          currentQuantity: 0,
        },
      }),
    ]);

    return {
      totalProducts,
      totalUnitsInStock: totalStockItems._sum.currentQuantity || 0,
      lowStockItemsCount: lowStockItems,
      outOfStockItemsCount: outOfStockItems,
    };
  }
}

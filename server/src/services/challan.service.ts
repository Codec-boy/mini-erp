import { prisma } from '../config/db.config';
import {
  BadRequestError,
  ConflictError,
  InsufficientStockError,
  NotFoundError,
} from '../errors/custom.error';
import {
  ChallanStatus,
  MovementRefType,
  MovementType,
  Prisma,
} from '@prisma/client';

export class ChallanService {
  private static generateChallanNumber(count: number): string {
    const year = new Date().getFullYear();
    const sequence = String(count + 1).padStart(5, '0');
    return `SCH-${year}-${sequence}`;
  }

  static async createChallan(
    data: {
      customerId: string;
      notes?: string | null;
      items: { productId: string; quantity: number; unitPrice: number }[];
    },
    userId: string
  ) {
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    if (customer.status !== 'ACTIVE') {
      throw new BadRequestError(`Cannot create sales challan for ${customer.status.toLowerCase()} customer.`);
    }

    // Verify all products exist and calculate totals
    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundError('One or more products specified in items were not found.');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalAmount = 0;
    const itemsData = data.items.map((item) => {
      const prod = productMap.get(item.productId);
      const totalPrice = item.quantity * item.unitPrice;
      totalAmount += totalPrice;
      return {
        productId: item.productId,
        productName: prod?.name || null,
        productSku: prod?.sku || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
      };
    });

    // Credit limit warning / check
    if (customer.creditLimit > 0 && customer.outstandingBalance + totalAmount > customer.creditLimit) {
      throw new BadRequestError(
        `Challan creation exceeds customer credit limit. Credit Limit: ₹${customer.creditLimit}, Current Outstanding: ₹${customer.outstandingBalance}, Order Total: ₹${totalAmount}`
      );
    }

    return prisma.$transaction(async (tx) => {
      const count = await tx.salesChallan.count();
      let challanNumber = ChallanService.generateChallanNumber(count);

      // Ensure uniqueness
      const existing = await tx.salesChallan.findUnique({ where: { challanNumber } });
      if (existing) {
        challanNumber = `${challanNumber}-${Math.floor(Math.random() * 1000)}`;
      }

      const challan = await tx.salesChallan.create({
        data: {
          challanNumber,
          customerId: data.customerId,
          status: ChallanStatus.DRAFT,
          totalAmount,
          notes: data.notes,
          createdById: userId,
          items: {
            createMany: {
              data: itemsData,
            },
          },
        },
        include: {
          customer: true,
          items: {
            include: { product: true },
          },
          createdBy: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      return challan;
    });
  }

  static async getChallans(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: ChallanStatus,
    customerId?: string
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.SalesChallanWhereInput = {};

    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    if (search) {
      where.OR = [
        { challanNumber: { contains: search, mode: 'insensitive' } },
        { customer: { companyName: { contains: search, mode: 'insensitive' } } },
        { customer: { code: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [challans, total] = await Promise.all([
      prisma.salesChallan.findMany({
        where,
        include: {
          customer: { select: { id: true, code: true, companyName: true, contactPerson: true, phone: true } },
          createdBy: { select: { id: true, name: true, email: true, role: true } },
          approvedBy: { select: { id: true, name: true } },
          dispatchedBy: { select: { id: true, name: true } },
          deliveredBy: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.salesChallan.count({ where }),
    ]);

    return { challans, total };
  }

  static async getChallanById(id: string) {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: { stock: true },
            },
          },
        },
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        approvedBy: { select: { id: true, name: true, email: true, role: true } },
        dispatchedBy: { select: { id: true, name: true, email: true, role: true } },
        deliveredBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!challan) {
      throw new NotFoundError('Sales Challan not found');
    }

    return challan;
  }

  static async approveChallan(id: string, userId: string) {
    const challan = await prisma.salesChallan.findUnique({ where: { id } });
    if (!challan) throw new NotFoundError('Sales Challan not found');

    if (challan.status !== ChallanStatus.DRAFT) {
      throw new BadRequestError(`Cannot approve sales challan currently in '${challan.status}' status. Only DRAFT challans can be approved.`);
    }

    return prisma.salesChallan.update({
      where: { id },
      data: {
        status: ChallanStatus.APPROVED,
        approvedById: userId,
      },
      include: {
        customer: true,
        items: { include: { product: true } },
        approvedBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  static async dispatchChallan(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const challan = await tx.salesChallan.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: {
                include: { stock: true },
              },
            },
          },
        },
      });

      if (!challan) throw new NotFoundError('Sales Challan not found');

      if (challan.status !== ChallanStatus.APPROVED) {
        throw new BadRequestError(`Cannot dispatch sales challan in '${challan.status}' status. Challan must be APPROVED first.`);
      }

      // Step 1: Verify Stock Availability for ALL items inside transaction
      for (const item of challan.items) {
        const currentStock = item.product.stock?.currentQuantity || 0;
        if (currentStock < item.quantity) {
          throw new InsufficientStockError(
            `Dispatch aborted: Product '${item.product.name}' (SKU: ${item.product.sku}) has only ${currentStock} units in stock, but ${item.quantity} units are required for Challan ${challan.challanNumber}.`
          );
        }
      }

      // Step 2: Deduct stock & create stock movements for each item
      for (const item of challan.items) {
        await tx.stock.update({
          where: { productId: item.productId },
          data: {
            currentQuantity: {
              decrement: item.quantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: MovementType.OUTWARD_DISPATCH,
            quantity: item.quantity,
            referenceType: MovementRefType.SALES_CHALLAN,
            referenceId: challan.id,
            reason: `Dispatched via Sales Challan ${challan.challanNumber}`,
            createdById: userId,
          },
        });
      }

      // Step 3: Update Challan status to DISPATCHED
      return tx.salesChallan.update({
        where: { id },
        data: {
          status: ChallanStatus.DISPATCHED,
          dispatchedById: userId,
        },
        include: {
          customer: true,
          items: { include: { product: true } },
          dispatchedBy: { select: { id: true, name: true, email: true, role: true } },
        },
      });
    });
  }

  static async deliverChallan(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const challan = await tx.salesChallan.findUnique({
        where: { id },
        include: { customer: true },
      });

      if (!challan) throw new NotFoundError('Sales Challan not found');

      if (challan.status !== ChallanStatus.DISPATCHED) {
        throw new BadRequestError(`Cannot mark sales challan as delivered from '${challan.status}' status. Must be DISPATCHED first.`);
      }

      // Update customer outstanding balance
      await tx.customer.update({
        where: { id: challan.customerId },
        data: {
          outstandingBalance: {
            increment: challan.totalAmount,
          },
        },
      });

      // Update Challan Status to DELIVERED
      return tx.salesChallan.update({
        where: { id },
        data: {
          status: ChallanStatus.DELIVERED,
          deliveredById: userId,
        },
        include: {
          customer: true,
          items: { include: { product: true } },
          deliveredBy: { select: { id: true, name: true, email: true, role: true } },
        },
      });
    });
  }

  static async cancelChallan(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const challan = await tx.salesChallan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!challan) throw new NotFoundError('Sales Challan not found');

      if (challan.status === ChallanStatus.CANCELLED) {
        throw new BadRequestError('Sales Challan is already cancelled.');
      }

      // If it was already DISPATCHED or DELIVERED, return stock back to inventory
      if (challan.status === ChallanStatus.DISPATCHED || challan.status === ChallanStatus.DELIVERED) {
        for (const item of challan.items) {
          await tx.stock.update({
            where: { productId: item.productId },
            data: {
              currentQuantity: {
                increment: item.quantity,
              },
            },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: MovementType.RETURN,
              quantity: item.quantity,
              referenceType: MovementRefType.SALES_CHALLAN,
              referenceId: challan.id,
              reason: `Returned to stock via Cancellation of Sales Challan ${challan.challanNumber}`,
              createdById: userId,
            },
          });
        }

        // If DELIVERED, reverse the outstanding balance on customer
        if (challan.status === ChallanStatus.DELIVERED) {
          await tx.customer.update({
            where: { id: challan.customerId },
            data: {
              outstandingBalance: {
                decrement: challan.totalAmount,
              },
            },
          });
        }
      }

      return tx.salesChallan.update({
        where: { id },
        data: {
          status: ChallanStatus.CANCELLED,
        },
        include: {
          customer: true,
          items: { include: { product: true } },
        },
      });
    });
  }
}

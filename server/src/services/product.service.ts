import { prisma } from '../config/db.config';
import { ConflictError, NotFoundError } from '../errors/custom.error';
import { ProductStatus, Prisma } from '@prisma/client';

export class ProductService {
  static async createProduct(data: {
    sku: string;
    name: string;
    description?: string | null;
    category: string;
    unit?: string;
    unitPrice: number;
    costPrice: number;
    initialStock?: number;
    minThresholdQuantity?: number;
    reorderQuantity?: number;
    warehouseLocation?: string;
    status?: ProductStatus;
  }) {
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku.toUpperCase().trim() },
    });
    if (existingSku) {
      throw new ConflictError(`Product with SKU '${data.sku}' already exists.`);
    }

    const {
      initialStock = 0,
      minThresholdQuantity = 10,
      reorderQuantity = 50,
      warehouseLocation = 'Main Warehouse - Section A',
      ...productFields
    } = data;

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...productFields,
          sku: productFields.sku.toUpperCase().trim(),
        },
      });

      const stock = await tx.stock.create({
        data: {
          productId: product.id,
          currentQuantity: initialStock,
          minThresholdQuantity,
          reorderQuantity,
          warehouseLocation,
        },
      });

      return {
        ...product,
        stock,
      };
    });
  }

  static async getProducts(
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string,
    lowStockOnly: boolean = false,
    status?: ProductStatus
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {};

    if (status) where.status = status;
    if (category) where.category = { equals: category, mode: 'insensitive' };

    if (search) {
      where.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (lowStockOnly) {
      where.stock = {
        currentQuantity: {
          lte: prisma.stock.fields.minThresholdQuantity,
        },
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          stock: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stock: true,
        stockMovements: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  static async updateProduct(
    id: string,
    data: Partial<{
      sku: string;
      name: string;
      description: string | null;
      category: string;
      unit: string;
      unitPrice: number;
      costPrice: number;
      minThresholdQuantity: number;
      reorderQuantity: number;
      warehouseLocation: string;
      status: ProductStatus;
    }>
  ) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (data.sku && data.sku.toUpperCase() !== product.sku) {
      const existing = await prisma.product.findUnique({ where: { sku: data.sku.toUpperCase() } });
      if (existing) throw new ConflictError(`SKU '${data.sku}' already exists.`);
    }

    const { minThresholdQuantity, reorderQuantity, warehouseLocation, ...productFields } = data;

    return prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          ...productFields,
          sku: productFields.sku ? productFields.sku.toUpperCase().trim() : undefined,
        },
      });

      if (minThresholdQuantity !== undefined || reorderQuantity !== undefined || warehouseLocation !== undefined) {
        await tx.stock.update({
          where: { productId: id },
          data: {
            ...(minThresholdQuantity !== undefined && { minThresholdQuantity }),
            ...(reorderQuantity !== undefined && { reorderQuantity }),
            ...(warehouseLocation !== undefined && { warehouseLocation }),
          },
        });
      }

      return tx.product.findUnique({
        where: { id },
        include: { stock: true },
      });
    });
  }
}

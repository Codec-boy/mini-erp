import { prisma } from '../config/db.config';
import { ConflictError, NotFoundError } from '../errors/custom.error';
import { CustomerStatus, CustomerType, Prisma } from '@prisma/client';

export class CustomerService {
  static async createCustomer(data: {
    code: string;
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    customerType?: CustomerType;
    address: string;
    gstin?: string | null;
    creditLimit?: number;
    status?: CustomerStatus;
    followUpDate?: string | null;
    notes?: string | null;
    followUpNotes?: string | null;
  }) {
    const existingCode = await prisma.customer.findUnique({
      where: { code: data.code.toUpperCase().trim() },
    });
    if (existingCode) {
      throw new ConflictError(`Customer code '${data.code}' already exists.`);
    }

    const existingEmail = await prisma.customer.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (existingEmail) {
      throw new ConflictError(`Customer email '${data.email}' already registered.`);
    }

    const { followUpDate, ...rest } = data;

    return prisma.customer.create({
      data: {
        ...rest,
        code: data.code.toUpperCase().trim(),
        email: data.email.toLowerCase().trim(),
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
    });
  }

  static async getCustomers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: CustomerStatus
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.CustomerWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    return { customers, total };
  }

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        salesChallans: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            challanNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    return customer;
  }

  static async updateCustomer(
    id: string,
    data: Partial<{
      code: string;
      companyName: string;
      contactPerson: string;
      email: string;
      phone: string;
      customerType: CustomerType;
      address: string;
      gstin: string | null;
      creditLimit: number;
      outstandingBalance: number;
      status: CustomerStatus;
      followUpDate: string | null;
      notes: string | null;
      followUpNotes: string | null;
    }>
  ) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    if (data.code && data.code.toUpperCase() !== customer.code) {
      const existing = await prisma.customer.findUnique({ where: { code: data.code.toUpperCase() } });
      if (existing) throw new ConflictError(`Customer code '${data.code}' is already taken.`);
    }

    const { followUpDate, ...rest } = data;

    return prisma.customer.update({
      where: { id },
      data: {
        ...rest,
        code: data.code ? data.code.toUpperCase().trim() : undefined,
        email: data.email ? data.email.toLowerCase().trim() : undefined,
        followUpDate: followUpDate ? new Date(followUpDate) : followUpDate === null ? null : undefined,
      },
    });
  }
}

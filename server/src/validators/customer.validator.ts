import { z } from 'zod';
import { CustomerStatus, CustomerType } from '@prisma/client';

export const createCustomerSchema = z.object({
  body: z.object({
    code: z.string().min(3, 'Customer code must be at least 3 characters'),
    companyName: z.string().min(2, 'Company name is required'),
    contactPerson: z.string().min(2, 'Contact person name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(7, 'Phone number is required'),
    customerType: z.nativeEnum(CustomerType).optional().default(CustomerType.WHOLESALE),
    address: z.string().min(5, 'Address is required'),
    gstin: z.string().optional().nullable(),
    creditLimit: z.number().min(0, 'Credit limit cannot be negative').default(0),
    status: z.nativeEnum(CustomerStatus).optional().default(CustomerStatus.ACTIVE),
    followUpDate: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    followUpNotes: z.string().optional().nullable(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    code: z.string().min(3).optional(),
    companyName: z.string().min(2).optional(),
    contactPerson: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(7).optional(),
    customerType: z.nativeEnum(CustomerType).optional(),
    address: z.string().min(5).optional(),
    gstin: z.string().optional().nullable(),
    creditLimit: z.number().min(0).optional(),
    outstandingBalance: z.number().min(0).optional(),
    status: z.nativeEnum(CustomerStatus).optional(),
    followUpDate: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    followUpNotes: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid Customer ID'),
  }),
});

export const getCustomersQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    status: z.nativeEnum(CustomerStatus).optional(),
  }),
});

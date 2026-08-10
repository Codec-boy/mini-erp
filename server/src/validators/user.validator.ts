import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    role: z.nativeEnum(Role, { message: 'Invalid role provided' }),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: z.nativeEnum(Role).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid User ID'),
  }),
});

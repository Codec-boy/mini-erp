import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createCustomerSchema,
  updateCustomerSchema,
  getCustomersQuerySchema,
} from '../validators/customer.validator';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

router.get(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  validateRequest(getCustomersQuerySchema),
  CustomerController.getCustomers
);

router.get(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  CustomerController.getCustomerById
);

router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES),
  validateRequest(createCustomerSchema),
  CustomerController.createCustomer
);

router.put(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  validateRequest(updateCustomerSchema),
  CustomerController.updateCustomer
);

export default router;

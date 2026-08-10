import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createProductSchema,
  updateProductSchema,
  getProductsQuerySchema,
} from '../validators/product.validator';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

router.get(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  validateRequest(getProductsQuerySchema),
  ProductController.getProducts
);

router.get(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  ProductController.getProductById
);

router.post(
  '/',
  authorizeRoles(Role.ADMIN),
  validateRequest(createProductSchema),
  ProductController.createProduct
);

router.put(
  '/:id',
  authorizeRoles(Role.ADMIN),
  validateRequest(updateProductSchema),
  ProductController.updateProduct
);

export default router;

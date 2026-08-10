import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createStockMovementSchema,
  getStockMovementsQuerySchema,
} from '../validators/inventory.validator';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

router.get(
  '/overview',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  InventoryController.getOverview
);

router.get(
  '/movements',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  validateRequest(getStockMovementsQuerySchema),
  InventoryController.getStockMovements
);

router.post(
  '/movements',
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  validateRequest(createStockMovementSchema),
  InventoryController.createStockMovement
);

export default router;

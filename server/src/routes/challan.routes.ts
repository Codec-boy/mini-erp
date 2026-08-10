import { Router } from 'express';
import { ChallanController } from '../controllers/challan.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createChallanSchema,
  getChallansQuerySchema,
  updateChallanStatusSchema,
} from '../validators/challan.validator';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

router.get(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  validateRequest(getChallansQuerySchema),
  ChallanController.getChallans
);

router.get(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  ChallanController.getChallanById
);

router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES),
  validateRequest(createChallanSchema),
  ChallanController.createChallan
);

router.patch(
  '/:id/approve',
  authorizeRoles(Role.ADMIN, Role.SALES),
  validateRequest(updateChallanStatusSchema),
  ChallanController.approveChallan
);

router.patch(
  '/:id/dispatch',
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  validateRequest(updateChallanStatusSchema),
  ChallanController.dispatchChallan
);

router.patch(
  '/:id/deliver',
  authorizeRoles(Role.ADMIN, Role.ACCOUNTS),
  validateRequest(updateChallanStatusSchema),
  ChallanController.deliverChallan
);

router.patch(
  '/:id/cancel',
  authorizeRoles(Role.ADMIN, Role.SALES),
  validateRequest(updateChallanStatusSchema),
  ChallanController.cancelChallan
);

export default router;

import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createUserSchema } from '../validators/user.validator';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRoles(Role.ADMIN));

router.post('/', validateRequest(createUserSchema), UserController.createUser);
router.get('/', UserController.getUsers);
router.patch('/:id/status', UserController.toggleStatus);

export default router;

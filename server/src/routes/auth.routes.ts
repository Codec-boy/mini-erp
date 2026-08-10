import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { loginSchema } from '../validators/auth.validator';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', validateRequest(loginSchema), AuthController.login);
router.get('/me', authenticateToken, AuthController.me);

export default router;

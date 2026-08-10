import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import customerRoutes from './customer.routes';
import productRoutes from './product.routes';
import inventoryRoutes from './inventory.routes';
import challanRoutes from './challan.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/customers', customerRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/inventory', inventoryRoutes);
apiRouter.use('/sales-challans', challanRoutes);

export default apiRouter;

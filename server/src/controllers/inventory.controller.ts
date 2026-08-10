import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';
import { sendPaginatedResponse, sendResponse } from '../utils/response.util';
import { MovementType } from '@prisma/client';

export class InventoryController {
  static createStockMovement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const result = await InventoryService.recordStockMovement(req.body, userId);
      return sendResponse(res, 201, 'Stock movement recorded successfully', result);
    } catch (error) {
      next(error);
    }
  };

  static getStockMovements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);
      const productId = req.query.productId as string;
      const type = req.query.type as MovementType;

      const { movements, total } = await InventoryService.getStockMovements(page, limit, productId, type);
      return sendPaginatedResponse(res, movements, total, page, limit, 'Stock movement ledger retrieved');
    } catch (error) {
      next(error);
    }
  };

  static getOverview = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const overview = await InventoryService.getInventoryOverview();
      return sendResponse(res, 200, 'Inventory overview retrieved', overview);
    } catch (error) {
      next(error);
    }
  };
}

import { Request, Response, NextFunction } from 'express';
import { ChallanService } from '../services/challan.service';
import { sendPaginatedResponse, sendResponse } from '../utils/response.util';
import { ChallanStatus } from '@prisma/client';

export class ChallanController {
  static createChallan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const challan = await ChallanService.createChallan(req.body, userId);
      return sendResponse(res, 201, 'Sales Challan created as DRAFT', challan);
    } catch (error) {
      next(error);
    }
  };

  static getChallans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);
      const search = req.query.search as string;
      const status = req.query.status as ChallanStatus;
      const customerId = req.query.customerId as string;

      const { challans, total } = await ChallanService.getChallans(
        page,
        limit,
        search,
        status,
        customerId
      );
      return sendPaginatedResponse(res, challans, total, page, limit, 'Sales Challans retrieved');
    } catch (error) {
      next(error);
    }
  };

  static getChallanById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const challan = await ChallanService.getChallanById(id);
      return sendResponse(res, 200, 'Sales Challan details retrieved', challan);
    } catch (error) {
      next(error);
    }
  };

  static approveChallan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      const challan = await ChallanService.approveChallan(id, userId);
      return sendResponse(res, 200, 'Sales Challan approved successfully', challan);
    } catch (error) {
      next(error);
    }
  };

  static dispatchChallan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      const challan = await ChallanService.dispatchChallan(id, userId);
      return sendResponse(res, 200, 'Sales Challan dispatched and inventory stock updated', challan);
    } catch (error) {
      next(error);
    }
  };

  static deliverChallan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      const challan = await ChallanService.deliverChallan(id, userId);
      return sendResponse(res, 200, 'Sales Challan marked as delivered & customer account updated', challan);
    } catch (error) {
      next(error);
    }
  };

  static cancelChallan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      const challan = await ChallanService.cancelChallan(id, userId);
      return sendResponse(res, 200, 'Sales Challan cancelled successfully', challan);
    } catch (error) {
      next(error);
    }
  };
}

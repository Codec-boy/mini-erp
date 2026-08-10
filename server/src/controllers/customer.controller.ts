import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { sendPaginatedResponse, sendResponse } from '../utils/response.util';
import { CustomerStatus } from '@prisma/client';

export class CustomerController {
  static createCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await CustomerService.createCustomer(req.body);
      return sendResponse(res, 201, 'Customer created successfully', customer);
    } catch (error) {
      next(error);
    }
  };

  static getCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);
      const search = req.query.search as string;
      const status = req.query.status as CustomerStatus;

      const { customers, total } = await CustomerService.getCustomers(page, limit, search, status);
      return sendPaginatedResponse(res, customers, total, page, limit, 'Customers retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  static getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const customer = await CustomerService.getCustomerById(id);
      return sendResponse(res, 200, 'Customer details retrieved', customer);
    } catch (error) {
      next(error);
    }
  };

  static updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const updated = await CustomerService.updateCustomer(id, req.body);
      return sendResponse(res, 200, 'Customer updated successfully', updated);
    } catch (error) {
      next(error);
    }
  };
}

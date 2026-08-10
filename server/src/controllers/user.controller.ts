import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { sendPaginatedResponse, sendResponse } from '../utils/response.util';

export class UserController {
  static createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await UserService.createUser(req.body);
      return sendResponse(res, 201, 'User created successfully', user);
    } catch (error) {
      next(error);
    }
  };

  static getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);
      const search = req.query.search as string;

      const { users, total } = await UserService.getUsers(page, limit, search);
      return sendPaginatedResponse(res, users, total, page, limit, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  static toggleStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { isActive } = req.body;
      const updatedUser = await UserService.updateUserStatus(id, isActive);
      return sendResponse(res, 200, `User ${isActive ? 'activated' : 'deactivated'} successfully`, updatedUser);
    } catch (error) {
      next(error);
    }
  };
}

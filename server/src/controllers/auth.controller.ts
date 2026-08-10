import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendResponse } from '../utils/response.util';

export class AuthController {
  static login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return sendResponse(res, 200, 'Authentication successful', result);
    } catch (error) {
      next(error);
    }
  };

  static me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const user = await AuthService.getCurrentUser(userId);
      return sendResponse(res, 200, 'User profile fetched successfully', user);
    } catch (error) {
      next(error);
    }
  };
}

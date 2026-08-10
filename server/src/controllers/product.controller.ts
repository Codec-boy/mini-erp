import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { sendPaginatedResponse, sendResponse } from '../utils/response.util';
import { ProductStatus } from '@prisma/client';

export class ProductController {
  static createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await ProductService.createProduct(req.body);
      return sendResponse(res, 201, 'Product created successfully', product);
    } catch (error) {
      next(error);
    }
  };

  static getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);
      const search = req.query.search as string;
      const category = req.query.category as string;
      const lowStockOnly = req.query.lowStockOnly === 'true';
      const status = req.query.status as ProductStatus;

      const { products, total } = await ProductService.getProducts(
        page,
        limit,
        search,
        category,
        lowStockOnly,
        status
      );
      return sendPaginatedResponse(res, products, total, page, limit, 'Products retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  static getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const product = await ProductService.getProductById(id);
      return sendResponse(res, 200, 'Product details retrieved', product);
    } catch (error) {
      next(error);
    }
  };

  static updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const updated = await ProductService.updateProduct(id, req.body);
      return sendResponse(res, 200, 'Product updated successfully', updated);
    } catch (error) {
      next(error);
    }
  };
}

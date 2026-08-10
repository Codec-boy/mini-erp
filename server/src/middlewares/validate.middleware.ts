import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';

export const validateRequest = (schema: ZodObject<any>) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (parsed.body) req.body = parsed.body;
      next();
    } catch (error) {
      next(error);
    }
  };
};

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/custom.error';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('[Global Error Handler]:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        details: err.details || null,
      },
    });
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: formattedErrors,
      },
    });
  }

  // Handle Prisma Known Errors (e.g. Unique constraint violation)
  if (err?.code === 'P2002') {
    const target = err.meta?.target ? (Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target) : 'Field';
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: `Unique constraint violated on field: ${target}`,
      },
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred',
    },
  });
};

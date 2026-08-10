import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: PaginationMeta
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
    ...(meta ? { meta } : {}),
  });
};

export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Data retrieved successfully'
) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return sendResponse(res, 200, message, data, {
    page,
    limit,
    total,
    totalPages,
  });
};

import { axiosClient } from './axiosClient';
import { ApiResponse, StockMovement } from '../types';

export interface InventoryOverview {
  totalProducts: number;
  totalUnitsInStock: number;
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
}

export const inventoryApi = {
  getOverview: async (): Promise<ApiResponse<InventoryOverview>> => {
    const res = await axiosClient.get('/inventory/overview');
    return res.data;
  },
  getStockMovements: async (params?: { page?: number; limit?: number; productId?: string; type?: string }): Promise<ApiResponse<StockMovement[]>> => {
    const res = await axiosClient.get('/inventory/movements', { params });
    return res.data;
  },
  recordMovement: async (data: { productId: string; type: string; quantity: number; reason?: string }): Promise<ApiResponse<any>> => {
    const res = await axiosClient.post('/inventory/movements', data);
    return res.data;
  },
};

import { axiosClient } from './axiosClient';
import { ApiResponse, SalesChallan } from '../types';

export const challanApi = {
  getChallans: async (params?: { page?: number; limit?: number; search?: string; status?: string; customerId?: string }): Promise<ApiResponse<SalesChallan[]>> => {
    const res = await axiosClient.get('/sales-challans', { params });
    return res.data;
  },
  getChallanById: async (id: string): Promise<ApiResponse<SalesChallan>> => {
    const res = await axiosClient.get(`/sales-challans/${id}`);
    return res.data;
  },
  createChallan: async (data: { customerId: string; notes?: string; items: { productId: string; quantity: number; unitPrice: number }[] }): Promise<ApiResponse<SalesChallan>> => {
    const res = await axiosClient.post('/sales-challans', data);
    return res.data;
  },
  approveChallan: async (id: string): Promise<ApiResponse<SalesChallan>> => {
    const res = await axiosClient.patch(`/sales-challans/${id}/approve`);
    return res.data;
  },
  dispatchChallan: async (id: string): Promise<ApiResponse<SalesChallan>> => {
    const res = await axiosClient.patch(`/sales-challans/${id}/dispatch`);
    return res.data;
  },
  deliverChallan: async (id: string): Promise<ApiResponse<SalesChallan>> => {
    const res = await axiosClient.patch(`/sales-challans/${id}/deliver`);
    return res.data;
  },
  cancelChallan: async (id: string): Promise<ApiResponse<SalesChallan>> => {
    const res = await axiosClient.patch(`/sales-challans/${id}/cancel`);
    return res.data;
  },
};

import { axiosClient } from './axiosClient';
import { ApiResponse, Product } from '../types';

export const productApi = {
  getProducts: async (params?: { page?: number; limit?: number; search?: string; category?: string; lowStockOnly?: boolean; status?: string }): Promise<ApiResponse<Product[]>> => {
    const res = await axiosClient.get('/products', { params });
    return res.data;
  },
  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    const res = await axiosClient.get(`/products/${id}`);
    return res.data;
  },
  createProduct: async (data: any): Promise<ApiResponse<Product>> => {
    const res = await axiosClient.post('/products', data);
    return res.data;
  },
  updateProduct: async (id: string, data: any): Promise<ApiResponse<Product>> => {
    const res = await axiosClient.put(`/products/${id}`, data);
    return res.data;
  },
};

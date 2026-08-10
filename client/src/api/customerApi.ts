import { axiosClient } from './axiosClient';
import { ApiResponse, Customer } from '../types';

export const customerApi = {
  getCustomers: async (params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<ApiResponse<Customer[]>> => {
    const res = await axiosClient.get('/customers', { params });
    return res.data;
  },
  getCustomerById: async (id: string): Promise<ApiResponse<Customer>> => {
    const res = await axiosClient.get(`/customers/${id}`);
    return res.data;
  },
  createCustomer: async (data: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    const res = await axiosClient.post('/customers', data);
    return res.data;
  },
  updateCustomer: async (id: string, data: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    const res = await axiosClient.put(`/customers/${id}`, data);
    return res.data;
  },
};

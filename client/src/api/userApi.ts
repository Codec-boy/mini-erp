import { axiosClient } from './axiosClient';
import { ApiResponse, User } from '../types';

export const userApi = {
  getUsers: async (params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<User[]>> => {
    const res = await axiosClient.get('/users', { params });
    return res.data;
  },
  createUser: async (data: { name: string; email: string; password: string; role: string }): Promise<ApiResponse<User>> => {
    const res = await axiosClient.post('/users', data);
    return res.data;
  },
  toggleStatus: async (id: string, isActive: boolean): Promise<ApiResponse<User>> => {
    const res = await axiosClient.patch(`/users/${id}/status`, { isActive });
    return res.data;
  },
};

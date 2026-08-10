import { axiosClient } from './axiosClient';
import { ApiResponse, User } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const res = await axiosClient.post('/auth/login', { email, password });
    return res.data;
  },
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const res = await axiosClient.get('/auth/me');
    return res.data;
  },
};

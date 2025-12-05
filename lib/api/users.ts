import { apiClient } from './client';
import type { GetUsersRequest, GetUsersResponse, CreateUserRequest, User } from '../types';

export const usersApi = {
  getUsers: async (request: GetUsersRequest): Promise<GetUsersResponse> => {
    return apiClient.post<GetUsersResponse>('/admin/users/list', request);
  },

  createUser: async (user: CreateUserRequest): Promise<void> => {
    await apiClient.post('/admin/users', user);
  },

  updateUser: async (user: CreateUserRequest & { id: number }): Promise<void> => {
    await apiClient.put('/admin/users', user);
  },
};

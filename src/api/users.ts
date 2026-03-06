/* ── Users API ── */
import { get, post, put, patch, del } from './client';
import type { CreateUserRequest, UserResponse, Page, Role, Designation } from './types';

export const userApi = {
  create: (data: Partial<CreateUserRequest>) =>
    post<UserResponse>('/users', data),

  update: (id: string, data: Partial<CreateUserRequest>) =>
    put<UserResponse>(`/users/${id}`, data),

  getById: (id: string) =>
    get<UserResponse>(`/users/${id}`),

  getByHospital: (hospitalId: string, page = 0, size = 20) =>
    get<Page<UserResponse>>(`/users/hospital/${hospitalId}?page=${page}&size=${size}`),

  delete: (id: string) =>
    del<void>(`/users/${id}`),

  /** Update only the designation of a user (admin only) */
  updateDesignation: (id: string, designation: Designation) =>
    patch<UserResponse>(`/users/${id}/designation`, { designation }),

  /** Get designations allowed for a specific role (for dropdown) */
  getDesignations: (role: Role) =>
    get<{ value: string; label: string }[]>(`/users/designations?role=${role}`),
};

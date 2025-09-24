import api from './api'

// Types for User Management API
export interface User {
  id: number
  phone: string
  name: string
  role: 'admin' | 'teacher' | 'student'
  learning_center_id: number
  coins: number
  is_active: boolean
  created_at: string
}

export interface CreateUserRequest {
  phone: string
  name: string
  role: 'admin' | 'teacher' | 'student'
  learning_center_id: number
}

export interface UpdateUserRequest {
  name?: string
  phone?: string
  role?: 'admin' | 'teacher' | 'student'
  learning_center_id?: number
}

export interface ListUsersParams {
  learning_center_id?: number
  role?: 'admin' | 'teacher' | 'student'
  skip?: number
  limit?: number
}

export interface DeleteResponse {
  message: string
}

// User Management API functions
export const usersApi = {
  // List all users with filters
  list: async (params?: ListUsersParams): Promise<User[]> => {
    const searchParams = new URLSearchParams()
    if (params?.learning_center_id !== undefined) 
      searchParams.set('learning_center_id', params.learning_center_id.toString())
    if (params?.role !== undefined) 
      searchParams.set('role', params.role)
    if (params?.skip !== undefined) 
      searchParams.set('skip', params.skip.toString())
    if (params?.limit !== undefined) 
      searchParams.set('limit', params.limit.toString())
    
    const response = await api.get<User[]>(
      `/api/v1/super-admin/users?${searchParams.toString()}`
    )
    return response.data
  },

  // Get specific user
  get: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/api/v1/super-admin/users/${id}`)
    return response.data
  },

  // Create new user
  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post<User>('/api/v1/super-admin/users', data)
    return response.data
  },

  // Update user
  update: async (id: number, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put<User>(`/api/v1/super-admin/users/${id}`, data)
    return response.data
  },

  // Delete user
  delete: async (id: number): Promise<DeleteResponse> => {
    const response = await api.delete<DeleteResponse>(`/api/v1/super-admin/users/${id}`)
    return response.data
  },
}
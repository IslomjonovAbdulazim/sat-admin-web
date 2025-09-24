import api from './api'

// Types for Modules Management API based on your API documentation
export interface Module {
  id: number
  title: string
  position: number
  test_id: number
}

export interface CreateModuleRequest {
  title: string
  position: number
  test_id: number
}

export interface UpdateModuleRequest {
  title: string
  position: number
  test_id: number
}

export interface DeleteResponse {
  message: string
}

export interface RestoreResponse {
  message: string
}

// Query params
export interface ListModulesParams {
  include_deleted?: boolean
}

export interface GetTestModulesParams {
  include_deleted?: boolean
}

// Modules Management API functions
export const modulesApi = {
  // Create a new module
  create: async (data: CreateModuleRequest): Promise<Module> => {
    const response = await api.post<Module>('/admin/modules', data)
    return response.data
  },

  // Get all modules
  list: async (params?: ListModulesParams): Promise<Module[]> => {
    const searchParams = new URLSearchParams()
    if (params?.include_deleted !== undefined) {
      searchParams.set('include_deleted', params.include_deleted.toString())
    }
    
    const url = `/admin/modules${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await api.get<Module[]>(url)
    return response.data
  },

  // Get modules for a specific test
  getByTestId: async (testId: number, params?: GetTestModulesParams): Promise<Module[]> => {
    const searchParams = new URLSearchParams()
    if (params?.include_deleted !== undefined) {
      searchParams.set('include_deleted', params.include_deleted.toString())
    }
    
    const url = `/admin/tests/${testId}/modules${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await api.get<Module[]>(url)
    return response.data
  },

  // Update a module
  update: async (id: number, data: UpdateModuleRequest): Promise<Module> => {
    const response = await api.put<Module>(`/admin/modules/${id}`, data)
    return response.data
  },

  // Delete a module (soft delete)
  delete: async (id: number): Promise<DeleteResponse> => {
    const response = await api.delete<DeleteResponse>(`/admin/modules/${id}`)
    return response.data
  },

  // Restore a soft-deleted module
  restore: async (id: number): Promise<RestoreResponse> => {
    const response = await api.post<RestoreResponse>(`/admin/modules/${id}/restore`)
    return response.data
  },
}
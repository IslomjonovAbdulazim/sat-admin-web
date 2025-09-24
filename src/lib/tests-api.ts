import api from './api'

// Types for Tests Management API based on your API documentation
export interface Test {
  id: number
  title: string
}

export interface CreateTestRequest {
  title: string
}

export interface UpdateTestRequest {
  title: string
}

export interface DeleteResponse {
  message: string
}

export interface RestoreResponse {
  message: string
}

// Query params
export interface ListTestsParams {
  include_deleted?: boolean
}

export interface GetTestParams {
  include_deleted?: boolean
}

// Tests Management API functions
export const testsApi = {
  // Create a new test
  create: async (data: CreateTestRequest): Promise<Test> => {
    const response = await api.post<Test>('/admin/tests', data)
    return response.data
  },

  // Get all tests
  list: async (params?: ListTestsParams): Promise<Test[]> => {
    const searchParams = new URLSearchParams()
    if (params?.include_deleted !== undefined) {
      searchParams.set('include_deleted', params.include_deleted.toString())
    }
    
    const url = `/admin/tests${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await api.get<Test[]>(url)
    return response.data
  },

  // Get a single test by ID
  getById: async (id: number, params?: GetTestParams): Promise<Test> => {
    const searchParams = new URLSearchParams()
    if (params?.include_deleted !== undefined) {
      searchParams.set('include_deleted', params.include_deleted.toString())
    }
    
    const url = `/admin/tests/${id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await api.get<Test>(url)
    return response.data
  },

  // Update a test
  update: async (id: number, data: UpdateTestRequest): Promise<Test> => {
    const response = await api.put<Test>(`/admin/tests/${id}`, data)
    return response.data
  },

  // Delete a test (soft delete)
  delete: async (id: number): Promise<DeleteResponse> => {
    const response = await api.delete<DeleteResponse>(`/admin/tests/${id}`)
    return response.data
  },

  // Restore a soft-deleted test
  restore: async (id: number): Promise<RestoreResponse> => {
    const response = await api.post<RestoreResponse>(`/admin/tests/${id}/restore`)
    return response.data
  },
}
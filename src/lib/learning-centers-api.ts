import api from './api'

// Types for Learning Centers API
export interface LearningCenter {
  id: number
  name: string
  logo: string | null
  phone: string
  student_limit: number
  teacher_limit: number
  group_limit: number
  is_active: boolean
  is_paid: boolean
  created_at: string
}

export interface CreateLearningCenterRequest {
  name: string
  phone: string
  student_limit: number
  teacher_limit: number
  group_limit: number
  is_paid: boolean
}

export interface UpdateLearningCenterRequest {
  name?: string
  phone?: string
  student_limit?: number
  teacher_limit?: number
  group_limit?: number
  is_paid?: boolean
}

export interface ListLearningCentersParams {
  skip?: number
  limit?: number
}

export interface TogglePaymentResponse {
  message: string
  is_paid: boolean
}

export interface UploadLogoResponse {
  message: string
  path: string
}

export interface DeleteResponse {
  message: string
}

// Learning Centers API functions
export const learningCentersApi = {
  // List all learning centers
  list: async (params?: ListLearningCentersParams): Promise<LearningCenter[]> => {
    const searchParams = new URLSearchParams()
    if (params?.skip !== undefined) searchParams.set('skip', params.skip.toString())
    if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString())
    
    const url = `/api/v1/super-admin/learning-centers?${searchParams.toString()}`
    console.log('🚀 Fetching Learning Centers from Backend:', {
      url: `https://edutizimbackend-production.up.railway.app${url}`,
      params,
      timestamp: new Date().toISOString()
    })
    
    const response = await api.get<LearningCenter[]>(url)
    
    console.log('✅ Learning Centers Response:', {
      status: response.status,
      dataCount: response.data?.length || 0,
      data: response.data,
      timestamp: new Date().toISOString()
    })
    
    return response.data
  },

  // Create new learning center
  create: async (data: CreateLearningCenterRequest): Promise<LearningCenter> => {
    const response = await api.post<LearningCenter>(
      '/api/v1/super-admin/learning-centers',
      data
    )
    return response.data
  },

  // Update learning center
  update: async (id: number, data: UpdateLearningCenterRequest): Promise<LearningCenter> => {
    const response = await api.put<LearningCenter>(
      `/api/v1/super-admin/learning-centers/${id}`,
      data
    )
    return response.data
  },

  // Upload learning center logo
  uploadLogo: async (id: number, file: File): Promise<UploadLogoResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post<UploadLogoResponse>(
      `/api/v1/super-admin/learning-centers/${id}/logo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  // Toggle payment status
  togglePayment: async (id: number): Promise<TogglePaymentResponse> => {
    const response = await api.post<TogglePaymentResponse>(
      `/api/v1/super-admin/learning-centers/${id}/toggle-payment`
    )
    return response.data
  },

  // Deactivate learning center
  deactivate: async (id: number): Promise<DeleteResponse> => {
    const response = await api.delete<DeleteResponse>(
      `/api/v1/super-admin/learning-centers/${id}`
    )
    return response.data
  },
}
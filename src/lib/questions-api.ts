import api from './api'

// Types for Questions Management API based on your API documentation
export interface Choice {
  label: string
  content_markdown: string
}

export interface Question {
  id: number
  title: string
  type: 'mcq' | 'fill_blank'
  content_markdown: string
  position: number
  choices: Choice[] | null
  answer: string[]
  explanation_markdown?: string
  module?: {
    id: number
    title: string
  }
  created_at?: string
  updated_at?: string
  is_active?: boolean
}

export interface CreateQuestionRequest {
  title: string
  type: 'mcq' | 'fill_blank'
  content_markdown: string
  position: number
  module_id: number
  choices: Choice[] | null
  answer: string[]
  explanation_markdown?: string
}

export interface UpdateQuestionRequest {
  title: string
  type: 'mcq' | 'fill_blank'
  content_markdown: string
  position: number
  module_id: number
  choices: Choice[] | null
  answer: string[]
  explanation_markdown?: string
}

export interface DeleteResponse {
  message: string
}

export interface RestoreResponse {
  message: string
}

// Query params
export interface ListQuestionsParams {
  include_deleted?: boolean
}

export interface GetModuleQuestionsParams {
  include_deleted?: boolean
}

export interface GetQuestionParams {
  include_deleted?: boolean
}

// Questions Management API functions
export const questionsApi = {
  // Create a new question
  create: async (data: CreateQuestionRequest): Promise<Question> => {
    const response = await api.post<Question>('/admin/questions', data)
    return response.data
  },

  // Get all questions
  list: async (params?: ListQuestionsParams): Promise<Question[]> => {
    const searchParams = new URLSearchParams()
    if (params?.include_deleted !== undefined) {
      searchParams.set('include_deleted', params.include_deleted.toString())
    }
    
    const url = `/admin/questions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await api.get<Question[]>(url)
    return response.data
  },

  // Get questions for a specific module
  getByModuleId: async (moduleId: number, params?: GetModuleQuestionsParams): Promise<Question[]> => {
    const searchParams = new URLSearchParams()
    if (params?.include_deleted !== undefined) {
      searchParams.set('include_deleted', params.include_deleted.toString())
    }
    
    const url = `/admin/modules/${moduleId}/questions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await api.get<Question[]>(url)
    return response.data
  },

  // Get a single question by ID
  getById: async (id: number, params?: GetQuestionParams): Promise<Question> => {
    const searchParams = new URLSearchParams()
    if (params?.include_deleted !== undefined) {
      searchParams.set('include_deleted', params.include_deleted.toString())
    }
    
    const url = `/admin/questions/${id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await api.get<Question>(url)
    return response.data
  },

  // Update a question
  update: async (id: number, data: UpdateQuestionRequest): Promise<Question> => {
    const response = await api.put<Question>(`/admin/questions/${id}`, data)
    return response.data
  },

  // Delete a question (soft delete)
  delete: async (id: number): Promise<DeleteResponse> => {
    const response = await api.delete<DeleteResponse>(`/admin/questions/${id}`)
    return response.data
  },

  // Restore a soft-deleted question
  restore: async (id: number): Promise<RestoreResponse> => {
    const response = await api.post<RestoreResponse>(`/admin/questions/${id}/restore`)
    return response.data
  },
}
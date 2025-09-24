import api from './api'

// Types for Content Management API
export interface Course {
  id: number
  title: string
  description?: string
  learning_center_id: number
  learning_center_name?: string
  is_active: boolean
  created_at: string
  updated_at: string
  lessons_count?: number
}

export interface Lesson {
  id: number
  title: string
  content: string
  course_id: number
  course_title?: string
  order: number
  is_active: boolean
  created_at: string
  updated_at: string
  words_count?: number
}

export interface Word {
  id: number
  word: string
  translation: string
  definition: string
  sentence: string
  difficulty: 'easy' | 'medium' | 'hard'
  lesson_id: number
  lesson_title?: string
  order: number
  audio?: string
  image?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Request types
export interface CreateCourseRequest {
  title: string
  description?: string
  learning_center_id: number
}

export interface UpdateCourseRequest {
  title?: string
  description?: string
  learning_center_id?: number
  is_active?: boolean
}

export interface CreateLessonRequest {
  title: string
  content: string
  order: number
}

export interface UpdateLessonRequest {
  title?: string
  content?: string
  order?: number
  is_active?: boolean
}

export interface CreateWordRequest {
  word: string
  translation: string
  definition: string
  sentence: string
  difficulty: 'easy' | 'medium' | 'hard'
  order: number
}

export interface UpdateWordRequest {
  word?: string
  translation?: string
  definition?: string
  sentence?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  order?: number
  is_active?: boolean
}

// Query params
export interface ListCoursesParams {
  learning_center_id?: number
  skip?: number
  limit?: number
}

export interface ListLessonsParams {
  course_id?: number
  skip?: number
  limit?: number
}

export interface ListWordsParams {
  lesson_id?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  skip?: number
  limit?: number
}

// Response types
export interface DeleteResponse {
  message: string
}

export interface UploadResponse {
  message: string
  path: string
  url: string
}

// Content Management API functions
export const contentApi = {
  // Course Management
  courses: {
    list: async (params?: ListCoursesParams): Promise<Course[]> => {
      const searchParams = new URLSearchParams()
      if (params?.learning_center_id !== undefined) 
        searchParams.set('learning_center_id', params.learning_center_id.toString())
      if (params?.skip !== undefined) 
        searchParams.set('skip', params.skip.toString())
      if (params?.limit !== undefined) 
        searchParams.set('limit', params.limit.toString())
      
      const response = await api.get<Course[]>(
        `/api/v1/super-admin/content/courses?${searchParams.toString()}`
      )
      return response.data
    },

    get: async (id: number): Promise<Course> => {
      const response = await api.get<Course>(`/api/v1/super-admin/content/courses/${id}`)
      return response.data
    },

    create: async (data: CreateCourseRequest): Promise<Course> => {
      const response = await api.post<Course>('/api/v1/super-admin/content/courses', data)
      return response.data
    },

    update: async (id: number, data: UpdateCourseRequest): Promise<Course> => {
      const response = await api.put<Course>(`/api/v1/super-admin/content/courses/${id}`, data)
      return response.data
    },

    delete: async (id: number): Promise<DeleteResponse> => {
      const response = await api.delete<DeleteResponse>(`/api/v1/super-admin/content/courses/${id}`)
      return response.data
    },
  },

  // Lesson Management
  lessons: {
    list: async (params?: ListLessonsParams): Promise<Lesson[]> => {
      const searchParams = new URLSearchParams()
      if (params?.course_id !== undefined) 
        searchParams.set('course_id', params.course_id.toString())
      if (params?.skip !== undefined) 
        searchParams.set('skip', params.skip.toString())
      if (params?.limit !== undefined) 
        searchParams.set('limit', params.limit.toString())
      
      const response = await api.get<Lesson[]>(
        `/api/v1/super-admin/content/lessons?${searchParams.toString()}`
      )
      return response.data
    },

    get: async (id: number): Promise<Lesson> => {
      const response = await api.get<Lesson>(`/api/v1/super-admin/content/lessons/${id}`)
      return response.data
    },

    create: async (courseId: number, data: CreateLessonRequest): Promise<Lesson> => {
      const response = await api.post<Lesson>(
        `/api/v1/super-admin/content/courses/${courseId}/lessons`, 
        data
      )
      return response.data
    },

    update: async (id: number, data: UpdateLessonRequest): Promise<Lesson> => {
      const response = await api.put<Lesson>(`/api/v1/super-admin/content/lessons/${id}`, data)
      return response.data
    },

    delete: async (id: number): Promise<DeleteResponse> => {
      const response = await api.delete<DeleteResponse>(`/api/v1/super-admin/content/lessons/${id}`)
      return response.data
    },
  },

  // Word Management
  words: {
    list: async (params?: ListWordsParams): Promise<Word[]> => {
      const searchParams = new URLSearchParams()
      if (params?.lesson_id !== undefined) 
        searchParams.set('lesson_id', params.lesson_id.toString())
      if (params?.difficulty !== undefined) 
        searchParams.set('difficulty', params.difficulty)
      if (params?.skip !== undefined) 
        searchParams.set('skip', params.skip.toString())
      if (params?.limit !== undefined) 
        searchParams.set('limit', params.limit.toString())
      
      const response = await api.get<Word[]>(
        `/api/v1/super-admin/content/words?${searchParams.toString()}`
      )
      return response.data
    },

    get: async (id: number): Promise<Word> => {
      const response = await api.get<Word>(`/api/v1/super-admin/content/words/${id}`)
      return response.data
    },

    create: async (lessonId: number, data: CreateWordRequest): Promise<Word> => {
      const response = await api.post<Word>(
        `/api/v1/super-admin/content/lessons/${lessonId}/words`, 
        data
      )
      return response.data
    },

    update: async (id: number, data: UpdateWordRequest): Promise<Word> => {
      const response = await api.put<Word>(`/api/v1/super-admin/content/words/${id}`, data)
      return response.data
    },

    delete: async (id: number): Promise<DeleteResponse> => {
      const response = await api.delete<DeleteResponse>(`/api/v1/super-admin/content/words/${id}`)
      return response.data
    },

    uploadAudio: async (id: number, file: File): Promise<UploadResponse> => {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await api.post<UploadResponse>(
        `/api/v1/super-admin/content/words/${id}/audio`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data
    },

    uploadImage: async (id: number, file: File): Promise<UploadResponse> => {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await api.post<UploadResponse>(
        `/api/v1/super-admin/content/words/${id}/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data
    },
  },
}
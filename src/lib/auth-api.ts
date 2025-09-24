import api from './api'

// Types for API responses based on your API documentation
export interface AuthUser {
  id: number
  email: string
  role: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user?: AuthUser // Optional since API might not return user details
}

// Auth API functions
export const authApi = {
  // Admin Login - connects to POST /auth/login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password
    })
    
    // If API doesn't return user details, we'll create a basic user object
    if (!response.data.user) {
      response.data.user = {
        id: 1,
        email: credentials.email,
        role: 'admin'
      }
    }
    
    return response.data
  },

  // Verify token (if backend supports it in the future)
  verifyToken: async (): Promise<AuthUser> => {
    const response = await api.get<AuthUser>('/api/v1/auth/verify')
    return response.data
  },

  // Logout (client-side only for now)
  logout: async (): Promise<void> => {
    // Just clear local state - no API call needed based on documentation
    return Promise.resolve()
  },
}
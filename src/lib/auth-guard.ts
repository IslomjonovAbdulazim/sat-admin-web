import { useAuthStore } from '@/stores/auth-store'

export const isAuthenticated = (): boolean => {
  const { user, accessToken } = useAuthStore.getState().auth
  return !!(user && accessToken)
}

export const requireAuth = () => {
  const authenticated = isAuthenticated()
  if (!authenticated) {
    throw new Error('Authentication required')
  }
  return authenticated
}

export const getAuthHeaders = () => {
  const { accessToken } = useAuthStore.getState().auth
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
}
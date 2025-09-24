import { createFileRoute, redirect } from '@tanstack/react-router'
import { Login } from '@/features/auth/login'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    const { user, accessToken } = useAuthStore.getState().auth
    
    if (user && accessToken) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: Login,
})
import { useAuthStore } from '@/stores/auth-store'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { authApi } from '@/lib/auth-api'
import { toast } from 'sonner'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const { auth } = useAuthStore()

  const handleSignOut = async () => {
    try {
      // Call logout API if available
      await authApi.logout()
    } catch (error) {
      // Continue with logout even if API call fails
      // eslint-disable-next-line no-console
      console.warn('Logout API call failed:', error)
    } finally {
      // Always reset local auth state
      auth.reset()
      toast.success('Signed out successfully')
      
      // Redirect to login page
      window.location.href = '/login'
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}

import { createFileRoute } from '@tanstack/react-router'
import { UserManagement } from '@/features/user-management'

export const Route = createFileRoute('/_authenticated/user-management')({
  component: UserManagement,
})
import { createFileRoute } from '@tanstack/react-router'
import { ModulesPage } from '@/features/tests/modules'

export const Route = createFileRoute('/_authenticated/tests/modules')({
  component: ModulesPage,
})
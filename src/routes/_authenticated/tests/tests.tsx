import { createFileRoute } from '@tanstack/react-router'
import { TestsPage } from '@/features/tests/tests'

export const Route = createFileRoute('/_authenticated/tests/tests')({
  component: TestsPage,
})
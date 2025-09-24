import { createFileRoute } from '@tanstack/react-router'
import { CoursesPage } from '@/features/content-management/courses'

export const Route = createFileRoute('/_authenticated/content/courses')({
  component: CoursesPage,
})
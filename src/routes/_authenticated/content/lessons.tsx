import { createFileRoute } from '@tanstack/react-router'
import { LessonsPage } from '@/features/content-management/lessons'
import { z } from 'zod'

const lessonsSearchSchema = z.object({
  courseId: z.number().optional(),
})

export const Route = createFileRoute('/_authenticated/content/lessons')({
  component: LessonsPage,
  validateSearch: lessonsSearchSchema,
})
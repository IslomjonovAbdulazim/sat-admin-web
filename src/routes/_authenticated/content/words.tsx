import { createFileRoute } from '@tanstack/react-router'
import { WordsPage } from '@/features/content-management/words'
import { z } from 'zod'

const wordsSearchSchema = z.object({
  lessonId: z.number().optional(),
})

export const Route = createFileRoute('/_authenticated/content/words')({
  component: WordsPage,
  validateSearch: wordsSearchSchema,
})
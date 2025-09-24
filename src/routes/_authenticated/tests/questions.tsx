import { createFileRoute } from '@tanstack/react-router'
import { QuestionsPage } from '@/features/tests/questions'

export const Route = createFileRoute('/_authenticated/tests/questions')({
  component: QuestionsPage,
})
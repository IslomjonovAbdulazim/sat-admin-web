import { createFileRoute } from '@tanstack/react-router'
import { CreateQuestionPage } from '@/features/tests/create-question'

export const Route = createFileRoute('/_authenticated/tests/questions/create')({
  component: CreateQuestionPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      moduleId: search.moduleId as string | undefined,
    }
  },
})
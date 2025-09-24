import { createFileRoute } from '@tanstack/react-router'
import { LearningCenters } from '@/features/learning-centers'

export const Route = createFileRoute('/_authenticated/learning-centers')({
  component: LearningCenters,
})
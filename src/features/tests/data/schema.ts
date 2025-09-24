import { z } from 'zod'

// Test schemas - based on actual API response
export const testSchema = z.object({
  id: z.number(),
  title: z.string(),
})

export const createTestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
})

export const updateTestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
})

// Module schemas - based on actual API response
export const moduleSchema = z.object({
  id: z.number(),
  title: z.string(),
  position: z.number(),
  test_id: z.number(),
})

export const createModuleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  position: z.number().min(1, 'Position must be at least 1'),
  test_id: z.number().min(1, 'Test is required'),
})

export const updateModuleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  position: z.number().min(1, 'Position must be at least 1'),
  test_id: z.number().min(1, 'Test is required'),
})

// Question schemas
export const choiceSchema = z.object({
  label: z.string(),
  content_markdown: z.string(),
})

export const questionSchema = z.object({
  id: z.number(),
  title: z.string(),
  type: z.enum(['mcq', 'fill_blank']),
  content_markdown: z.string(),
  position: z.number(),
  module_id: z.number(),
  module_title: z.string().optional(),
  choices: z.array(choiceSchema).nullable(),
  answer: z.array(z.string()),
  explanation_markdown: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  is_active: z.boolean().optional().default(true),
})

export const createQuestionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  type: z.enum(['mcq', 'fill_blank']),
  content_markdown: z.string().min(1, 'Content is required').max(5000, 'Content must be less than 5000 characters'),
  position: z.number().min(1, 'Position must be at least 1'),
  module_id: z.number().min(1, 'Module is required'),
  choices: z.array(choiceSchema).nullable().optional(),
  answer: z.array(z.string().min(1, 'Answer cannot be empty')).min(1, 'At least one answer is required'),
  explanation_markdown: z.string().max(2000, 'Explanation must be less than 2000 characters').optional(),
}).refine((data) => {
  // If type is 'mcq', choices are required
  if (data.type === 'mcq' && (!data.choices || data.choices.length === 0)) {
    return false
  }
  // If type is 'fill_blank', choices should be null or empty
  if (data.type === 'fill_blank' && data.choices && data.choices.length > 0) {
    return false
  }
  return true
}, {
  message: 'Multiple choice questions require choices, fill-in-the-blank questions should not have choices',
  path: ['choices']
})

export const updateQuestionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  type: z.enum(['mcq', 'fill_blank']).optional(),
  content_markdown: z.string().min(1, 'Content is required').max(5000, 'Content must be less than 5000 characters').optional(),
  position: z.number().min(1, 'Position must be at least 1').optional(),
  module_id: z.number().min(1, 'Module is required').optional(),
  choices: z.array(choiceSchema).nullable().optional(),
  answer: z.array(z.string().min(1, 'Answer cannot be empty')).min(1, 'At least one answer is required').optional(),
  explanation_markdown: z.string().max(2000, 'Explanation must be less than 2000 characters').optional(),
  is_active: z.boolean().optional(),
})

// Search and filter schemas
export const testFiltersSchema = z.object({
  search: z.string().optional(),
  is_active: z.boolean().optional(),
})

export const moduleFiltersSchema = z.object({
  test_id: z.number().optional(),
  search: z.string().optional(),
  is_active: z.boolean().optional(),
})

export const questionFiltersSchema = z.object({
  module_id: z.number().optional(),
  type: z.enum(['mcq', 'fill_blank']).optional(),
  search: z.string().optional(),
  is_active: z.boolean().optional(),
})

// Pagination schema
export const paginationSchema = z.object({
  skip: z.number().min(0).optional(),
  limit: z.number().min(1).max(100).optional(),
})

// Type exports
export type Test = z.infer<typeof testSchema>
export type CreateTestData = z.infer<typeof createTestSchema>
export type UpdateTestData = z.infer<typeof updateTestSchema>

export type Module = z.infer<typeof moduleSchema>
export type CreateModuleData = z.infer<typeof createModuleSchema>
export type UpdateModuleData = z.infer<typeof updateModuleSchema>

export type Choice = z.infer<typeof choiceSchema>
export type Question = z.infer<typeof questionSchema>
export type CreateQuestionData = z.infer<typeof createQuestionSchema>
export type UpdateQuestionData = z.infer<typeof updateQuestionSchema>

export type TestFilters = z.infer<typeof testFiltersSchema>
export type ModuleFilters = z.infer<typeof moduleFiltersSchema>
export type QuestionFilters = z.infer<typeof questionFiltersSchema>
export type PaginationParams = z.infer<typeof paginationSchema>

// Question type options for UI
export const questionTypeOptions = [
  { value: 'mcq', label: 'Multiple Choice', description: 'Question with multiple choice options' },
  { value: 'fill_blank', label: 'Fill in the Blank', description: 'Question where user types the answer' },
] as const

// Status options for UI
export const statusOptions = [
  { value: true, label: 'Active', color: 'bg-green-100 text-green-700' },
  { value: false, label: 'Inactive', color: 'bg-gray-100 text-gray-700' },
] as const
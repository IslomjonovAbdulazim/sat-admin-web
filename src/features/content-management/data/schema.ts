import { z } from 'zod'

// Course schemas
export const courseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().optional(),
  learning_center_id: z.number(),
  learning_center_name: z.string().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  lessons_count: z.number().optional(),
})

export const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  learning_center_id: z.number().min(1, 'Learning center is required'),
})

export const updateCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  learning_center_id: z.number().min(1, 'Learning center is required').optional(),
})

// Lesson schemas
export const lessonSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  course_id: z.number(),
  course_title: z.string().optional(),
  order: z.number(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  words_count: z.number().optional(),
})

export const createLessonSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content must be less than 5000 characters'),
  order: z.number().min(1, 'Order must be at least 1'),
})

export const updateLessonSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  content: z.string().min(1, 'Content is required').max(5000, 'Content must be less than 5000 characters').optional(),
  order: z.number().min(1, 'Order must be at least 1').optional(),
  is_active: z.boolean().optional(),
})

// Word schemas
export const wordSchema = z.object({
  id: z.number(),
  word: z.string(),
  translation: z.string(),
  definition: z.string(),
  sentence: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  lesson_id: z.number(),
  lesson_title: z.string().optional(),
  order: z.number(),
  audio_url: z.string().optional(),
  image_url: z.string().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const createWordSchema = z.object({
  word: z.string().min(1, 'Word is required').max(100, 'Word must be less than 100 characters'),
  translation: z.string().min(1, 'Translation is required').max(100, 'Translation must be less than 100 characters'),
  definition: z.string().min(1, 'Definition is required').max(500, 'Definition must be less than 500 characters'),
  sentence: z.string().min(1, 'Sentence is required').max(300, 'Sentence must be less than 300 characters'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  order: z.number().min(1, 'Order must be at least 1'),
})

export const updateWordSchema = z.object({
  word: z.string().min(1, 'Word is required').max(100, 'Word must be less than 100 characters').optional(),
  translation: z.string().min(1, 'Translation is required').max(100, 'Translation must be less than 100 characters').optional(),
  definition: z.string().min(1, 'Definition is required').max(500, 'Definition must be less than 500 characters').optional(),
  sentence: z.string().min(1, 'Sentence is required').max(300, 'Sentence must be less than 300 characters').optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  order: z.number().min(1, 'Order must be at least 1').optional(),
  is_active: z.boolean().optional(),
})

// File upload schemas
export const audioFileSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.type.startsWith('audio/'),
    'File must be an audio file'
  ).refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB
    'File size must be less than 10MB'
  ),
})

export const imageFileSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.type.startsWith('image/'),
    'File must be an image file'
  ).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB
    'File size must be less than 5MB'
  ),
})

// Search and filter schemas
export const courseFiltersSchema = z.object({
  learning_center_id: z.number().optional(),
  is_active: z.boolean().optional(),
  search: z.string().optional(),
})

export const lessonFiltersSchema = z.object({
  course_id: z.number().optional(),
  is_active: z.boolean().optional(),
  search: z.string().optional(),
})

export const wordFiltersSchema = z.object({
  lesson_id: z.number().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  is_active: z.boolean().optional(),
  search: z.string().optional(),
})

// Pagination schema
export const paginationSchema = z.object({
  skip: z.number().min(0).optional(),
  limit: z.number().min(1).max(100).optional(),
})

// Type exports
export type Course = z.infer<typeof courseSchema>
export type CreateCourseData = z.infer<typeof createCourseSchema>
export type UpdateCourseData = z.infer<typeof updateCourseSchema>

export type Lesson = z.infer<typeof lessonSchema>
export type CreateLessonData = z.infer<typeof createLessonSchema>
export type UpdateLessonData = z.infer<typeof updateLessonSchema>

export type Word = z.infer<typeof wordSchema>
export type CreateWordData = z.infer<typeof createWordSchema>
export type UpdateWordData = z.infer<typeof updateWordSchema>

export type CourseFilters = z.infer<typeof courseFiltersSchema>
export type LessonFilters = z.infer<typeof lessonFiltersSchema>
export type WordFilters = z.infer<typeof wordFiltersSchema>
export type PaginationParams = z.infer<typeof paginationSchema>

export type AudioFileData = z.infer<typeof audioFileSchema>
export type ImageFileData = z.infer<typeof imageFileSchema>

// Difficulty options for UI
export const difficultyOptions = [
  { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-700' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-700' },
] as const
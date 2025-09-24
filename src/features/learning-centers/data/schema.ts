import { z } from 'zod'

// Schema for creating a new learning center
export const createLearningCenterSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 characters')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
  student_limit: z
    .number()
    .min(1, 'Student limit must be at least 1')
    .max(10000, 'Student limit cannot exceed 10,000'),
  teacher_limit: z
    .number()
    .min(1, 'Teacher limit must be at least 1')
    .max(1000, 'Teacher limit cannot exceed 1,000'),
  group_limit: z
    .number()
    .min(1, 'Group limit must be at least 1')
    .max(1000, 'Group limit cannot exceed 1,000'),
  is_paid: z.boolean(),
})

// Schema for updating a learning center (all fields optional)
export const updateLearningCenterSchema = createLearningCenterSchema.partial()

// Schema for file upload
export const logoUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024, // 5MB
      'File size must be less than 5MB'
    )
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'Only JPEG, PNG, and WebP images are allowed'
    ),
})

// Schema for table filtering
export const learningCenterFiltersSchema = z.object({
  name: z.string().optional(),
  is_paid: z.enum(['all', 'paid', 'unpaid']).default('all'),
  is_active: z.enum(['all', 'active', 'inactive']).default('all'),
})

export type CreateLearningCenterData = z.infer<typeof createLearningCenterSchema>
export type UpdateLearningCenterData = z.infer<typeof updateLearningCenterSchema>
export type LogoUploadData = z.infer<typeof logoUploadSchema>
export type LearningCenterFilters = z.infer<typeof learningCenterFiltersSchema>
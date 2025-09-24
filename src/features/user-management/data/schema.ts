import { z } from 'zod'

// Schema for creating a new user
export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 characters')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
  role: z.enum(['admin', 'teacher', 'student'], {
    message: 'Please select a role',
  }),
  learning_center_id: z
    .number()
    .min(1, 'Please select a learning center'),
})

// Schema for updating a user (all fields optional except role validation)
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 characters')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .optional(),
  role: z.enum(['admin', 'teacher', 'student']).optional(),
  learning_center_id: z
    .number()
    .min(1, 'Please select a learning center')
    .optional(),
})

// Schema for filtering users
export const userFiltersSchema = z.object({
  role: z.enum(['all', 'admin', 'teacher', 'student']).default('all'),
  learning_center_id: z.number().optional(),
  search: z.string().optional(),
})

export type CreateUserData = z.infer<typeof createUserSchema>
export type UpdateUserData = z.infer<typeof updateUserSchema>
export type UserFilters = z.infer<typeof userFiltersSchema>

// Role configuration
export const roleConfig = {
  admin: {
    label: 'Admin',
    color: 'purple',
    description: 'Full access to learning center management',
  },
  teacher: {
    label: 'Teacher',
    color: 'blue',
    description: 'Manage classes, students, and content',
  },
  student: {
    label: 'Student',
    color: 'green',
    description: 'Access learning materials and courses',
  },
} as const
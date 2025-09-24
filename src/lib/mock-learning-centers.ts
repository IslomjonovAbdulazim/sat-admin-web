import type { LearningCenter } from './learning-centers-api'

// Mock data for testing the UI while backend endpoints are being implemented
export const mockLearningCenters: LearningCenter[] = [
  {
    id: 1,
    name: 'ABC Learning Center',
    logo: null,
    phone: '+998901234567',
    student_limit: 500,
    teacher_limit: 50,
    group_limit: 100,
    is_active: true,
    is_paid: true,
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    name: 'Excellence Education Hub',
    logo: null,
    phone: '+998907654321',
    student_limit: 300,
    teacher_limit: 30,
    group_limit: 60,
    is_active: true,
    is_paid: false,
    created_at: '2024-02-10T14:20:00Z',
  },
  {
    id: 3,
    name: 'Future Leaders Academy',
    logo: null,
    phone: '+998901111111',
    student_limit: 1000,
    teacher_limit: 100,
    group_limit: 200,
    is_active: false,
    is_paid: true,
    created_at: '2024-03-05T09:15:00Z',
  },
]

// Enable/disable mock mode
export const USE_MOCK_DATA = false
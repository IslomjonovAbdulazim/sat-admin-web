import {
  Command,
  Building2,
  BookOpen,
  GraduationCap,
  Type,
  Users,
  ClipboardList,
  Layers3,
  HelpCircle,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'SAT Score Up Admin',
      logo: Command,
      plan: 'Super Admin',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Learning Centers',
          url: '/learning-centers',
          icon: Building2,
        },
        {
          title: 'Tests Management',
          icon: ClipboardList,
          items: [
            {
              title: 'Tests',
              url: '/tests/tests',
              icon: ClipboardList,
            },
            {
              title: 'Modules',
              url: '/tests/modules',
              icon: Layers3,
            },
            {
              title: 'Questions',
              url: '/tests/questions',
              icon: HelpCircle,
            },
          ],
        },
        {
          title: 'Content Management',
          icon: BookOpen,
          items: [
            {
              title: 'Courses',
              url: '/content/courses',
              icon: GraduationCap,
            },
            {
              title: 'Lessons',
              url: '/content/lessons',
              icon: BookOpen,
            },
            {
              title: 'Words',
              url: '/content/words',
              icon: Type,
            },
          ],
        },
        {
          title: 'User Management',
          url: '/user-management',
          icon: Users,
        },
      ],
    },
  ],
}

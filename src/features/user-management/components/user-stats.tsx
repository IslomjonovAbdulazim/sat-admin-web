import { Users, UserCheck, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type User } from '@/lib/users-api'
import { cn } from '@/lib/utils'

interface UserStatsProps {
  users: User[]
  className?: string
}

export function UserStats({ users, className }: UserStatsProps) {
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    admins: users.filter(u => u.role === 'admin').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    students: users.filter(u => u.role === 'student').length,
  }

  const statCards = [
    {
      title: 'Total Admins',
      value: stats.total,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      title: 'Active',
      value: stats.active,
      icon: UserCheck,
      color: 'green',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
    },
    {
      title: 'Learning Centers',
      value: new Set(users.map(u => u.learning_center_id)).size,
      icon: Shield,
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
  ]

  return (
    <div className={cn('grid gap-4 md:grid-cols-3', className)}>
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className={cn(
            'relative overflow-hidden transition-all duration-200 hover:shadow-md',
            stat.borderColor,
            stat.bgColor
          )}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                {stat.title}
              </CardTitle>
              <div className={cn(
                'rounded-full p-2 transition-all duration-200',
                'bg-white/50 dark:bg-gray-900/50'
              )}>
                <Icon className={cn('h-4 w-4', stat.iconColor)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                {stat.value}
              </div>
              {stat.title === 'Total Admins' && stats.total > 0 && (
                <div className='mt-2 flex items-center space-x-2'>
                  <Badge variant='secondary' className='text-xs'>
                    {((stats.active / stats.total) * 100).toFixed(0)}% active
                  </Badge>
                </div>
              )}
              {stat.title === 'Learning Centers' && (
                <div className='mt-1 text-xs text-muted-foreground'>
                  With admin accounts
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
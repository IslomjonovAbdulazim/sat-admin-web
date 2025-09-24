import { useQuery } from '@tanstack/react-query'
import { 
  BookOpen, 
  GraduationCap, 
  Type, 
  Building2,
  TrendingUp,
  Activity,
  BarChart3
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { contentApi } from '@/lib/content-api'
import { learningCentersApi } from '@/lib/learning-centers-api'

export function ContentManagementDashboard() {

  // Fetch all content data
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => contentApi.courses.list(),
  })

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => contentApi.lessons.list(),
  })

  const { data: words = [] } = useQuery({
    queryKey: ['words'],
    queryFn: () => contentApi.words.list(),
  })

  const { data: learningCenters = [] } = useQuery({
    queryKey: ['learning-centers'],
    queryFn: () => learningCentersApi.list(),
  })

  // Calculate statistics
  const stats = {
    totalCourses: courses.length,
    activeCourses: courses.filter(c => c.is_active).length,
    totalLessons: lessons.length,
    activeLessons: lessons.filter(l => l.is_active).length,
    totalWords: words.length,
    activeWords: words.filter(w => w.is_active).length,
    totalCenters: learningCenters.length,
    activeCenters: learningCenters.filter(c => c.is_active).length,
  }

  // Difficulty distribution
  const difficultyStats = {
    easy: words.filter(w => w.difficulty === 'easy').length,
    medium: words.filter(w => w.difficulty === 'medium').length,
    hard: words.filter(w => w.difficulty === 'hard').length,
  }

  // Recent activity (mock data - would come from API)
  const recentActivity = [
    { type: 'course', action: 'created', title: 'English Basics', time: '2 hours ago' },
    { type: 'lesson', action: 'updated', title: 'Greetings', time: '4 hours ago' },
    { type: 'word', action: 'created', title: 'hello', time: '6 hours ago' },
    { type: 'word', action: 'created', title: 'goodbye', time: '8 hours ago' },
  ]

  return (
    <div className='flex-1 space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Content Management</h1>
          <p className='text-muted-foreground'>
            Overview of educational content across all learning centers
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='px-3 py-1'>
            Super Admin Access
          </Badge>
        </div>
      </div>

      {/* Overview Stats */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Courses</CardTitle>
            <GraduationCap className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalCourses}</div>
            <div className='flex items-center text-xs text-muted-foreground'>
              <span className='text-green-600 font-medium'>{stats.activeCourses} active</span>
              <span className='mx-1'>•</span>
              <span>{stats.totalCourses - stats.activeCourses} inactive</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Lessons</CardTitle>
            <BookOpen className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalLessons}</div>
            <div className='flex items-center text-xs text-muted-foreground'>
              <span className='text-green-600 font-medium'>{stats.activeLessons} active</span>
              <span className='mx-1'>•</span>
              <span>{stats.totalLessons - stats.activeLessons} inactive</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Words</CardTitle>
            <Type className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalWords}</div>
            <div className='flex items-center text-xs text-muted-foreground'>
              <span className='text-green-600 font-medium'>{stats.activeWords} active</span>
              <span className='mx-1'>•</span>
              <span>{stats.totalWords - stats.activeWords} inactive</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Learning Centers</CardTitle>
            <Building2 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalCenters}</div>
            <div className='flex items-center text-xs text-muted-foreground'>
              <span className='text-green-600 font-medium'>{stats.activeCenters} active</span>
              <span className='mx-1'>•</span>
              <span>{stats.totalCenters - stats.activeCenters} inactive</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Analysis */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Difficulty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-4 w-4' />
              Word Difficulty Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of vocabulary by difficulty level
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-green-500' />
                  <span className='text-sm'>Easy</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>{difficultyStats.easy}</span>
                  <div className='w-20 h-2 bg-muted rounded-full overflow-hidden'>
                    <div 
                      className='h-full bg-green-500 transition-all duration-300'
                      style={{ 
                        width: `${stats.totalWords > 0 ? (difficultyStats.easy / stats.totalWords) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-yellow-500' />
                  <span className='text-sm'>Medium</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>{difficultyStats.medium}</span>
                  <div className='w-20 h-2 bg-muted rounded-full overflow-hidden'>
                    <div 
                      className='h-full bg-yellow-500 transition-all duration-300'
                      style={{ 
                        width: `${stats.totalWords > 0 ? (difficultyStats.medium / stats.totalWords) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-red-500' />
                  <span className='text-sm'>Hard</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>{difficultyStats.hard}</span>
                  <div className='w-20 h-2 bg-muted rounded-full overflow-hidden'>
                    <div 
                      className='h-full bg-red-500 transition-all duration-300'
                      style={{ 
                        width: `${stats.totalWords > 0 ? (difficultyStats.hard / stats.totalWords) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='h-4 w-4' />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest content management activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {recentActivity.map((activity, index) => (
                <div key={index} className='flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors'>
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'course' ? 'bg-blue-500' :
                    activity.type === 'lesson' ? 'bg-green-500' : 'bg-purple-500'
                  }`} />
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm'>
                      <span className='font-medium'>{activity.title}</span>
                      <span className='text-muted-foreground'> {activity.action}</span>
                    </p>
                    <p className='text-xs text-muted-foreground'>{activity.time}</p>
                  </div>
                  <Badge variant='outline' className='text-xs'>
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-4 w-4' />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common content management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3'>
            <Button variant='outline' className='h-20 flex-col gap-2'>
              <GraduationCap className='h-6 w-6' />
              <span>Create Course</span>
            </Button>
            <Button variant='outline' className='h-20 flex-col gap-2'>
              <BookOpen className='h-6 w-6' />
              <span>Add Lesson</span>
            </Button>
            <Button variant='outline' className='h-20 flex-col gap-2'>
              <Type className='h-6 w-6' />
              <span>Add Vocabulary</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
import { 
  ClipboardList, 
  Layers3, 
  HelpCircle, 
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

export function TestsManagementDashboard() {
  // Mock data - replace with actual API calls when backend is ready
  const mockData = {
    tests: [
      { id: 1, title: 'SAT Practice Test 1', is_active: true },
      { id: 2, title: 'SAT Practice Test 2', is_active: true },
      { id: 3, title: 'SAT Practice Test 3', is_active: false },
    ],
    modules: [
      { id: 1, title: 'Reading and Writing', test_id: 1, is_active: true },
      { id: 2, title: 'Math', test_id: 1, is_active: true },
      { id: 3, title: 'Reading and Writing', test_id: 2, is_active: true },
    ],
    questions: [
      { id: 1, title: 'Grammar Question 1', type: 'mcq', module_id: 1, is_active: true },
      { id: 2, title: 'Math Problem 1', type: 'fill_blank', module_id: 2, is_active: true },
      { id: 3, title: 'Reading Comprehension', type: 'mcq', module_id: 1, is_active: true },
    ]
  }

  // Calculate statistics
  const stats = {
    totalTests: mockData.tests.length,
    activeTests: mockData.tests.filter(t => t.is_active).length,
    totalModules: mockData.modules.length,
    activeModules: mockData.modules.filter(m => m.is_active).length,
    totalQuestions: mockData.questions.length,
    activeQuestions: mockData.questions.filter(q => q.is_active).length,
  }

  // Question type distribution
  const questionTypes = {
    mcq: mockData.questions.filter(q => q.type === 'mcq').length,
    fill_blank: mockData.questions.filter(q => q.type === 'fill_blank').length,
  }

  // Recent activity (mock data)
  const recentActivity = [
    { type: 'test', action: 'created', title: 'SAT Practice Test 3', time: '2 hours ago' },
    { type: 'module', action: 'updated', title: 'Reading and Writing', time: '4 hours ago' },
    { type: 'question', action: 'created', title: 'Grammar Question 5', time: '6 hours ago' },
    { type: 'question', action: 'updated', title: 'Math Problem 2', time: '8 hours ago' },
  ]

  return (
    <div className='flex-1 space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Tests Management</h1>
          <p className='text-muted-foreground'>
            Manage SAT tests, modules, and questions for comprehensive assessment
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='px-3 py-1'>
            Super Admin Access
          </Badge>
        </div>
      </div>

      {/* Overview Stats */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Tests</CardTitle>
            <ClipboardList className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalTests}</div>
            <div className='flex items-center text-xs text-muted-foreground'>
              <span className='text-green-600 font-medium'>{stats.activeTests} active</span>
              <span className='mx-1'>•</span>
              <span>{stats.totalTests - stats.activeTests} inactive</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Modules</CardTitle>
            <Layers3 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalModules}</div>
            <div className='flex items-center text-xs text-muted-foreground'>
              <span className='text-green-600 font-medium'>{stats.activeModules} active</span>
              <span className='mx-1'>•</span>
              <span>{stats.totalModules - stats.activeModules} inactive</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Questions</CardTitle>
            <HelpCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalQuestions}</div>
            <div className='flex items-center text-xs text-muted-foreground'>
              <span className='text-green-600 font-medium'>{stats.activeQuestions} active</span>
              <span className='mx-1'>•</span>
              <span>{stats.totalQuestions - stats.activeQuestions} inactive</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Analysis */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Question Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-4 w-4' />
              Question Type Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of questions by type
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-blue-500' />
                  <span className='text-sm'>Multiple Choice</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>{questionTypes.mcq}</span>
                  <div className='w-20 h-2 bg-muted rounded-full overflow-hidden'>
                    <div 
                      className='h-full bg-blue-500 transition-all duration-300'
                      style={{ 
                        width: `${stats.totalQuestions > 0 ? (questionTypes.mcq / stats.totalQuestions) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-purple-500' />
                  <span className='text-sm'>Fill in the Blank</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>{questionTypes.fill_blank}</span>
                  <div className='w-20 h-2 bg-muted rounded-full overflow-hidden'>
                    <div 
                      className='h-full bg-purple-500 transition-all duration-300'
                      style={{ 
                        width: `${stats.totalQuestions > 0 ? (questionTypes.fill_blank / stats.totalQuestions) * 100 : 0}%` 
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
              Latest test management activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {recentActivity.map((activity, index) => (
                <div key={index} className='flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors'>
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'test' ? 'bg-blue-500' :
                    activity.type === 'module' ? 'bg-green-500' : 'bg-purple-500'
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
            Common test management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3'>
            <Button variant='outline' className='h-20 flex-col gap-2'>
              <ClipboardList className='h-6 w-6' />
              <span>Create Test</span>
            </Button>
            <Button variant='outline' className='h-20 flex-col gap-2'>
              <Layers3 className='h-6 w-6' />
              <span>Add Module</span>
            </Button>
            <Button variant='outline' className='h-20 flex-col gap-2'>
              <HelpCircle className='h-6 w-6' />
              <span>Add Question</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
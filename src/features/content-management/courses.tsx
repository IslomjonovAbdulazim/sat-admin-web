import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Plus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { contentApi, type Course } from '@/lib/content-api'
import { learningCentersApi } from '@/lib/learning-centers-api'
import { CreateCourseDialog } from './components/create-course-dialog'
import { EditCourseDialog } from './components/edit-course-dialog'
import { CoursesTable } from './components/courses-table'

export function CoursesPage() {
  const navigate = useNavigate()
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCenter, setSelectedCenter] = useState<string>('all')

  // Fetch courses
  const {
    data: courses = [],
    isLoading: coursesLoading,
    refetch: refetchCourses,
  } = useQuery({
    queryKey: ['courses'],
    queryFn: () => contentApi.courses.list(),
  })

  // Fetch learning centers for filter
  const { data: learningCenters = [] } = useQuery({
    queryKey: ['learning-centers'],
    queryFn: () => learningCentersApi.list(),
  })

  // Filter courses based on search and filters
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCenter = selectedCenter === 'all' || 
                         course.learning_center_id.toString() === selectedCenter

    return matchesSearch && matchesCenter
  })

  const handleEdit = (course: Course) => {
    setSelectedCourse(course)
    setEditDialogOpen(true)
  }

  const handleViewLessons = (course: Course) => {
    navigate({ 
      to: '/content/lessons', 
      search: { courseId: course.id } 
    })
  }

  const handleRefresh = () => {
    refetchCourses()
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-1'>
            <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
              Course Management
            </h1>
            <p className='text-muted-foreground text-lg'>
              Create and manage educational courses across all learning centers
            </p>
          </div>
          <div className='flex items-center space-x-3'>
            <CreateCourseDialog onSuccess={handleRefresh}>
              <Button 
                size='lg'
                className='bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200'
              >
                <Plus className='mr-2 h-5 w-5' />
                Add Course
              </Button>
            </CreateCourseDialog>
          </div>
        </div>

        {/* Filters */}
        <div className='flex flex-col gap-3 md:flex-row md:items-center mb-6'>
          <div className='flex-1'>
            <Input
              placeholder='Search courses...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full'
            />
          </div>
          <div className='flex gap-2'>
            <Select value={selectedCenter} onValueChange={setSelectedCenter}>
              <SelectTrigger className='w-[160px]'>
                <SelectValue placeholder='All Centers' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Centers</SelectItem>
                {learningCenters.map((center) => (
                  <SelectItem key={center.id} value={center.id.toString()}>
                    {center.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant='outline' size='sm'>
              <Download className='h-4 w-4' />
              Export
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        {(searchQuery || selectedCenter !== 'all') && (
          <div className='flex items-center gap-2 text-sm text-muted-foreground mb-6'>
            <span>Showing {filteredCourses.length} of {courses.length} courses</span>
            {searchQuery && (
              <Badge variant='secondary'>
                Search: "{searchQuery}"
              </Badge>
            )}
            {selectedCenter !== 'all' && (
              <Badge variant='secondary'>
                Center: {learningCenters.find(c => c.id.toString() === selectedCenter)?.name}
              </Badge>
            )}
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setSearchQuery('')
                setSelectedCenter('all')
              }}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Courses Table */}
        <CoursesTable
          data={filteredCourses}
          learningCenters={learningCenters}
          isLoading={coursesLoading}
          onEdit={handleEdit}
          onViewLessons={handleViewLessons}
          onRefresh={handleRefresh}
        />
      </Main>

      {/* Edit Dialog */}
      <EditCourseDialog
        course={selectedCourse}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleRefresh}
      />
    </>
  )
}

const topNav = [
  {
    title: 'Courses',
    href: '/content/courses',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Lessons',
    href: '/content/lessons',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Words',
    href: '/content/words',
    isActive: false,
    disabled: false,
  },
]
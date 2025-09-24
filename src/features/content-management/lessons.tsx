import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Plus, Download, GraduationCap, Check, ChevronsUpDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { contentApi, type Lesson } from '@/lib/content-api'
import { learningCentersApi } from '@/lib/learning-centers-api'
import { getLogoUrl } from '@/lib/media-utils'
import { CreateLessonDialog } from './components/create-lesson-dialog'
import { EditLessonDialog } from './components/edit-lesson-dialog'
import { BulkCreateLessonsDialog } from './components/bulk-create-lessons-dialog'
import { LessonsTable } from './components/lessons-table'

export function LessonsPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_authenticated/content/lessons' })
  
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<string>(search.courseId?.toString() || '')
  const [coursePopoverOpen, setCoursePopoverOpen] = useState(false)

  // Fetch courses for selection
  const {
    data: courses = [],
    isLoading: coursesLoading,
  } = useQuery({
    queryKey: ['courses'],
    queryFn: () => contentApi.courses.list(),
  })

  // Fetch learning centers for course display
  const { data: learningCenters = [] } = useQuery({
    queryKey: ['learning-centers'],
    queryFn: () => learningCentersApi.list(),
  })

  // Fetch lessons for selected course
  const {
    data: lessons = [],
    isLoading: lessonsLoading,
    refetch: refetchLessons,
  } = useQuery({
    queryKey: ['lessons', selectedCourse],
    queryFn: () => contentApi.lessons.list({ 
      course_id: selectedCourse ? parseInt(selectedCourse) : undefined 
    }),
    enabled: !!selectedCourse,
  })

  // Set course from URL params on mount
  useEffect(() => {
    if (search.courseId && courses.length > 0) {
      setSelectedCourse(search.courseId.toString())
    }
  }, [search.courseId, courses])

  // Filter lessons based on search
  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleEdit = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setEditDialogOpen(true)
  }

  const handleViewWords = (lesson: Lesson) => {
    navigate({ 
      to: '/content/words', 
      search: { 
        lessonId: lesson.id 
      } 
    })
  }

  const handleRefresh = () => {
    refetchLessons()
  }

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId)
    setSearchQuery('')
    // Update URL to reflect course selection
    navigate({ 
      to: '/content/lessons', 
      search: courseId ? { courseId: parseInt(courseId) } : {} 
    })
  }

  const selectedCourseData = courses.find(c => c.id.toString() === selectedCourse)
  const selectedCenter = learningCenters.find(c => c.id === selectedCourseData?.learning_center_id)

  // Show course selection if no course is selected
  if (!selectedCourse) {
    return (
      <>
        {/* ===== Top Heading ===== */}
        <Header>
          <TopNav links={topNav} />
          <div className='ms-auto flex items-center space-x-4'>
            <SearchComponent />
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
                Lesson Management
              </h1>
              <p className='text-muted-foreground text-lg'>
                Select a course to view and manage its lessons
              </p>
            </div>
          </div>

          {/* Course Selection */}
          <Card className='max-w-2xl mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <GraduationCap className='h-5 w-5' />
              Select Course
            </CardTitle>
            <CardDescription>
              Choose a course to manage its lessons and content
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Popover open={coursePopoverOpen} onOpenChange={setCoursePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  aria-expanded={coursePopoverOpen}
                  className='w-full justify-between'
                >
                  {selectedCourse ? (
                    (() => {
                      const course = courses.find(c => c.id.toString() === selectedCourse)
                      const center = learningCenters.find(c => c.id === course?.learning_center_id)
                      return (
                        <div className='flex items-center gap-2'>
                          <Avatar className='h-6 w-6'>
                            <AvatarImage
                              src={getLogoUrl(center?.logo || '')}
                              alt={center?.name}
                            />
                            <AvatarFallback>
                              <GraduationCap className='h-3 w-3' />
                            </AvatarFallback>
                          </Avatar>
                          <span className='truncate'>{course?.title}</span>
                        </div>
                      )
                    })()
                  ) : (
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <Search className='h-4 w-4' />
                      <span>Search courses...</span>
                    </div>
                  )}
                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-full p-0'>
                <Command>
                  <CommandInput placeholder='Search courses...' />
                  <CommandEmpty>No courses found.</CommandEmpty>
                  <CommandGroup>
                    {courses.map((course) => {
                      const center = learningCenters.find(c => c.id === course.learning_center_id)
                      return (
                        <CommandItem
                          key={course.id}
                          value={`${course.title} ${center?.name || ''}`}
                          onSelect={() => {
                            handleCourseChange(course.id.toString())
                            setCoursePopoverOpen(false)
                          }}
                        >
                          <div className='flex items-center gap-3 w-full'>
                            <Avatar className='h-8 w-8'>
                              <AvatarImage
                                src={getLogoUrl(center?.logo || '')}
                                alt={center?.name}
                              />
                              <AvatarFallback>
                                <GraduationCap className='h-4 w-4' />
                              </AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                              <div className='font-medium'>{course.title}</div>
                              <div className='text-sm text-muted-foreground'>
                                {center?.name || `Center ${course.learning_center_id}`} • Lessons
                              </div>
                            </div>
                            <Check
                              className={`ml-auto h-4 w-4 ${
                                selectedCourse === course.id.toString() ? 'opacity-100' : 'opacity-0'
                              }`}
                            />
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {coursesLoading && (
              <div className='flex items-center justify-center py-4'>
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
                <span className='ml-2 text-sm text-muted-foreground'>Loading courses...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Stats */}
        {courses.length > 0 && (
          <div className='grid gap-4 md:grid-cols-3 max-w-2xl'>
            <Card>
              <CardContent className='pt-6'>
                <div className='text-2xl font-bold'>{courses.length}</div>
                <p className='text-xs text-muted-foreground'>Total Courses</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <div className='text-2xl font-bold'>
                  {courses.reduce((sum, c) => sum + (c.lessons_count || 0), 0)}
                </div>
                <p className='text-xs text-muted-foreground'>Total Lessons</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <div className='text-2xl font-bold'>{learningCenters.length}</div>
                <p className='text-xs text-muted-foreground'>Learning Centers</p>
              </CardContent>
            </Card>
          </div>
        )}
        </Main>
      </>
    )
  }

  // Show lessons for selected course
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <SearchComponent />
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
              Lesson Management
            </h1>
            <div className='flex items-center gap-2 mt-1'>
              <p className='text-muted-foreground text-lg'>
                Managing lessons for
              </p>
              {selectedCenter && (
                <Avatar className='h-5 w-5'>
                  <AvatarImage
                    src={getLogoUrl(selectedCenter.logo || '')}
                    alt={selectedCenter.name}
                  />
                  <AvatarFallback>
                    <GraduationCap className='h-3 w-3' />
                  </AvatarFallback>
                </Avatar>
              )}
              <Badge variant='outline'>
                {selectedCourseData?.title}
              </Badge>
            </div>
          </div>
          <div className='flex items-center space-x-3'>
            <Button 
              variant='outline' 
              onClick={() => setSelectedCourse('')}
            >
              Change Course
            </Button>
            <BulkCreateLessonsDialog
              courseId={parseInt(selectedCourse)}
              courseName={selectedCourseData?.title || 'Selected Course'}
              onSuccess={handleRefresh}
            />
            <CreateLessonDialog 
              courseId={parseInt(selectedCourse)} 
              onSuccess={handleRefresh}
            >
              <Button 
                size='lg'
                className='bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200'
              >
                <Plus className='mr-2 h-5 w-5' />
                Add Lesson
              </Button>
            </CreateLessonDialog>
          </div>
        </div>

        {/* Filters */}
        <div className='flex flex-col gap-3 md:flex-row md:items-center mb-6'>
        <div className='flex-1'>
          <Input
            placeholder='Search lessons...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full'
          />
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4' />
            Export
          </Button>
        </div>
        </div>

        {/* Results Summary */}
        {searchQuery && (
          <div className='flex items-center gap-2 text-sm text-muted-foreground mb-6'>
            <span>Showing {filteredLessons.length} of {lessons.length} lessons</span>
            <Badge variant='secondary'>
              Search: "{searchQuery}"
            </Badge>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setSearchQuery('')}
            >
              Clear search
            </Button>
          </div>
        )}

        {/* Lessons Table */}
        <LessonsTable
          data={filteredLessons}
          isLoading={lessonsLoading}
          onEdit={handleEdit}
          onViewWords={handleViewWords}
          onRefresh={handleRefresh}
          courseName={selectedCourseData?.title}
        />
      </Main>

      {/* Edit Dialog */}
      <EditLessonDialog
        lesson={selectedLesson}
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
    isActive: false,
    disabled: false,
  },
  {
    title: 'Lessons',
    href: '/content/lessons',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Words',
    href: '/content/words',
    isActive: false,
    disabled: false,
  },
]
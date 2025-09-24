import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Plus, Download, BookOpen, GraduationCap, Check, ChevronsUpDown, Search } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { contentApi, type Word } from '@/lib/content-api'
import { learningCentersApi } from '@/lib/learning-centers-api'
import { getLogoUrl } from '@/lib/media-utils'
import { difficultyOptions } from './data/schema'
import { CreateWordDialog } from './components/create-word-dialog'
import { EditWordDialog } from './components/edit-word-dialog'
import { BulkCreateWordsDialog } from './components/bulk-create-words-dialog'
import { ImageUploadDialog } from './components/image-upload-dialog'
import { AudioUploadDialog } from './components/audio-upload-dialog'
import { ImagePreviewDialog } from './components/image-preview-dialog'
import { WordsTable } from './components/words-table'

export function WordsPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_authenticated/content/words' })
  
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [imageUploadDialogOpen, setImageUploadDialogOpen] = useState(false)
  const [audioUploadDialogOpen, setAudioUploadDialogOpen] = useState(false)
  const [imagePreviewDialogOpen, setImagePreviewDialogOpen] = useState(false)
  const [uploadTargetWord, setUploadTargetWord] = useState<Word | null>(null)
  const [previewTargetWord, setPreviewTargetWord] = useState<Word | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLesson, setSelectedLesson] = useState<string>(search.lessonId?.toString() || '')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [lessonPopoverOpen, setLessonPopoverOpen] = useState(false)

  // Fetch courses for lesson display
  const {
    data: courses = [],
  } = useQuery({
    queryKey: ['courses'],
    queryFn: () => contentApi.courses.list(),
  })

  // Fetch all lessons for selection
  const {
    data: lessons = [],
    isLoading: lessonsLoading,
  } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => contentApi.lessons.list(),
  })

  // Fetch learning centers for lesson display
  const { data: learningCenters = [] } = useQuery({
    queryKey: ['learning-centers'],
    queryFn: () => learningCentersApi.list(),
  })

  // Fetch words for selected lesson
  const {
    data: words = [],
    isLoading: wordsLoading,
    refetch: refetchWords,
  } = useQuery({
    queryKey: ['words', selectedLesson],
    queryFn: () => contentApi.words.list({ 
      lesson_id: selectedLesson ? parseInt(selectedLesson) : undefined 
    }),
    enabled: !!selectedLesson,
  })

  // Set lesson from URL params on mount
  useEffect(() => {
    if (search.lessonId && lessons.length > 0) {
      setSelectedLesson(search.lessonId.toString())
    }
  }, [search.lessonId, lessons])

  // Filter words based on search and difficulty
  const filteredWords = words.filter((word) => {
    const matchesSearch = word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         word.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         word.definition.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDifficulty = difficultyFilter === 'all' || word.difficulty === difficultyFilter

    return matchesSearch && matchesDifficulty
  })

  const handleEdit = (word: Word) => {
    setSelectedWord(word)
    setEditDialogOpen(true)
  }

  const handleUploadMedia = (word: Word, type: 'audio' | 'image') => {
    setUploadTargetWord(word)
    if (type === 'image') {
      setImageUploadDialogOpen(true)
    } else {
      setAudioUploadDialogOpen(true)
    }
  }

  const handlePreviewImage = (word: Word) => {
    setPreviewTargetWord(word)
    setImagePreviewDialogOpen(true)
  }

  const handleRefresh = () => {
    refetchWords()
  }

  const handleLessonChange = (lessonId: string) => {
    setSelectedLesson(lessonId)
    setSearchQuery('')
    setDifficultyFilter('all')
    // Update URL to reflect lesson selection
    navigate({ 
      to: '/content/words', 
      search: lessonId ? { lessonId: parseInt(lessonId) } : {} 
    })
  }

  const selectedLessonData = lessons.find(l => l.id.toString() === selectedLesson)
  const selectedCourseData = selectedLessonData ? courses.find(c => c.id === selectedLessonData.course_id) : null
  const selectedCenter = learningCenters.find(c => c.id === selectedCourseData?.learning_center_id)

  // Show lesson selection if no lesson is selected
  if (!selectedLesson) {
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
                Words Management
              </h1>
              <p className='text-muted-foreground text-lg'>
                Select a lesson to manage its vocabulary words
              </p>
            </div>
          </div>

          {/* Lesson Selection */}
          <Card className='max-w-2xl mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BookOpen className='h-5 w-5' />
              Select Lesson
            </CardTitle>
            <CardDescription>
              Choose a lesson to manage its vocabulary words and content
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Popover open={lessonPopoverOpen} onOpenChange={setLessonPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  aria-expanded={lessonPopoverOpen}
                  className='w-full justify-between'
                >
                  {selectedLesson ? (
                    (() => {
                      const lesson = lessons.find(l => l.id.toString() === selectedLesson)
                      const course = courses.find(c => c.id === lesson?.course_id)
                      const center = learningCenters.find(c => c.id === course?.learning_center_id)
                      return (
                        <div className='flex items-center gap-2'>
                          <Avatar className='h-6 w-6'>
                            <AvatarImage
                              src={getLogoUrl(center?.logo || '')}
                              alt={center?.name}
                            />
                            <AvatarFallback>
                              <BookOpen className='h-3 w-3' />
                            </AvatarFallback>
                          </Avatar>
                          <span className='truncate'>{lesson?.title}</span>
                        </div>
                      )
                    })()
                  ) : (
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <Search className='h-4 w-4' />
                      <span>Search lessons...</span>
                    </div>
                  )}
                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-full p-0'>
                <Command>
                  <CommandInput placeholder='Search lessons...' />
                  <CommandEmpty>No lessons found.</CommandEmpty>
                  <CommandGroup>
                    {lessons.map((lesson) => {
                      const course = courses.find(c => c.id === lesson.course_id)
                      const center = learningCenters.find(c => c.id === course?.learning_center_id)
                      return (
                        <CommandItem
                          key={lesson.id}
                          value={`${lesson.title} ${course?.title || ''}`}
                          onSelect={() => {
                            handleLessonChange(lesson.id.toString())
                            setLessonPopoverOpen(false)
                          }}
                        >
                          <div className='flex items-center gap-3 w-full'>
                            <Avatar className='h-8 w-8'>
                              <AvatarImage
                                src={getLogoUrl(center?.logo || '')}
                                alt={center?.name}
                              />
                              <AvatarFallback>
                                <BookOpen className='h-4 w-4' />
                              </AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                              <div className='font-medium'>{lesson.title}</div>
                              <div className='text-sm text-muted-foreground'>
                                {course?.title || `Course ${lesson.course_id}`} • Words
                              </div>
                            </div>
                            <Check
                              className={`ml-auto h-4 w-4 ${
                                selectedLesson === lesson.id.toString() ? 'opacity-100' : 'opacity-0'
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

            {lessonsLoading && (
              <div className='flex items-center justify-center py-4'>
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
                <span className='ml-2 text-sm text-muted-foreground'>Loading lessons...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        {lessons.length > 0 && (
          <div className='grid gap-4 md:grid-cols-3 max-w-2xl'>
            <Card>
              <CardContent className='pt-6'>
                <div className='text-2xl font-bold'>{lessons.length}</div>
                <p className='text-xs text-muted-foreground'>Total Lessons</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <div className='text-2xl font-bold'>
                  {lessons.reduce((sum, l) => sum + (l.words_count || 0), 0)}
                </div>
                <p className='text-xs text-muted-foreground'>Total Words</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <div className='text-2xl font-bold'>{courses.length}</div>
                <p className='text-xs text-muted-foreground'>Total Courses</p>
              </CardContent>
            </Card>
          </div>
        )}
        </Main>
      </>
    )
  }

  // Show words for selected lesson
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
              Words Management
            </h1>
            <div className='flex items-center gap-2 mt-1'>
              <p className='text-muted-foreground text-lg'>
                Managing words for
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
                {selectedLessonData?.title}
              </Badge>
              <span className='text-muted-foreground'>in</span>
              <Badge variant='secondary'>
                {selectedCourseData?.title}
              </Badge>
            </div>
          </div>
          <div className='flex items-center space-x-3'>
            <Button 
              variant='outline' 
              onClick={() => setSelectedLesson('')}
            >
              Change Lesson
            </Button>
            <BulkCreateWordsDialog
              lessonId={parseInt(selectedLesson)}
              lessonName={selectedLessonData?.title || 'Selected Lesson'}
              onSuccess={handleRefresh}
            />
            <CreateWordDialog 
              lessonId={parseInt(selectedLesson)} 
              onSuccess={handleRefresh}
            >
              <Button 
                size='lg'
                className='bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200'
              >
                <Plus className='mr-2 h-5 w-5' />
                Add Word
              </Button>
            </CreateWordDialog>
          </div>
        </div>

        {/* Filters */}
        <div className='flex flex-col gap-3 md:flex-row md:items-center mb-6'>
        <div className='flex-1'>
          <Input
            placeholder='Search words, translations, or definitions...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full'
          />
        </div>
        <div className='flex gap-2'>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='All Levels' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Levels</SelectItem>
              {difficultyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className='flex items-center gap-2'>
                    <Badge 
                      variant='secondary' 
                      className={`text-xs ${option.color} border-0`}
                    >
                      {option.label}
                    </Badge>
                  </div>
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
        {(searchQuery || difficultyFilter !== 'all') && (
          <div className='flex items-center gap-2 text-sm text-muted-foreground mb-6'>
            <span>Showing {filteredWords.length} of {words.length} words</span>
            {searchQuery && (
              <Badge variant='secondary'>
                Search: "{searchQuery}"
              </Badge>
            )}
            {difficultyFilter !== 'all' && (
              <Badge variant='secondary'>
                Level: {difficultyOptions.find(d => d.value === difficultyFilter)?.label}
              </Badge>
            )}
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setSearchQuery('')
                setDifficultyFilter('all')
              }}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Words Table */}
        <WordsTable
          data={filteredWords}
          isLoading={wordsLoading}
          onEdit={handleEdit}
          onUploadMedia={handleUploadMedia}
          onPreviewImage={handlePreviewImage}
          onRefresh={handleRefresh}
          lessonName={selectedLessonData?.title}
        />
      </Main>

      {/* Edit Dialog */}
      <EditWordDialog
        word={selectedWord}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleRefresh}
      />

      {/* Upload Dialogs */}
      {uploadTargetWord && (
        <>
          <ImageUploadDialog
            word={uploadTargetWord}
            open={imageUploadDialogOpen}
            onOpenChange={setImageUploadDialogOpen}
            onSuccess={handleRefresh}
          />
          <AudioUploadDialog
            word={uploadTargetWord}
            open={audioUploadDialogOpen}
            onOpenChange={setAudioUploadDialogOpen}
            onSuccess={handleRefresh}
          />
        </>
      )}

      {/* Image Preview Dialog */}
      <ImagePreviewDialog
        word={previewTargetWord}
        open={imagePreviewDialogOpen}
        onOpenChange={setImagePreviewDialogOpen}
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
    isActive: false,
    disabled: false,
  },
  {
    title: 'Words',
    href: '/content/words',
    isActive: true,
    disabled: false,
  },
]
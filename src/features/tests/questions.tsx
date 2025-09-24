import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch, Link } from '@tanstack/react-router'
import { Plus, Download, AlertCircle } from 'lucide-react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { questionsApi, type Question } from '@/lib/questions-api'
import { modulesApi } from '@/lib/modules-api'
import { QuestionsList } from './components/questions-list'

export function QuestionsPage() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { moduleId?: string }
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModule, setSelectedModule] = useState<string>(searchParams.moduleId || 'none')
  const [selectedType, setSelectedType] = useState<string>('all')

  // Fetch modules for the filter dropdown
  const { data: modules = [] } = useQuery({
    queryKey: ['modules'],
    queryFn: () => modulesApi.list(),
  })

  // Fetch questions - only if module is selected
  const {
    data: questions = [],
    isLoading: questionsLoading,
    refetch: refetchQuestions,
  } = useQuery({
    queryKey: ['questions', selectedModule],
    queryFn: () => {
      if (selectedModule === 'none') {
        return []
      }
      return questionsApi.getByModuleId(parseInt(selectedModule))
    },
    enabled: selectedModule !== 'none',
  })

  // Filter questions based on search and type
  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || question.type === selectedType
    return matchesSearch && matchesType
  })

  const handleEdit = (question: Question) => {
    // TODO: Implement edit functionality
    console.log('Edit question:', question.title)
  }

  const handleRefresh = () => {
    refetchQuestions()
  }

  const handleModuleChange = (moduleId: string) => {
    setSelectedModule(moduleId)
    setSearchQuery('') // Reset search when changing module
    setSelectedType('all') // Reset type filter when changing module
    
    // Update URL search params
    if (moduleId !== 'none') {
      navigate({ 
        to: '/tests/questions', 
        search: { moduleId } 
      })
    } else {
      navigate({ 
        to: '/tests/questions', 
        search: {} 
      })
    }
  }

  const getTypeLabel = (type: 'mcq' | 'fill_blank') => {
    return type === 'mcq' ? 'Multiple Choice' : 'Fill in the Blank'
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
              Questions Management
            </h1>
            <p className='text-muted-foreground text-lg'>
              Create and manage individual test questions with multiple choice or fill-in-the-blank formats
            </p>
          </div>
          <div className='flex items-center space-x-3'>
            <Button asChild size='lg' className='bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200' disabled={selectedModule === 'none'}>
              <Link 
                to="/tests/questions/create" 
                search={selectedModule !== 'none' ? { moduleId: selectedModule } : { moduleId: undefined }}
              >
                <Plus className='mr-2 h-5 w-5' />
                Add Question
              </Link>
            </Button>
          </div>
        </div>

        {/* Module Selection Required Notice */}
        {selectedModule === 'none' && (
          <Alert className='mb-6 border-amber-200 bg-amber-50 text-amber-800'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              Please select a module to view and manage questions. You must choose a specific module to see its questions.
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className='flex flex-col gap-3 md:flex-row md:items-center mb-6'>
          <div className='flex-1'>
            <Input
              placeholder={selectedModule === 'none' ? 'Select a module first to search questions...' : 'Search questions...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full'
              disabled={selectedModule === 'none'}
            />
          </div>
          <div className='flex gap-2'>
            <Select value={selectedModule} onValueChange={handleModuleChange}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Select Module' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>Select Module...</SelectItem>
                {modules.map((module) => (
                  <SelectItem key={module.id} value={module.id.toString()}>
                    {module.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={selectedType} 
              onValueChange={setSelectedType}
              disabled={selectedModule === 'none'}
            >
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='All Types' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                <SelectItem value='mcq'>Multiple Choice</SelectItem>
                <SelectItem value='fill_blank'>Fill in Blank</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant='outline' 
              size='sm'
              disabled={selectedModule === 'none' || filteredQuestions.length === 0}
            >
              <Download className='h-4 w-4' />
              Export
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        {selectedModule !== 'none' && (searchQuery || selectedType !== 'all') && (
          <div className='flex items-center gap-2 text-sm text-muted-foreground mb-6'>
            <span>Showing {filteredQuestions.length} of {questions.length} questions</span>
            {searchQuery && (
              <Badge variant='secondary'>
                Search: "{searchQuery}"
              </Badge>
            )}
            <Badge variant='secondary'>
              Module: {modules.find(m => m.id.toString() === selectedModule)?.title}
            </Badge>
            {selectedType !== 'all' && (
              <Badge variant='secondary'>
                Type: {getTypeLabel(selectedType as 'mcq' | 'fill_blank')}
              </Badge>
            )}
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setSearchQuery('')
                setSelectedType('all')
              }}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Questions List */}
        {selectedModule !== 'none' && (
          <QuestionsList
            data={filteredQuestions}
            modules={modules}
            isLoading={questionsLoading}
            onEdit={handleEdit}
            onRefresh={handleRefresh}
          />
        )}

        {/* Empty State for no module selection */}
        {selectedModule === 'none' && (
          <div className='text-center py-16'>
            <AlertCircle className='mx-auto h-16 w-16 text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold mb-2'>Select a Module to View Questions</h3>
            <div className='text-muted-foreground mb-6 max-w-md mx-auto'>
              Questions are organized by modules. Please select a specific module from the dropdown above to view and manage its questions.
            </div>
            <div className='text-sm text-muted-foreground'>
              You can also create questions directly within a selected module.
            </div>
          </div>
        )}
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Tests',
    href: '/tests/tests',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Modules',
    href: '/tests/modules',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Questions',
    href: '/tests/questions',
    isActive: true,
    disabled: false,
  },
]
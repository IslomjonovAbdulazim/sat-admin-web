import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
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
import { modulesApi, type Module } from '@/lib/modules-api'
import { testsApi } from '@/lib/tests-api'
import { CreateModuleDialog } from './components/create-module-dialog'
import { EditModuleDialog } from './components/edit-module-dialog'
import { ModulesGrid } from './components/modules-grid'

export function ModulesPage() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { testId?: string }
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTest, setSelectedTest] = useState<string>(searchParams.testId || 'all')

  // Fetch tests for the filter dropdown
  const { data: tests = [] } = useQuery({
    queryKey: ['tests'],
    queryFn: () => testsApi.list(),
  })

  // Fetch modules - either all or filtered by test
  const {
    data: modules = [],
    isLoading: modulesLoading,
    refetch: refetchModules,
  } = useQuery({
    queryKey: ['modules', selectedTest],
    queryFn: () => {
      if (selectedTest === 'all') {
        return modulesApi.list()
      } else {
        return modulesApi.getByTestId(parseInt(selectedTest))
      }
    },
  })

  // Filter modules based on search
  const filteredModules = modules.filter((module) =>
    module.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (module: Module) => {
    setSelectedModule(module)
    setEditDialogOpen(true)
  }

  const handleViewQuestions = (module: Module) => {
    navigate({ 
      to: '/tests/questions', 
      search: { moduleId: module.id.toString() } 
    })
  }

  const handleRefresh = () => {
    refetchModules()
  }

  const handleTestChange = (testId: string) => {
    setSelectedTest(testId)
    // Update URL search params if needed
    if (testId !== 'all') {
      navigate({ 
        to: '/tests/modules', 
        search: { testId } 
      })
    } else {
      navigate({ 
        to: '/tests/modules', 
        search: {} 
      })
    }
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
              Modules Management
            </h1>
            <p className='text-muted-foreground text-lg'>
              Organize test content into modules like Reading & Writing, Math, etc.
            </p>
          </div>
          <div className='flex items-center space-x-3'>
            <CreateModuleDialog 
              defaultTestId={selectedTest !== 'all' ? parseInt(selectedTest) : undefined}
              onSuccess={handleRefresh}
            >
              <Button 
                size='lg'
                className='bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200'
              >
                <Plus className='mr-2 h-5 w-5' />
                Add Module
              </Button>
            </CreateModuleDialog>
          </div>
        </div>

        {/* Filters */}
        <div className='flex flex-col gap-3 md:flex-row md:items-center mb-6'>
          <div className='flex-1'>
            <Input
              placeholder='Search modules...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full'
            />
          </div>
          <div className='flex gap-2'>
            <Select value={selectedTest} onValueChange={handleTestChange}>
              <SelectTrigger className='w-[160px]'>
                <SelectValue placeholder='All Tests' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Tests</SelectItem>
                {tests.map((test) => (
                  <SelectItem key={test.id} value={test.id.toString()}>
                    {test.title}
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
        {(searchQuery || selectedTest !== 'all') && (
          <div className='flex items-center gap-2 text-sm text-muted-foreground mb-6'>
            <span>Showing {filteredModules.length} of {modules.length} modules</span>
            {searchQuery && (
              <Badge variant='secondary'>
                Search: "{searchQuery}"
              </Badge>
            )}
            {selectedTest !== 'all' && (
              <Badge variant='secondary'>
                Test: {tests.find(t => t.id.toString() === selectedTest)?.title}
              </Badge>
            )}
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setSearchQuery('')
                handleTestChange('all')
              }}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Modules Grid */}
        <ModulesGrid
          data={filteredModules}
          tests={tests}
          isLoading={modulesLoading}
          onEdit={handleEdit}
          onViewQuestions={handleViewQuestions}
          onRefresh={handleRefresh}
        />
      </Main>

      {/* Edit Dialog */}
      <EditModuleDialog
        module={selectedModule}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleRefresh}
      />
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
    isActive: true,
    disabled: false,
  },
  {
    title: 'Questions',
    href: '/tests/questions',
    isActive: false,
    disabled: false,
  },
]
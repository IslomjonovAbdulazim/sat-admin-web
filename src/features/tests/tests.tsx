import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Plus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { testsApi, type Test } from '@/lib/tests-api'
import { CreateTestDialog } from './components/create-test-dialog'
import { EditTestDialog } from './components/edit-test-dialog'
import { TestsGrid } from './components/tests-table'

export function TestsPage() {
  const navigate = useNavigate()
  const [selectedTest, setSelectedTest] = useState<Test | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch tests
  const {
    data: tests = [],
    isLoading: testsLoading,
    refetch: refetchTests,
  } = useQuery({
    queryKey: ['tests'],
    queryFn: () => testsApi.list(),
  })

  // Filter tests based on search
  const filteredTests = tests.filter((test) =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (test: Test) => {
    setSelectedTest(test)
    setEditDialogOpen(true)
  }

  const handleViewModules = (test: Test) => {
    navigate({ 
      to: '/tests/modules', 
      search: { testId: test.id.toString() } 
    })
  }

  const handleRefresh = () => {
    refetchTests()
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
              Tests Management
            </h1>
            <p className='text-muted-foreground text-lg'>
              Create and manage SAT practice tests and assessments
            </p>
          </div>
          <div className='flex items-center space-x-3'>
            <CreateTestDialog onSuccess={handleRefresh}>
              <Button 
                size='lg'
                className='bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200'
              >
                <Plus className='mr-2 h-5 w-5' />
                Add Test
              </Button>
            </CreateTestDialog>
          </div>
        </div>

        {/* Filters */}
        <div className='flex flex-col gap-3 md:flex-row md:items-center mb-6'>
          <div className='flex-1'>
            <Input
              placeholder='Search tests...'
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
            <span>Showing {filteredTests.length} of {tests.length} tests</span>
            <Badge variant='secondary'>
              Search: "{searchQuery}"
            </Badge>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setSearchQuery('')}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Tests Grid */}
        <TestsGrid
          data={filteredTests}
          isLoading={testsLoading}
          onEdit={handleEdit}
          onViewModules={handleViewModules}
          onRefresh={handleRefresh}
        />
      </Main>

      {/* Edit Dialog */}
      <EditTestDialog
        test={selectedTest}
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
    isActive: true,
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
    isActive: false,
    disabled: false,
  },
]
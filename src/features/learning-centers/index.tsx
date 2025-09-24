import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { learningCentersApi, type LearningCenter } from '@/lib/learning-centers-api'
import { LearningCentersTable } from './components/learning-centers-table'
import { CreateLearningCenterDialog } from './components/create-learning-center-dialog'
import { EditLearningCenterDialog } from './components/edit-learning-center-dialog'
import { UploadLogoDialog } from './components/upload-logo-dialog'

export function LearningCenters() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [uploadLogoOpen, setUploadLogoOpen] = useState(false)
  const [selectedCenter, setSelectedCenter] = useState<LearningCenter | null>(null)

  // Fetch learning centers
  const {
    data: learningCenters = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['learning-centers'],
    queryFn: () => learningCentersApi.list({ limit: 100 }),
  })

  const handleEdit = (center: LearningCenter) => {
    setSelectedCenter(center)
    setEditDialogOpen(true)
  }

  const handleUploadLogo = (center: LearningCenter) => {
    setSelectedCenter(center)
    setUploadLogoOpen(true)
  }

  const handleSuccess = () => {
    refetch()
    setCreateDialogOpen(false)
    setEditDialogOpen(false)
    setUploadLogoOpen(false)
    setSelectedCenter(null)
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
              Learning Centers
            </h1>
            <p className='text-muted-foreground text-lg'>
              Manage all learning centers, their configurations, and operational limits
            </p>
          </div>
          <div className='flex items-center space-x-3'>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              size='lg'
              className='bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200'
            >
              <Plus className='mr-2 h-5 w-5' />
              Add Learning Center
            </Button>
          </div>
        </div>

        <LearningCentersTable
          data={learningCenters}
          isLoading={isLoading}
          onEdit={handleEdit}
          onUploadLogo={handleUploadLogo}
          onRefresh={refetch}
        />
      </Main>

      {/* Dialogs */}
      <CreateLearningCenterDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleSuccess}
      />

      {selectedCenter && (
        <>
          <EditLearningCenterDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            center={selectedCenter}
            onSuccess={handleSuccess}
          />
          <UploadLogoDialog
            open={uploadLogoOpen}
            onOpenChange={setUploadLogoOpen}
            center={selectedCenter}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </>
  )
}

const topNav = [
  {
    title: 'Overview',
    href: '/learning-centers',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Analytics',
    href: '/learning-centers/analytics',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Settings',
    href: '/learning-centers/settings',
    isActive: false,
    disabled: true,
  },
]
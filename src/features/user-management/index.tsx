import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { usersApi, type User } from '@/lib/users-api'
import { UserManagementTable } from './components/user-management-table'
import { CreateUserDialog } from './components/create-user-dialog'
import { EditUserDialog } from './components/edit-user-dialog'

export function UserManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Fetch all admin users
  const {
    data: users = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => {
      return usersApi.list({ 
        role: 'admin',
        limit: 100 
      })
    },
  })

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setEditDialogOpen(true)
  }

  const handleSuccess = () => {
    refetch()
    setCreateDialogOpen(false)
    setEditDialogOpen(false)
    setSelectedUser(null)
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
              Admins
            </h1>
            <p className='text-muted-foreground text-lg'>
              Create and manage admin accounts across all learning centers
            </p>
          </div>
          <div className='flex items-center space-x-3'>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              size='lg'
              className='bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200'
            >
              <UserPlus className='mr-2 h-5 w-5' />
              Add Admin
            </Button>
          </div>
        </div>


        {/* User Table */}
        <UserManagementTable
          data={users}
          isLoading={isLoading}
          onEdit={handleEdit}
          onRefresh={refetch}
        />
      </Main>

      {/* Dialogs */}
      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleSuccess}
      />

      {selectedUser && (
        <EditUserDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          user={selectedUser}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}

const topNav = [
  {
    title: 'Overview',
    href: '/user-management',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Roles & Permissions',
    href: '/user-management/roles',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Activity Log',
    href: '/user-management/activity',
    isActive: false,
    disabled: true,
  },
]
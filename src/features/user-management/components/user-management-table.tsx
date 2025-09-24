import { useState } from 'react'
import { MoreHorizontal, UserCheck, UserX, Trash2, Edit, Phone, Building, Users } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { usersApi, type User } from '@/lib/users-api'
import { learningCentersApi } from '@/lib/learning-centers-api'
import { getLogoUrl } from '@/lib/media-utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

interface UserManagementTableProps {
  data: User[]
  isLoading: boolean
  onEdit: (user: User) => void
  onRefresh: () => void
}

export function UserManagementTable({ data, isLoading, onEdit, onRefresh }: UserManagementTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      toast.success('User deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onRefresh()
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete user')
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) => 
      usersApi.update(id, { is_active: !is_active } as any),
    onSuccess: () => {
      toast.success('User status updated successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onRefresh()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update user status')
    },
  })

  const handleDelete = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleToggleActive = (user: User) => {
    toggleActiveMutation.mutate({ id: user.id, is_active: user.is_active })
  }


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admins</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admins</CardTitle>
          <CardDescription>No admins found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-8'>
            <Users className='h-12 w-12 text-muted-foreground mb-4' />
            <p className='text-muted-foreground text-center'>
              No admins have been created yet.
              <br />
              Click "Add Admin" to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className='border-0 shadow-lg bg-gradient-to-br from-card via-card to-card/95'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-xl font-semibold flex items-center gap-2'>
                <Users className='h-5 w-5 text-primary' />
                Admins ({data.length})
              </CardTitle>
              <CardDescription className='mt-1'>
                Manage admin users and their access permissions
              </CardDescription>
            </div>
            <div className='text-right'>
              <div className='text-sm text-muted-foreground'>Active Admins</div>
              <div className='text-2xl font-bold text-primary'>
                {data.filter(user => user.is_active).length}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Learning Center</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className='w-[70px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((user) => <AdminRow key={user.id} user={user} onEdit={onEdit} onToggleActive={handleToggleActive} onDelete={handleDelete} />)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        handleConfirm={() => userToDelete && deleteMutation.mutate(userToDelete.id)}
        title='Delete Admin'
        desc={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
        confirmText='Delete Admin'
        isLoading={deleteMutation.isPending}
        destructive
      />
    </>
  )
}

// Separate component for admin row
function AdminRow({ user, onEdit, onToggleActive, onDelete }: { 
  user: User
  onEdit: (user: User) => void
  onToggleActive: (user: User) => void
  onDelete: (user: User) => void
}) {
  return (
    <TableRow key={user.id}>
      {/* Admin */}
      <TableCell className='max-w-[300px]'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20'>
            <span className='text-sm font-medium text-primary'>
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div className='min-w-0 flex-1'>
            <div className='font-medium truncate' title={user.name}>{user.name}</div>
            <div className='flex items-center text-sm text-muted-foreground'>
              <Phone className='mr-1 h-3 w-3' />
              <span className='truncate'>{user.phone}</span>
            </div>
          </div>
        </div>
      </TableCell>

      {/* Learning Center */}
      <LearningCenterCell learningCenterId={user.learning_center_id} />

      {/* Created */}
      <TableCell>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          {format(new Date(user.created_at), 'MMM dd, yyyy')}
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Edit className='mr-2 h-4 w-4' />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleActive(user)}>
              {user.is_active ? (
                <>
                  <UserX className='mr-2 h-4 w-4' />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className='mr-2 h-4 w-4' />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(user)}
              className='text-red-600'
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

// Learning Center Cell Component 
function LearningCenterCell({ learningCenterId }: { learningCenterId: number }) {
  const { data: learningCenters = [] } = useQuery({
    queryKey: ['learning-centers'],
    queryFn: () => learningCentersApi.list(),
  })

  const center = (learningCenters as any[]).find((c: any) => c.id === learningCenterId)

  return (
    <TableCell className='max-w-[200px]'>
      {center ? (
        <div className='flex items-center gap-3'>
          <Avatar className='h-8 w-8'>
            <AvatarImage
              src={getLogoUrl(center.logo || null)}
              alt={center.name}
            />
            <AvatarFallback>
              <Building className='h-4 w-4' />
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1'>
            <div className='font-medium text-sm truncate' title={center.name}>
              {center.name}
            </div>
            <div className='text-sm text-muted-foreground'>
              ID: {center.id}
            </div>
          </div>
        </div>
      ) : (
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Building className='h-4 w-4' />
          <span>Center #{learningCenterId}</span>
        </div>
      )}
    </TableCell>
  )
}
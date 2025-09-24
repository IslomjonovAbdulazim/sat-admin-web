import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MoreHorizontal,
  Edit,
  Upload,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { learningCentersApi, type LearningCenter } from '@/lib/learning-centers-api'
import { getLogoUrl } from '@/lib/media-utils'
import { cn } from '@/lib/utils'

interface LearningCentersTableProps {
  data: LearningCenter[]
  isLoading?: boolean
  onEdit: (center: LearningCenter) => void
  onUploadLogo: (center: LearningCenter) => void
  onRefresh: () => void
}

export function LearningCentersTable({
  data,
  isLoading,
  onEdit,
  onUploadLogo,
  onRefresh,
}: LearningCentersTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCenter, setSelectedCenter] = useState<LearningCenter | null>(null)
  const queryClient = useQueryClient()

  // Toggle payment status mutation
  const togglePaymentMutation = useMutation({
    mutationFn: (id: number) => learningCentersApi.togglePayment(id),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['learning-centers'] })
      onRefresh()
    },
    onError: (error) => {
      toast.error('Failed to toggle payment status')
      // eslint-disable-next-line no-console
      console.error('Toggle payment error:', error)
    },
  })

  // Delete center mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => learningCentersApi.deactivate(id),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['learning-centers'] })
      onRefresh()
      setDeleteDialogOpen(false)
      setSelectedCenter(null)
    },
    onError: (error) => {
      toast.error('Failed to deactivate learning center')
      // eslint-disable-next-line no-console
      console.error('Delete error:', error)
    },
  })

  const handleTogglePayment = (center: LearningCenter) => {
    togglePaymentMutation.mutate(center.id)
  }

  const handleDelete = (center: LearningCenter) => {
    setSelectedCenter(center)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedCenter) {
      deleteMutation.mutate(selectedCenter.id)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Learning Centers</CardTitle>
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
          <CardTitle>Learning Centers</CardTitle>
          <CardDescription>No learning centers found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-8'>
            <Building2 className='h-12 w-12 text-muted-foreground mb-4' />
            <p className='text-muted-foreground text-center'>
              No learning centers have been created yet.
              <br />
              Click "Add Learning Center" to get started.
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
                <Building2 className='h-5 w-5 text-primary' />
                Learning Centers ({data.length})
              </CardTitle>
              <CardDescription className='mt-1'>
                Comprehensive management of educational institutions
              </CardDescription>
            </div>
            <div className='text-right'>
              <div className='text-sm text-muted-foreground'>Total Active</div>
              <div className='text-2xl font-bold text-primary'>
                {data.filter(c => c.is_active).length}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Center</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Limits</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className='w-[70px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((center) => (
                <TableRow key={center.id}>
                  <TableCell>
                    <div className='flex items-center space-x-3'>
                      <Avatar className='h-10 w-10'>
                        <AvatarImage
                          src={getLogoUrl(center.logo)}
                          alt={center.name}
                        />
                        <AvatarFallback>
                          <Building2 className='h-4 w-4' />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='font-medium'>{center.name}</div>
                        <div className='text-sm text-muted-foreground'>
                          ID: {center.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-sm'>{center.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-col space-y-1 text-xs'>
                      <div className='flex items-center space-x-1'>
                        <Users className='h-3 w-3' />
                        <span>{center.student_limit} students</span>
                      </div>
                      <div className='flex items-center space-x-1'>
                        <GraduationCap className='h-3 w-3' />
                        <span>{center.teacher_limit} teachers</span>
                      </div>
                      <div className='flex items-center space-x-1'>
                        <BookOpen className='h-3 w-3' />
                        <span>{center.group_limit} groups</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={center.is_active ? 'default' : 'secondary'}
                      className={cn(
                        'font-medium transition-all duration-200',
                        center.is_active
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                          : 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                      )}
                    >
                      <div className={cn(
                        'w-2 h-2 rounded-full mr-1',
                        center.is_active ? 'bg-emerald-500' : 'bg-red-500'
                      )} />
                      {center.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={center.is_paid ? 'default' : 'secondary'}
                      className={cn(
                        'font-medium transition-all duration-200',
                        center.is_paid
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                      )}
                    >
                      <div className={cn(
                        'w-2 h-2 rounded-full mr-1',
                        center.is_paid ? 'bg-blue-500' : 'bg-amber-500'
                      )} />
                      {center.is_paid ? 'Paid Plan' : 'Free Plan'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className='text-sm text-muted-foreground'>
                      {new Date(center.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => onEdit(center)}>
                          <Edit className='mr-2 h-4 w-4' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUploadLogo(center)}>
                          <Upload className='mr-2 h-4 w-4' />
                          Upload Logo
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleTogglePayment(center)}
                          disabled={togglePaymentMutation.isPending}
                        >
                          {center.is_paid ? (
                            <ToggleLeft className='mr-2 h-4 w-4' />
                          ) : (
                            <ToggleRight className='mr-2 h-4 w-4' />
                          )}
                          {center.is_paid ? 'Make Free' : 'Make Paid'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(center)}
                          className='text-red-600'
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title='Deactivate Learning Center'
        desc={`Are you sure you want to deactivate "${selectedCenter?.name}"? This action cannot be undone.`}
        confirmText='Deactivate'
        handleConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}
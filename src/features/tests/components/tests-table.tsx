import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MoreHorizontal, Edit, Trash2, Eye, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { testsApi, type Test } from '@/lib/tests-api'

interface TestsGridProps {
  data: Test[]
  isLoading: boolean
  onEdit: (test: Test) => void
  onViewModules: (test: Test) => void
  onRefresh: () => void
}

export function TestsGrid({ 
  data, 
  isLoading, 
  onEdit, 
  onViewModules, 
  onRefresh 
}: TestsGridProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testToDelete, setTestToDelete] = useState<Test | null>(null)
  const queryClient = useQueryClient()

  const deleteTestMutation = useMutation({
    mutationFn: (id: number) => testsApi.delete(id),
    onSuccess: (_, testId) => {
      const testTitle = data.find(t => t.id === testId)?.title || 'Test'
      toast.success(`${testTitle} deleted successfully`)
      queryClient.invalidateQueries({ queryKey: ['tests'] })
      setDeleteDialogOpen(false)
      setTestToDelete(null)
      onRefresh()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to delete test. Please try again.'
      toast.error(errorMessage)
    },
  })


  const handleDeleteClick = (test: Test) => {
    setTestToDelete(test)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (testToDelete) {
      deleteTestMutation.mutate(testToDelete.id)
    }
  }


  if (isLoading) {
    return (
      <div className='text-center py-12'>
        <div className='text-muted-foreground'>Loading tests...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='text-muted-foreground mb-4'>No tests found.</div>
        <Button onClick={onRefresh}>
          <Plus className='mr-2 h-4 w-4' />
          Create Your First Test
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Tests Grid */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {data.map((test) => (
          <div
            key={test.id}
            className='border rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-card'
          >
            <div className='flex items-start justify-between mb-4'>
              <div className='space-y-2 flex-1'>
                <h3 className='font-semibold text-lg'>{test.title}</h3>
                <div className='flex items-center gap-2'>
                  <Badge variant='default'>
                    Active
                  </Badge>
                  <Badge variant='outline'>
                    ID #{test.id}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' className='h-8 w-8 p-0'>
                    <span className='sr-only'>Open menu</span>
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem
                    onClick={() => onViewModules(test)}
                  >
                    <Eye className='mr-2 h-4 w-4' />
                    View Modules
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onEdit(test)}
                  >
                    <Edit className='mr-2 h-4 w-4' />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(test)}
                    className='text-destructive'
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className='space-y-3 mb-6'>
              <div className='text-sm text-muted-foreground'>
                SAT Practice Test for comprehensive assessment and preparation
              </div>
            </div>

            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='flex-1'
                onClick={() => onViewModules(test)}
              >
                View Modules
              </Button>
              <Button 
                variant='outline' 
                size='sm'
                onClick={() => onEdit(test)}
              >
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{testToDelete?.title}"? This will perform a soft delete and the test can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTestMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteTestMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteTestMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
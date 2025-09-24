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
import { modulesApi, type Module } from '@/lib/modules-api'

interface ModulesGridProps {
  data: Module[]
  tests: { id: number; title: string }[]
  isLoading: boolean
  onEdit: (module: Module) => void
  onViewQuestions: (module: Module) => void
  onRefresh: () => void
}

export function ModulesGrid({ 
  data, 
  tests,
  isLoading, 
  onEdit, 
  onViewQuestions, 
  onRefresh 
}: ModulesGridProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null)
  const queryClient = useQueryClient()

  const deleteModuleMutation = useMutation({
    mutationFn: (id: number) => modulesApi.delete(id),
    onSuccess: (_, moduleId) => {
      const moduleTitle = data.find(m => m.id === moduleId)?.title || 'Module'
      toast.success(`${moduleTitle} deleted successfully`)
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      queryClient.invalidateQueries({ queryKey: ['test-modules'] })
      setDeleteDialogOpen(false)
      setModuleToDelete(null)
      onRefresh()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to delete module. Please try again.'
      toast.error(errorMessage)
    },
  })

  const handleDeleteClick = (module: Module) => {
    setModuleToDelete(module)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (moduleToDelete) {
      deleteModuleMutation.mutate(moduleToDelete.id)
    }
  }

  const getTestTitle = (testId: number) => {
    return tests.find(t => t.id === testId)?.title || `Test #${testId}`
  }

  if (isLoading) {
    return (
      <div className='text-center py-12'>
        <div className='text-muted-foreground'>Loading modules...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='text-muted-foreground mb-4'>No modules found.</div>
        <Button onClick={onRefresh}>
          <Plus className='mr-2 h-4 w-4' />
          Create Your First Module
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Modules Grid */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {data.map((module) => (
          <div
            key={module.id}
            className='border rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-card'
          >
            <div className='flex items-start justify-between mb-4'>
              <div className='space-y-2 flex-1'>
                <h3 className='font-semibold text-lg'>{module.title}</h3>
                <p className='text-sm text-muted-foreground'>{getTestTitle(module.test_id)}</p>
                <div className='flex items-center gap-2'>
                  <Badge variant='default'>
                    Active
                  </Badge>
                  <Badge variant='outline'>
                    Position {module.position}
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
                    onClick={() => onViewQuestions(module)}
                  >
                    <Eye className='mr-2 h-4 w-4' />
                    View Questions
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onEdit(module)}
                  >
                    <Edit className='mr-2 h-4 w-4' />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(module)}
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
                Module containing questions for {module.title.toLowerCase()} section of the SAT test
              </div>
            </div>

            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='flex-1'
                onClick={() => onViewQuestions(module)}
              >
                View Questions
              </Button>
              <Button 
                variant='outline' 
                size='sm'
                onClick={() => onEdit(module)}
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
            <AlertDialogTitle>Delete Module</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{moduleToDelete?.title}"? This will perform a soft delete and the module can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteModuleMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteModuleMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteModuleMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
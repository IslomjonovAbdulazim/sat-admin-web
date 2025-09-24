import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MoreHorizontal, Edit, Trash2, Eye, Plus, FileText } from 'lucide-react'
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
import { questionsApi, type Question } from '@/lib/questions-api'

interface QuestionsListProps {
  data: Question[]
  modules: { id: number; title: string }[]
  isLoading: boolean
  onEdit: (question: Question) => void
  onRefresh: () => void
}

export function QuestionsList({ 
  data, 
  modules,
  isLoading, 
  onEdit, 
  onRefresh 
}: QuestionsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null)
  const queryClient = useQueryClient()

  const deleteQuestionMutation = useMutation({
    mutationFn: (id: number) => questionsApi.delete(id),
    onSuccess: (_, questionId) => {
      const questionTitle = data.find(q => q.id === questionId)?.title || 'Question'
      toast.success(`${questionTitle} deleted successfully`)
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      queryClient.invalidateQueries({ queryKey: ['module-questions'] })
      setDeleteDialogOpen(false)
      setQuestionToDelete(null)
      onRefresh()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to delete question. Please try again.'
      toast.error(errorMessage)
    },
  })

  const handleDeleteClick = (question: Question) => {
    setQuestionToDelete(question)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (questionToDelete) {
      deleteQuestionMutation.mutate(questionToDelete.id)
    }
  }

  const getTypeLabel = (type: 'mcq' | 'fill_blank') => {
    return type === 'mcq' ? 'Multiple Choice' : 'Fill in the Blank'
  }

  const getTypeBadgeColor = (type: 'mcq' | 'fill_blank') => {
    return type === 'mcq' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
  }

  const getModuleTitle = (moduleId: number) => {
    return modules.find(m => m.id === moduleId)?.title || `Module #${moduleId}`
  }

  if (isLoading) {
    return (
      <div className='text-center py-12'>
        <div className='text-muted-foreground'>Loading questions...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className='text-center py-12'>
        <FileText className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
        <div className='text-muted-foreground mb-4'>No questions found.</div>
        <p className='text-sm text-muted-foreground mb-4'>
          Select a module from the filter above to view its questions or create your first question.
        </p>
        <Button onClick={onRefresh}>
          <Plus className='mr-2 h-4 w-4' />
          Create Your First Question
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Questions List */}
      <div className='space-y-4'>
        {data.map((question) => (
          <div
            key={question.id}
            className='border rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-card'
          >
            <div className='flex items-start justify-between mb-4'>
              <div className='space-y-2 flex-1'>
                <div className='flex items-center gap-3'>
                  <h3 className='font-semibold text-lg'>{question.title}</h3>
                  <Badge variant='outline' className={getTypeBadgeColor(question.type)}>
                    {getTypeLabel(question.type)}
                  </Badge>
                  <Badge variant='default'>
                    Active
                  </Badge>
                </div>
                <p className='text-sm text-muted-foreground'>
                  {question.module?.title || getModuleTitle(question.module?.id || 0)}
                </p>
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
                    onClick={() => {/* TODO: Preview question */}}
                  >
                    <Eye className='mr-2 h-4 w-4' />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onEdit(question)}
                  >
                    <Edit className='mr-2 h-4 w-4' />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(question)}
                    className='text-destructive'
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4'>
              <div className='space-y-1'>
                <span className='text-muted-foreground'>Position:</span>
                <div className='font-medium'>{question.position}</div>
              </div>
              <div className='space-y-1'>
                <span className='text-muted-foreground'>Answer(s):</span>
                <div className='font-medium'>{question.answer.join(', ')}</div>
              </div>
              <div className='space-y-1'>
                <span className='text-muted-foreground'>Type:</span>
                <div className='font-medium'>{getTypeLabel(question.type)}</div>
              </div>
              <div className='space-y-1'>
                <span className='text-muted-foreground'>Choices:</span>
                <div className='font-medium'>
                  {question.type === 'mcq' ? (question.choices?.length || 0) : 'N/A'}
                </div>
              </div>
            </div>

            {/* Content Preview */}
            <div className='bg-muted/50 rounded-lg p-4 mb-4'>
              <h4 className='text-sm font-medium mb-2'>Content Preview:</h4>
              <div className='text-sm text-muted-foreground line-clamp-3'>
                {question.content_markdown.replace(/\*\*/g, '').replace(/\n/g, ' ')}
              </div>
            </div>

            {/* MCQ Choices Preview */}
            {question.type === 'mcq' && question.choices && question.choices.length > 0 && (
              <div className='mb-4'>
                <h4 className='text-sm font-medium mb-2'>Choices:</h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                  {question.choices.slice(0, 4).map((choice, index) => (
                    <div key={index} className='flex items-center gap-2 text-sm'>
                      <Badge variant='outline' className='w-8 justify-center'>
                        {choice.label}
                      </Badge>
                      <span className='text-muted-foreground line-clamp-1'>
                        {choice.content_markdown.replace(/\*\*/g, '')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {/* TODO: Preview question */}}
              >
                <Eye className='mr-2 h-4 w-4' />
                Preview
              </Button>
              <Button 
                variant='outline' 
                size='sm'
                onClick={() => onEdit(question)}
              >
                <Edit className='mr-2 h-4 w-4' />
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
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{questionToDelete?.title}"? This will perform a soft delete and the question can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteQuestionMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteQuestionMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteQuestionMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
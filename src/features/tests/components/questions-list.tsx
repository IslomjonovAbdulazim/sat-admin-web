import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MoreHorizontal, Edit, Trash2, Eye, Plus, FileText, X } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [questionToPreview, setQuestionToPreview] = useState<Question | null>(null)
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

  const handlePreview = (question: Question) => {
    setQuestionToPreview(question)
    setPreviewDialogOpen(true)
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

  const renderMarkdown = (markdown: string) => {
    return markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
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
      {/* Questions Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {data.map((question) => (
          <div
            key={question.id}
            className='border rounded-lg p-3 hover:shadow-md transition-all duration-200 bg-card flex flex-col'
          >
            {/* Header */}
            <div className='flex items-start justify-between mb-2'>
              <div className='flex-1'>
                <h3 className='font-semibold text-sm line-clamp-2 mb-1'>{question.title}</h3>
                <div className='flex items-center gap-1'>
                  <Badge variant='outline' className={`${getTypeBadgeColor(question.type)} text-xs px-1 py-0 h-4`}>
                    {question.type === 'mcq' ? 'MCQ' : 'Fill'}
                  </Badge>
                  <Badge variant='default' className='text-xs px-1 py-0 h-4'>Active</Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' className='h-6 w-6 p-0 ml-1'>
                    <MoreHorizontal className='h-3 w-3' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={() => handlePreview(question)}>
                    <Eye className='mr-2 h-4 w-4' />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(question)}>
                    <Edit className='mr-2 h-4 w-4' />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDeleteClick(question)} className='text-destructive'>
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className='text-xs text-muted-foreground mb-2 truncate'>
              {question.module?.title || getModuleTitle(question.module?.id || 0)}
            </p>

            {/* Info Grid */}
            <div className='grid grid-cols-2 gap-1 text-xs mb-2 bg-muted/20 p-2 rounded'>
              <div className='flex justify-between'><span className='text-muted-foreground'>Pos:</span> <span className='font-medium'>{question.position}</span></div>
              <div className='flex justify-between'><span className='text-muted-foreground'>Choices:</span> <span className='font-medium'>{question.type === 'mcq' ? (question.choices?.length || 0) : 'N/A'}</span></div>
            </div>

            {/* Answer */}
            <div className='text-xs mb-2'>
              <span className='text-muted-foreground'>Answer: </span>
              <span className='font-medium'>{question.answer.join(', ')}</span>
            </div>

            {/* Content Preview */}
            <div className='bg-muted/30 rounded p-2 mb-2 flex-1'>
              <div className='text-xs text-muted-foreground line-clamp-2'>
                {question.content_markdown.replace(/\*\*/g, '').replace(/\n/g, ' ')}
              </div>
            </div>

            {/* MCQ Choices */}
            {question.type === 'mcq' && question.choices && question.choices.length > 0 && (
              <div className='mb-2'>
                <div className='text-xs font-medium mb-1'>Choices:</div>
                <div className='space-y-1'>
                  {question.choices.slice(0, 2).map((choice, index) => (
                    <div key={index} className='flex items-center gap-1 text-xs'>
                      <Badge variant='outline' className='w-3 h-3 text-xs p-0 justify-center'>{choice.label}</Badge>
                      <span className='text-muted-foreground truncate'>
                        {choice.content_markdown.replace(/\*\*/g, '')}
                      </span>
                    </div>
                  ))}
                  {question.choices.length > 2 && (
                    <div className='text-xs text-muted-foreground'>+{question.choices.length - 2} more...</div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className='flex gap-1 mt-auto'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePreview(question)}
                className='h-6 text-xs px-2 flex-1'
              >
                <Eye className='mr-1 h-3 w-3' />Preview
              </Button>
              <Button 
                variant='outline' 
                size='sm'
                onClick={() => onEdit(question)}
                className='h-6 text-xs px-2 flex-1'
              >
                <Edit className='mr-1 h-3 w-3' />Edit
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

      {/* Question Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">Question Preview</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewDialogOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {questionToPreview && (
            <div className="space-y-6 mt-4">
              {/* Question Header */}
              <div className="border-b pb-4">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-lg font-medium">{questionToPreview.title}</h2>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={`${getTypeBadgeColor(questionToPreview.type)}`}>
                      {getTypeLabel(questionToPreview.type)}
                    </Badge>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Module: {questionToPreview.module?.title || getModuleTitle(questionToPreview.module?.id || 0)} | 
                  Position: {questionToPreview.position}
                </div>
              </div>

              {/* Question Content */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-medium mb-2">Question Content:</h3>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: renderMarkdown(questionToPreview.content_markdown) 
                  }}
                />
              </div>

              {/* MCQ Choices */}
              {questionToPreview.type === 'mcq' && questionToPreview.choices && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Answer Choices:</h3>
                  <div className="space-y-2">
                    {questionToPreview.choices.map((choice, index) => (
                      <div key={index} className="flex items-start gap-3 p-2 rounded border">
                        <Badge variant="outline" className="mt-0.5 min-w-[24px] justify-center">
                          {choice.label}
                        </Badge>
                        <div 
                          className="flex-1 text-sm"
                          dangerouslySetInnerHTML={{ 
                            __html: renderMarkdown(choice.content_markdown) 
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Correct Answer */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2">Correct Answer(s):</h3>
                <div className="text-green-700">
                  {questionToPreview.answer.join(', ')}
                </div>
              </div>

              {/* Explanation */}
              {questionToPreview.explanation_markdown && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">Explanation:</h3>
                  <div 
                    className="prose prose-sm max-w-none text-blue-700"
                    dangerouslySetInnerHTML={{ 
                      __html: renderMarkdown(questionToPreview.explanation_markdown) 
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
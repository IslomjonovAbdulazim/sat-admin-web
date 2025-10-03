import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { Plus, Minus, Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { questionsApi, type CreateQuestionRequest } from '@/lib/questions-api'
import { modulesApi } from '@/lib/modules-api'

const choiceSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  content_markdown: z.string().min(1, 'Content is required'),
})

const createQuestionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  type: z.enum(['mcq', 'fill_blank']),
  content_markdown: z.string().min(1, 'Content is required').max(5000, 'Content must be less than 5000 characters'),
  position: z.number().min(1, 'Position must be at least 1'),
  module_id: z.number().min(1, 'Module is required'),
  choices: z.array(choiceSchema).optional(),
  answer: z.array(z.string().min(1, 'Answer cannot be empty')).optional(),
  mcq_correct_answer: z.string().optional(),
  explanation_markdown: z.string().max(2000, 'Explanation must be less than 2000 characters').optional(),
})

type CreateQuestionFormData = z.infer<typeof createQuestionSchema>

interface CreateQuestionDialogProps {
  children?: React.ReactNode
  defaultModuleId?: number
  onSuccess?: () => void
}

export function CreateQuestionDialog({ children, defaultModuleId, onSuccess }: CreateQuestionDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateQuestionFormData>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: {
      position: 1,
      type: 'mcq',
      module_id: defaultModuleId || undefined,
      choices: [
        { label: 'A', content_markdown: '' },
        { label: 'B', content_markdown: '' },
        { label: 'C', content_markdown: '' },
        { label: 'D', content_markdown: '' },
      ],
      answer: [],
      mcq_correct_answer: 'A',
    }
  })


  // For managing answers for fill_blank questions
  const [answers, setAnswers] = useState<string[]>([''])
  // For managing MCQ correct answer
  const [mcqCorrectAnswer, setMcqCorrectAnswer] = useState<string>('A')
  
  // For managing preview dialogs
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')

  const watchType = watch('type')
  
  // Reset answers/choices when type changes
  useEffect(() => {
    if (watchType === 'fill_blank') {
      console.log('Switching to fill_blank type')
      setAnswers([''])
      setValue('answer', [''])
      setValue('choices', [])  // Clear choices for fill_blank
    } else if (watchType === 'mcq') {
      console.log('Switching to mcq type')
      setMcqCorrectAnswer('A')
      setValue('mcq_correct_answer', 'A')
      setValue('choices', [
        { label: 'A', content_markdown: '' },
        { label: 'B', content_markdown: '' },
        { label: 'C', content_markdown: '' },
        { label: 'D', content_markdown: '' },
      ])
    }
  }, [watchType, setValue])
  
  // Function to show preview
  const showPreview = (content: string, title: string) => {
    setPreviewContent(content)
    setPreviewTitle(title)
    setPreviewOpen(true)
  }

  // Fetch all modules for the dropdown
  const { data: modules = [] } = useQuery({
    queryKey: ['modules'],
    queryFn: () => modulesApi.list(),
  })

  // Set default module if provided
  useEffect(() => {
    if (defaultModuleId) {
      setValue('module_id', defaultModuleId)
    }
  }, [defaultModuleId, setValue])

  const createQuestionMutation = useMutation({
    mutationFn: (data: CreateQuestionRequest) => questionsApi.create(data),
    onSuccess: (newQuestion) => {
      toast.success(`Question "${newQuestion.title}" created successfully!`)
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      queryClient.invalidateQueries({ queryKey: ['module-questions'] })
      setOpen(false)
      setAnswers([''])
      setMcqCorrectAnswer('A')
      reset({
        position: 1,
        type: 'mcq',
        module_id: defaultModuleId || undefined,
        choices: [
          { label: 'A', content_markdown: '' },
          { label: 'B', content_markdown: '' },
          { label: 'C', content_markdown: '' },
          { label: 'D', content_markdown: '' },
        ],
        answer: [],
        mcq_correct_answer: 'A',
      })
      onSuccess?.()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to create question. Please try again.'
      toast.error(errorMessage)
    },
  })

  const onSubmit = (data: CreateQuestionFormData) => {
    console.log('Form submission data:', data)
    console.log('Current answers state:', answers)
    console.log('Current mcqCorrectAnswer:', mcqCorrectAnswer)
    
    // Validate MCQ questions
    if (data.type === 'mcq') {
      if (!mcqCorrectAnswer) {
        toast.error('Please select the correct answer for the multiple choice question')
        return
      }
      // Check if all choices have content
      const choices = data.choices || []
      if (choices.length !== 4 || choices.some(choice => !choice.content_markdown.trim())) {
        toast.error('Please fill in all 4 choice options (A, B, C, D)')
        return
      }
    }

    // Validate fill-blank questions
    if (data.type === 'fill_blank') {
      const validAnswers = answers.filter(answer => answer.trim())
      console.log('Valid fill-blank answers:', validAnswers)
      if (validAnswers.length === 0) {
        toast.error('Please provide at least one answer for the fill-in-the-blank question')
        return
      }
    }

    const payload: CreateQuestionRequest = {
      ...data,
      answer: data.type === 'mcq' ? [mcqCorrectAnswer] : answers.filter(a => a.trim()),
      choices: data.type === 'mcq' ? data.choices || [] : null,
    }
    
    console.log('Final payload:', payload)
    createQuestionMutation.mutate(payload)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setAnswers([''])
      setMcqCorrectAnswer('A')
      reset({
        position: 1,
        type: 'mcq',
        module_id: defaultModuleId || undefined,
        choices: [
          { label: 'A', content_markdown: '' },
          { label: 'B', content_markdown: '' },
          { label: 'C', content_markdown: '' },
          { label: 'D', content_markdown: '' },
        ],
        answer: [],
        mcq_correct_answer: 'A',
      })
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className='sm:max-w-xl max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle>Create New Question</DialogTitle>
            <div className='flex items-center gap-2'>
              <Label className='text-sm font-medium'>Module:</Label>
              <Select
                value={watch('module_id')?.toString()}
                onValueChange={(value) => setValue('module_id', parseInt(value))}
                disabled={createQuestionMutation.isPending || !!defaultModuleId}
              >
                <SelectTrigger className='w-[200px]'>
                  <SelectValue placeholder='Select module' />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={module.id.toString()}>
                      {module.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogDescription>
            Create a new question within a module. Choose between multiple choice or fill-in-the-blank formats.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-3'>
          <div className='grid grid-cols-6 gap-2'>
            <div className='col-span-3 space-y-1'>
              <Label htmlFor='title' className='text-sm'>Title</Label>
              <Input
                id='title'
                placeholder='Question title'
                {...register('title')}
                className='h-8 text-sm'
                disabled={createQuestionMutation.isPending}
              />
              {errors.title && (
                <p className='text-xs text-destructive'>{errors.title.message}</p>
              )}
            </div>

            <div className='col-span-2 space-y-1'>
              <Label htmlFor='type' className='text-sm'>Type</Label>
              <Select
                value={watchType}
                onValueChange={(value: 'mcq' | 'fill_blank') => setValue('type', value)}
                disabled={createQuestionMutation.isPending}
              >
                <SelectTrigger className='h-8 text-sm'>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='mcq'>Multiple Choice</SelectItem>
                  <SelectItem value='fill_blank'>Fill in the Blank</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className='text-xs text-destructive'>{errors.type.message}</p>
              )}
            </div>

            <div className='col-span-1 space-y-1'>
              <Label htmlFor='position' className='text-sm'>Pos</Label>
              <Input
                id='position'
                type='number'
                min='1'
                placeholder='1'
                {...register('position', { valueAsNumber: true })}
                disabled={createQuestionMutation.isPending}
                className='text-center h-8 text-sm'
              />
              {errors.position && (
                <p className='text-xs text-destructive'>{errors.position.message}</p>
              )}
            </div>
          </div>

          {errors.module_id && (
            <p className='text-xs text-destructive'>{errors.module_id.message}</p>
          )}

          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <Label htmlFor='content_markdown' className='text-sm'>Question Content</Label>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => showPreview(watch('content_markdown') || '', 'Question Content Preview')}
                disabled={createQuestionMutation.isPending}
                className='h-6 w-6 p-0'
              >
                <Eye className='h-3 w-3' />
              </Button>
            </div>
            <Textarea
              id='content_markdown'
              placeholder='**Choose the best answer:** Which sentence is correct?'
              rows={2}
              {...register('content_markdown')}
              disabled={createQuestionMutation.isPending}
              className='text-sm'
            />
            {errors.content_markdown && (
              <p className='text-xs text-destructive'>{errors.content_markdown.message}</p>
            )}
          </div>

          {watchType === 'mcq' && (
            <div className='space-y-1'>
              <Label className='text-sm'>Choices (Select correct)</Label>
              <RadioGroup
                value={mcqCorrectAnswer}
                onValueChange={setMcqCorrectAnswer}
                disabled={createQuestionMutation.isPending}
                className='space-y-1'
              >
                {['A', 'B', 'C', 'D'].map((label, index) => {
                  setValue(`choices.${index}.label`, label)
                  return (
                    <div key={index} className='flex gap-1 items-center'>
                      <RadioGroupItem value={label} id={`choice-${label}`} className='h-3 w-3' />
                      <div className='w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium'>
                        {label}
                      </div>
                      <Input
                        placeholder={`Choice ${label}`}
                        {...register(`choices.${index}.content_markdown`)}
                        className='flex-1 h-7 text-sm'
                        disabled={createQuestionMutation.isPending}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => showPreview(watch(`choices.${index}.content_markdown`) || '', `Choice ${label} Preview`)}
                        disabled={createQuestionMutation.isPending}
                        className='h-6 w-6 p-0'
                      >
                        <Eye className='h-2 w-2' />
                      </Button>
                    </div>
                  )
                })}
              </RadioGroup>
              {errors.choices && (
                <p className='text-xs text-destructive'>{errors.choices.message}</p>
              )}
            </div>
          )}

          {watchType === 'fill_blank' && (
            <div className='space-y-1'>
              <div className='flex items-center justify-between'>
                <Label className='text-sm'>Answers</Label>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setAnswers([...answers, ''])}
                  disabled={createQuestionMutation.isPending}
                  className='h-6 text-xs'
                >
                  <Plus className='h-3 w-3 mr-1' />
                  Add
                </Button>
              </div>
              <div className='space-y-1'>
                {answers.map((answer, index) => (
                  <div key={index} className='flex gap-1'>
                    <Input
                      placeholder='Answer'
                      value={answer}
                      onChange={(e) => {
                        const newAnswers = [...answers]
                        newAnswers[index] = e.target.value
                        setAnswers(newAnswers)
                        setValue('answer', newAnswers)
                      }}
                      className='flex-1 h-7 text-sm'
                      disabled={createQuestionMutation.isPending}
                    />
                    {answers.length > 1 && (
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          const newAnswers = answers.filter((_, i) => i !== index)
                          setAnswers(newAnswers)
                          setValue('answer', newAnswers)
                        }}
                        disabled={createQuestionMutation.isPending}
                        className='h-7 w-7 p-0'
                      >
                        <Minus className='h-3 w-3' />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {errors.answer && (
                <p className='text-xs text-destructive'>{errors.answer.message}</p>
              )}
            </div>
          )}

          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <Label htmlFor='explanation_markdown' className='text-sm'>Explanation</Label>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => showPreview(watch('explanation_markdown') || '', 'Explanation Preview')}
                disabled={createQuestionMutation.isPending}
                className='h-6 w-6 p-0'
              >
                <Eye className='h-3 w-3' />
              </Button>
            </div>
            <Textarea
              id='explanation_markdown'
              placeholder='The correct answer is A because...'
              rows={2}
              {...register('explanation_markdown')}
              disabled={createQuestionMutation.isPending}
              className='text-sm'
            />
            {errors.explanation_markdown && (
              <p className='text-xs text-destructive'>{errors.explanation_markdown.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={createQuestionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={createQuestionMutation.isPending}
            >
              {createQuestionMutation.isPending ? 'Creating...' : 'Create Question'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Markdown Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className='sm:max-w-lg max-h-[70vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-lg'>{previewTitle}</DialogTitle>
          </DialogHeader>
          <div className='space-y-2'>
            <div className='p-2 bg-muted rounded'>
              <h4 className='text-xs font-medium mb-1'>Raw:</h4>
              <pre className='text-xs whitespace-pre-wrap font-mono bg-background p-2 rounded border max-h-20 overflow-y-auto'>
                {previewContent || 'No content'}
              </pre>
            </div>
            <div className='p-2 bg-muted rounded'>
              <h4 className='text-xs font-medium mb-1'>Preview:</h4>
              <div className='prose prose-xs max-w-none bg-background p-2 rounded border text-sm'>
                <div dangerouslySetInnerHTML={{ 
                  __html: previewContent
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/\n/g, '<br>')
                    .replace(/^(.*)$/, '<p>$1</p>')
                }} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
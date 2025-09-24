import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { Plus, Minus } from 'lucide-react'
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
  answer: z.array(z.string().min(1, 'Answer cannot be empty')).min(1, 'At least one answer is required'),
  explanation_markdown: z.string().max(2000, 'Explanation must be less than 2000 characters').optional(),
}).refine((data) => {
  // If type is 'mcq', choices are required
  if (data.type === 'mcq' && (!data.choices || data.choices.length === 0)) {
    return false
  }
  return true
}, {
  message: 'Multiple choice questions require choices',
  path: ['choices']
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
    control,
  } = useForm<CreateQuestionFormData>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: {
      position: 1,
      module_id: defaultModuleId || undefined,
      choices: [
        { label: 'A', content_markdown: '' },
        { label: 'B', content_markdown: '' },
        { label: 'C', content_markdown: '' },
        { label: 'D', content_markdown: '' },
      ],
      answer: [''],
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'choices',
  })

  // For managing answers, we'll use state instead of useFieldArray since answers are string primitives
  const [answers, setAnswers] = useState<string[]>([''])

  const watchType = watch('type')

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
      reset({
        position: 1,
        module_id: defaultModuleId || undefined,
        choices: [
          { label: 'A', content_markdown: '' },
          { label: 'B', content_markdown: '' },
          { label: 'C', content_markdown: '' },
          { label: 'D', content_markdown: '' },
        ],
        answer: [''],
      })
      onSuccess?.()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to create question. Please try again.'
      toast.error(errorMessage)
    },
  })

  const onSubmit = (data: CreateQuestionFormData) => {
    const payload: CreateQuestionRequest = {
      ...data,
      answer: answers, // Use the current answers state
      choices: data.type === 'mcq' ? data.choices || [] : null,
    }
    createQuestionMutation.mutate(payload)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setAnswers([''])
      reset({
        position: 1,
        module_id: defaultModuleId || undefined,
        choices: [
          { label: 'A', content_markdown: '' },
          { label: 'B', content_markdown: '' },
          { label: 'C', content_markdown: '' },
          { label: 'D', content_markdown: '' },
        ],
        answer: [''],
      })
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create New Question</DialogTitle>
          <DialogDescription>
            Create a new question within a module. Choose between multiple choice or fill-in-the-blank formats.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Question Title</Label>
              <Input
                id='title'
                placeholder='Grammar Question 1'
                {...register('title')}
                disabled={createQuestionMutation.isPending}
              />
              {errors.title && (
                <p className='text-sm text-destructive'>{errors.title.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='type'>Question Type</Label>
              <Select
                value={watchType}
                onValueChange={(value: 'mcq' | 'fill_blank') => setValue('type', value)}
                disabled={createQuestionMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select question type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='mcq'>Multiple Choice</SelectItem>
                  <SelectItem value='fill_blank'>Fill in the Blank</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className='text-sm text-destructive'>{errors.type.message}</p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='module_id'>Module</Label>
              <Select
                value={watch('module_id')?.toString()}
                onValueChange={(value) => setValue('module_id', parseInt(value))}
                disabled={createQuestionMutation.isPending || !!defaultModuleId}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a module' />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={module.id.toString()}>
                      {module.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.module_id && (
                <p className='text-sm text-destructive'>{errors.module_id.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='position'>Position</Label>
              <Input
                id='position'
                type='number'
                min='1'
                placeholder='1'
                {...register('position', { valueAsNumber: true })}
                disabled={createQuestionMutation.isPending}
              />
              {errors.position && (
                <p className='text-sm text-destructive'>{errors.position.message}</p>
              )}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='content_markdown'>Question Content (Markdown)</Label>
            <Textarea
              id='content_markdown'
              placeholder='**Choose the best answer:**\n\nWhich sentence is grammatically correct?'
              rows={4}
              {...register('content_markdown')}
              disabled={createQuestionMutation.isPending}
            />
            {errors.content_markdown && (
              <p className='text-sm text-destructive'>{errors.content_markdown.message}</p>
            )}
          </div>

          {watchType === 'mcq' && (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label>Answer Choices</Label>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => append({ label: String.fromCharCode(65 + fields.length), content_markdown: '' })}
                  disabled={createQuestionMutation.isPending}
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Add Choice
                </Button>
              </div>
              <div className='space-y-3'>
                {fields.map((field, index) => (
                  <div key={field.id} className='flex gap-2'>
                    <Input
                      placeholder='A'
                      {...register(`choices.${index}.label`)}
                      className='w-16'
                      disabled={createQuestionMutation.isPending}
                    />
                    <Input
                      placeholder='Choice content'
                      {...register(`choices.${index}.content_markdown`)}
                      className='flex-1'
                      disabled={createQuestionMutation.isPending}
                    />
                    {fields.length > 2 && (
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => remove(index)}
                        disabled={createQuestionMutation.isPending}
                      >
                        <Minus className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {errors.choices && (
                <p className='text-sm text-destructive'>{errors.choices.message}</p>
              )}
            </div>
          )}

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label>Correct Answer(s)</Label>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setAnswers([...answers, ''])}
                disabled={createQuestionMutation.isPending}
              >
                <Plus className='h-4 w-4 mr-2' />
                Add Answer
              </Button>
            </div>
            <div className='space-y-2'>
              {answers.map((answer, index) => (
                <div key={index} className='flex gap-2'>
                  <Input
                    placeholder={watchType === 'mcq' ? 'A' : '4'}
                    value={answer}
                    onChange={(e) => {
                      const newAnswers = [...answers]
                      newAnswers[index] = e.target.value
                      setAnswers(newAnswers)
                      setValue('answer', newAnswers)
                    }}
                    className='flex-1'
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
                    >
                      <Minus className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {errors.answer && (
              <p className='text-sm text-destructive'>{errors.answer.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='explanation_markdown'>Explanation (Optional)</Label>
            <Textarea
              id='explanation_markdown'
              placeholder='The correct answer is A because...'
              rows={3}
              {...register('explanation_markdown')}
              disabled={createQuestionMutation.isPending}
            />
            {errors.explanation_markdown && (
              <p className='text-sm text-destructive'>{errors.explanation_markdown.message}</p>
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
    </Dialog>
  )
}
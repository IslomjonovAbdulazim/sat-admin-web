import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Edit, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { contentApi, type Lesson } from '@/lib/content-api'
import { updateLessonSchema, type UpdateLessonData } from '../data/schema'

interface EditLessonDialogProps {
  lesson: Lesson | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditLessonDialog({ lesson, open, onOpenChange, onSuccess }: EditLessonDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<UpdateLessonData>({
    resolver: zodResolver(updateLessonSchema),
    defaultValues: {
      title: '',
      content: '',
      order: 1,
    },
  })


  // Update lesson mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateLessonData) => {
      if (!lesson) throw new Error('No lesson selected')
      return contentApi.lessons.update(lesson.id, data)
    },
    onSuccess: () => {
      toast.success('Lesson updated successfully')
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error('Failed to update lesson')
      console.error('Update lesson error:', error)
    },
  })

  // Reset form when lesson changes
  useEffect(() => {
    if (lesson) {
      form.reset({
        title: lesson.title,
        content: lesson.content,
        order: lesson.order,
      })
    }
  }, [lesson, form])

  const handleSubmit = (data: UpdateLessonData) => {
    updateMutation.mutate(data)
  }

  if (!lesson) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Edit className='h-5 w-5' />
            Edit Lesson
          </DialogTitle>
          <DialogDescription>
            Update the lesson information and content.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
            <div className='grid gap-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='md:col-span-2'>
                  <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lesson Title *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder='e.g., Greetings and Introductions' 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name='order'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order *</FormLabel>
                        <FormControl>
                          <Input 
                            type='number'
                            min='1'
                            placeholder='1'
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name='content'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Content *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Describe the lesson objectives, key concepts, and learning outcomes...'
                        className='min-h-[150px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='bg-muted/50 border rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <BookOpen className='h-4 w-4 text-muted-foreground' />
                  <span className='font-medium text-sm'>Current Course</span>
                </div>
                <div className='text-sm text-muted-foreground'>
                  {lesson.course_title || `Course ${lesson.course_id}`}
                </div>
                <div className='text-xs text-muted-foreground mt-1'>
                  Note: To move this lesson to a different course, please create a new lesson in the target course.
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={updateMutation.isPending}
                className='min-w-[100px]'
              >
                {updateMutation.isPending ? (
                  <div className='flex items-center gap-2'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    Updating...
                  </div>
                ) : (
                  'Update Lesson'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
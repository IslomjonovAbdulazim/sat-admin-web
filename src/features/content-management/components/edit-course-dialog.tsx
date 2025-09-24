import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Edit } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { contentApi, type Course } from '@/lib/content-api'
import { learningCentersApi } from '@/lib/learning-centers-api'
import { updateCourseSchema, type UpdateCourseData } from '../data/schema'

interface EditCourseDialogProps {
  course: Course | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditCourseDialog({ course, open, onOpenChange, onSuccess }: EditCourseDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<UpdateCourseData>({
    resolver: zodResolver(updateCourseSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  // Fetch learning centers for dropdown
  const { data: learningCenters, isLoading: centersLoading } = useQuery({
    queryKey: ['learning-centers'],
    queryFn: () => learningCentersApi.list(),
  })

  // Update course mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateCourseData) => {
      if (!course) throw new Error('No course selected')
      return contentApi.courses.update(course.id, data)
    },
    onSuccess: () => {
      toast.success('Course updated successfully')
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error('Failed to update course')
      console.error('Update course error:', error)
    },
  })

  // Reset form when course changes
  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title,
        description: course.description || '',
        learning_center_id: course.learning_center_id,
      })
    }
  }, [course, form])

  const handleSubmit = (data: UpdateCourseData) => {
    updateMutation.mutate(data)
  }

  if (!course) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Edit className='h-5 w-5' />
            Edit Course
          </DialogTitle>
          <DialogDescription>
            Update the course information and settings.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
            <div className='grid gap-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder='e.g., English Basics' 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Brief description of the course content and objectives...'
                        className='min-h-[100px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='learning_center_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Learning Center *</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                      disabled={centersLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a learning center' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {learningCenters?.map((center) => (
                          <SelectItem key={center.id} value={center.id.toString()}>
                            <div className='flex items-center gap-2'>
                              <div className={`w-2 h-2 rounded-full ${
                                center.is_active ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              {center.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  'Update Course'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
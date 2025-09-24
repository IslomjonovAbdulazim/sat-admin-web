import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PlusCircle, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { contentApi } from '@/lib/content-api'
import { learningCentersApi } from '@/lib/learning-centers-api'
import { createCourseSchema, type CreateCourseData } from '../data/schema'

interface CreateCourseDialogProps {
  children?: React.ReactNode
  onSuccess?: () => void
}

export function CreateCourseDialog({ children, onSuccess }: CreateCourseDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<CreateCourseData>({
    resolver: zodResolver(createCourseSchema),
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

  // Create course mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateCourseData) => contentApi.courses.create(data),
    onSuccess: () => {
      toast.success('Course created successfully')
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      form.reset()
      setOpen(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error('Failed to create course')
      console.error('Create course error:', error)
    },
  })

  const handleSubmit = (data: CreateCourseData) => {
    createMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <PlusCircle className='h-4 w-4' />
            Add Course
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Building2 className='h-5 w-5' />
            Create New Course
          </DialogTitle>
          <DialogDescription>
            Add a new course to manage lessons and educational content.
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
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={createMutation.isPending}
                className='min-w-[100px]'
              >
                {createMutation.isPending ? (
                  <div className='flex items-center gap-2'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    Creating...
                  </div>
                ) : (
                  'Create Course'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
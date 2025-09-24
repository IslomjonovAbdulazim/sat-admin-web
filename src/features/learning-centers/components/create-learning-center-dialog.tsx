import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Building2, Loader2 } from 'lucide-react'
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { learningCentersApi } from '@/lib/learning-centers-api'
import {
  createLearningCenterSchema,
  type CreateLearningCenterData,
} from '../data/schema'

interface CreateLearningCenterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateLearningCenterDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateLearningCenterDialogProps) {
  const form = useForm<CreateLearningCenterData>({
    resolver: zodResolver(createLearningCenterSchema),
    defaultValues: {
      name: '',
      phone: '',
      student_limit: 100,
      teacher_limit: 10,
      group_limit: 20,
      is_paid: true,
    },
  })

  const createMutation = useMutation({
    mutationFn: learningCentersApi.create,
    onSuccess: (data) => {
      toast.success(`Learning center "${data.name}" created successfully`)
      form.reset()
      onSuccess()
    },
    onError: (error) => {
      toast.error('Failed to create learning center')
      // eslint-disable-next-line no-console
      console.error('Create learning center error:', error)
    },
  })

  const onSubmit = (data: CreateLearningCenterData) => {
    createMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center space-x-2'>
            <Building2 className='h-5 w-5' />
            <span>Create Learning Center</span>
          </DialogTitle>
          <DialogDescription>
            Add a new learning center to the system with specified limits and
            configuration.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Center Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='ABC Learning Center'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='+998901234567'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-3 gap-3'>
              <FormField
                control={form.control}
                name='student_limit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Students</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='teacher_limit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teachers</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='group_limit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Groups</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='is_paid'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                  <div className='space-y-0.5'>
                    <FormLabel>Paid Subscription</FormLabel>
                    <FormDescription>
                      Enable paid features for this learning center
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                Create Center
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
import { useEffect } from 'react'
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
import { learningCentersApi, type LearningCenter } from '@/lib/learning-centers-api'
import {
  updateLearningCenterSchema,
  type UpdateLearningCenterData,
} from '../data/schema'

interface EditLearningCenterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  center: LearningCenter
  onSuccess: () => void
}

export function EditLearningCenterDialog({
  open,
  onOpenChange,
  center,
  onSuccess,
}: EditLearningCenterDialogProps) {
  const form = useForm<UpdateLearningCenterData>({
    resolver: zodResolver(updateLearningCenterSchema),
    defaultValues: {
      name: center.name,
      phone: center.phone,
      student_limit: center.student_limit,
      teacher_limit: center.teacher_limit,
      group_limit: center.group_limit,
      is_paid: center.is_paid,
    },
  })

  // Reset form when center changes
  useEffect(() => {
    form.reset({
      name: center.name,
      phone: center.phone,
      student_limit: center.student_limit,
      teacher_limit: center.teacher_limit,
      group_limit: center.group_limit,
      is_paid: center.is_paid,
    })
  }, [center, form])

  const updateMutation = useMutation({
    mutationFn: (data: UpdateLearningCenterData) =>
      learningCentersApi.update(center.id, data),
    onSuccess: (data) => {
      toast.success(`Learning center "${data.name}" updated successfully`)
      onSuccess()
    },
    onError: (error) => {
      toast.error('Failed to update learning center')
      // eslint-disable-next-line no-console
      console.error('Update learning center error:', error)
    },
  })

  const onSubmit = (data: UpdateLearningCenterData) => {
    updateMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center space-x-2'>
            <Building2 className='h-5 w-5' />
            <span>Edit Learning Center</span>
          </DialogTitle>
          <DialogDescription>
            Update the configuration and limits for "{center.name}".
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
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                Update Center
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
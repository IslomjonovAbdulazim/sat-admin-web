import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { testsApi, type UpdateTestRequest, type Test } from '@/lib/tests-api'

const updateTestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
})

type UpdateTestFormData = z.infer<typeof updateTestSchema>

interface EditTestDialogProps {
  test: Test | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditTestDialog({ test, open, onOpenChange, onSuccess }: EditTestDialogProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<UpdateTestFormData>({
    resolver: zodResolver(updateTestSchema),
  })

  // Update form when test changes
  useEffect(() => {
    if (test) {
      setValue('title', test.title)
    }
  }, [test, setValue])

  const updateTestMutation = useMutation({
    mutationFn: (data: UpdateTestRequest) => {
      if (!test) throw new Error('No test selected')
      return testsApi.update(test.id, data)
    },
    onSuccess: (updatedTest) => {
      toast.success(`Test "${updatedTest.title}" updated successfully!`)
      queryClient.invalidateQueries({ queryKey: ['tests'] })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to update test. Please try again.'
      toast.error(errorMessage)
    },
  })

  const onSubmit = (data: UpdateTestFormData) => {
    updateTestMutation.mutate(data)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset()
    }
    onOpenChange(newOpen)
  }

  if (!test) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit Test</DialogTitle>
          <DialogDescription>
            Update the test information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Test Title</Label>
            <Input
              id='title'
              placeholder='SAT Practice Test 1'
              {...register('title')}
              disabled={updateTestMutation.isPending}
            />
            {errors.title && (
              <p className='text-sm text-destructive'>{errors.title.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={updateTestMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={updateTestMutation.isPending}
            >
              {updateTestMutation.isPending ? 'Updating...' : 'Update Test'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
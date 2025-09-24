import { useState } from 'react'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { testsApi, type CreateTestRequest } from '@/lib/tests-api'

const createTestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
})

type CreateTestFormData = z.infer<typeof createTestSchema>

interface CreateTestDialogProps {
  children?: React.ReactNode
  onSuccess?: () => void
}

export function CreateTestDialog({ children, onSuccess }: CreateTestDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTestFormData>({
    resolver: zodResolver(createTestSchema),
  })

  const createTestMutation = useMutation({
    mutationFn: (data: CreateTestRequest) => testsApi.create(data),
    onSuccess: (newTest) => {
      toast.success(`Test "${newTest.title}" created successfully!`)
      queryClient.invalidateQueries({ queryKey: ['tests'] })
      setOpen(false)
      reset()
      onSuccess?.()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to create test. Please try again.'
      toast.error(errorMessage)
    },
  })

  const onSubmit = (data: CreateTestFormData) => {
    createTestMutation.mutate(data)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset()
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Create New Test</DialogTitle>
          <DialogDescription>
            Create a new SAT practice test. You can add modules and questions after creating the test.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Test Title</Label>
            <Input
              id='title'
              placeholder='SAT Practice Test 1'
              {...register('title')}
              disabled={createTestMutation.isPending}
            />
            {errors.title && (
              <p className='text-sm text-destructive'>{errors.title.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={createTestMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={createTestMutation.isPending}
            >
              {createTestMutation.isPending ? 'Creating...' : 'Create Test'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
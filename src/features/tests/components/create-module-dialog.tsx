import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { modulesApi, type CreateModuleRequest } from '@/lib/modules-api'
import { testsApi } from '@/lib/tests-api'

const createModuleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  position: z.number().min(1, 'Position must be at least 1'),
  test_id: z.number().min(1, 'Test is required'),
})

type CreateModuleFormData = z.infer<typeof createModuleSchema>

interface CreateModuleDialogProps {
  children?: React.ReactNode
  defaultTestId?: number
  onSuccess?: () => void
}

export function CreateModuleDialog({ children, defaultTestId, onSuccess }: CreateModuleDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateModuleFormData>({
    resolver: zodResolver(createModuleSchema),
    defaultValues: {
      position: 1,
      test_id: defaultTestId || undefined,
    }
  })

  // Fetch all tests for the dropdown
  const { data: tests = [] } = useQuery({
    queryKey: ['tests'],
    queryFn: () => testsApi.list(),
  })

  // Set default test if provided
  useEffect(() => {
    if (defaultTestId) {
      setValue('test_id', defaultTestId)
    }
  }, [defaultTestId, setValue])

  const createModuleMutation = useMutation({
    mutationFn: (data: CreateModuleRequest) => modulesApi.create(data),
    onSuccess: (newModule) => {
      toast.success(`Module "${newModule.title}" created successfully!`)
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      queryClient.invalidateQueries({ queryKey: ['test-modules'] })
      setOpen(false)
      reset()
      onSuccess?.()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to create module. Please try again.'
      toast.error(errorMessage)
    },
  })

  const onSubmit = (data: CreateModuleFormData) => {
    createModuleMutation.mutate(data)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset({
        position: 1,
        test_id: defaultTestId || undefined,
      })
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
          <DialogTitle>Create New Module</DialogTitle>
          <DialogDescription>
            Create a new module within a test. Modules organize questions by subject (e.g., Reading & Writing, Math).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Module Title</Label>
            <Input
              id='title'
              placeholder='Reading and Writing'
              {...register('title')}
              disabled={createModuleMutation.isPending}
            />
            {errors.title && (
              <p className='text-sm text-destructive'>{errors.title.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='test_id'>Test</Label>
            <Select
              value={watch('test_id')?.toString()}
              onValueChange={(value) => setValue('test_id', parseInt(value))}
              disabled={createModuleMutation.isPending || !!defaultTestId}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a test' />
              </SelectTrigger>
              <SelectContent>
                {tests.map((test) => (
                  <SelectItem key={test.id} value={test.id.toString()}>
                    {test.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.test_id && (
              <p className='text-sm text-destructive'>{errors.test_id.message}</p>
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
              disabled={createModuleMutation.isPending}
            />
            {errors.position && (
              <p className='text-sm text-destructive'>{errors.position.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={createModuleMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={createModuleMutation.isPending}
            >
              {createModuleMutation.isPending ? 'Creating...' : 'Create Module'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
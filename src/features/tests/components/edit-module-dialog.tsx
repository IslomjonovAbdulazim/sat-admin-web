import { useEffect } from 'react'
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
import { modulesApi, type UpdateModuleRequest, type Module } from '@/lib/modules-api'
import { testsApi } from '@/lib/tests-api'

const updateModuleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  position: z.number().min(1, 'Position must be at least 1'),
  test_id: z.number().min(1, 'Test is required'),
})

type UpdateModuleFormData = z.infer<typeof updateModuleSchema>

interface EditModuleDialogProps {
  module: Module | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditModuleDialog({ module, open, onOpenChange, onSuccess }: EditModuleDialogProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateModuleFormData>({
    resolver: zodResolver(updateModuleSchema),
  })

  // Fetch all tests for the dropdown
  const { data: tests = [] } = useQuery({
    queryKey: ['tests'],
    queryFn: () => testsApi.list(),
  })

  // Update form when module changes
  useEffect(() => {
    if (module) {
      setValue('title', module.title)
      setValue('position', module.position)
      setValue('test_id', module.test_id)
    }
  }, [module, setValue])

  const updateModuleMutation = useMutation({
    mutationFn: (data: UpdateModuleRequest) => {
      if (!module) throw new Error('No module selected')
      return modulesApi.update(module.id, data)
    },
    onSuccess: (updatedModule) => {
      toast.success(`Module "${updatedModule.title}" updated successfully!`)
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      queryClient.invalidateQueries({ queryKey: ['test-modules'] })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to update module. Please try again.'
      toast.error(errorMessage)
    },
  })

  const onSubmit = (data: UpdateModuleFormData) => {
    updateModuleMutation.mutate(data)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset()
    }
    onOpenChange(newOpen)
  }

  if (!module) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit Module</DialogTitle>
          <DialogDescription>
            Update the module information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Module Title</Label>
            <Input
              id='title'
              placeholder='Reading and Writing'
              {...register('title')}
              disabled={updateModuleMutation.isPending}
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
              disabled={updateModuleMutation.isPending}
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
              disabled={updateModuleMutation.isPending}
            />
            {errors.position && (
              <p className='text-sm text-destructive'>{errors.position.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={updateModuleMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={updateModuleMutation.isPending}
            >
              {updateModuleMutation.isPending ? 'Updating...' : 'Update Module'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
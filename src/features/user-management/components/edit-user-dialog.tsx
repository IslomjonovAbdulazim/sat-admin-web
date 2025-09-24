import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Edit, Loader2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usersApi, type User } from '@/lib/users-api'
import { learningCentersApi } from '@/lib/learning-centers-api'
import { updateUserSchema, roleConfig, type UpdateUserData } from '../data/schema'
import { toast } from 'sonner'

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  onSuccess: () => void
}

export function EditUserDialog({ open, onOpenChange, user, onSuccess }: EditUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  // Fetch learning centers for the dropdown
  const { data: learningCenters = [] } = useQuery({
    queryKey: ['learning-centers'],
    queryFn: () => learningCentersApi.list(),
  })

  const form = useForm<UpdateUserData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone,
      role: user.role,
      learning_center_id: user.learning_center_id,
    },
  })

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        phone: user.phone,
        role: user.role,
        learning_center_id: user.learning_center_id,
      })
    }
  }, [user, form])

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserData) => usersApi.update(user.id, data),
    onSuccess: () => {
      toast.success('Admin updated successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update admin')
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  const onSubmit = async (data: UpdateUserData) => {
    // Only send fields that have changed
    const changedData: Partial<UpdateUserData> = {}
    if (data.name !== user.name) changedData.name = data.name
    if (data.phone !== user.phone) changedData.phone = data.phone
    if (data.role !== user.role) changedData.role = data.role
    if (data.learning_center_id !== user.learning_center_id) changedData.learning_center_id = data.learning_center_id

    if (Object.keys(changedData).length === 0) {
      toast.info('No changes detected')
      onSuccess()
      return
    }

    setIsSubmitting(true)
    updateMutation.mutate(changedData)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20'>
              <Edit className='h-5 w-5 text-primary' />
            </div>
            Edit Admin
          </DialogTitle>
          <DialogDescription>
            Update admin information and learning center assignment. Changes will be reflected immediately.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid gap-4'>
              {/* Current User Info */}
              <div className='rounded-lg bg-muted/50 p-3'>
                <div className='flex items-center space-x-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20'>
                    <span className='text-sm font-medium text-primary'>
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className='font-medium'>{user.name}</div>
                    <div className='text-sm text-muted-foreground'>{user.phone}</div>
                  </div>
                  <Badge className='ml-auto'>
                    {roleConfig[user.role].label}
                  </Badge>
                </div>
              </div>

              {/* Name Field */}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder='Enter full name' 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Field */}
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
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter phone number with country code (e.g., +998901234567)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role Field - Fixed to Admin Only */}
              <FormField
                control={form.control}
                name='role'
                render={({ }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <div className='flex items-center space-x-3 rounded-lg border bg-muted/30 p-3'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10'>
                          <Edit className='h-4 w-4 text-primary' />
                        </div>
                        <div className='flex-1'>
                          <div className='font-medium'>Admin</div>
                          <div className='text-sm text-muted-foreground'>
                            Full access to learning center management
                          </div>
                        </div>
                        <Badge variant='default' className='bg-primary/10 text-primary hover:bg-primary/20'>
                          Fixed
                        </Badge>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Learning Center Field */}
              <FormField
                control={form.control}
                name='learning_center_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Learning Center</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString()}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a learning center' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(learningCenters as any[]).map((center: any) => (
                          <SelectItem key={center.id} value={center.id.toString()}>
                            <div className='flex items-center justify-between w-full'>
                              <span>{center.name}</span>
                              <Badge 
                                variant={center.is_active ? 'default' : 'secondary'} 
                                className='ml-2 text-xs'
                              >
                                {center.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the learning center this admin will manage
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80'
              >
                {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Update Admin
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { UserPlus, Loader2, Building2 } from 'lucide-react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { usersApi } from '@/lib/users-api'
import { learningCentersApi } from '@/lib/learning-centers-api'
import { getLogoUrl } from '@/lib/media-utils'
import { createUserSchema, type CreateUserData } from '../data/schema'
import { toast } from 'sonner'

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  // Fetch learning centers for the dropdown
  const { data: learningCenters = [] } = useQuery({
    queryKey: ['learning-centers'],
    queryFn: () => learningCentersApi.list(),
  })

  const form = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      phone: '',
      role: 'admin',
      learning_center_id: 1,
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateUserData) => usersApi.create(data),
    onSuccess: () => {
      toast.success('User created successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      form.reset()
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create user')
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  const onSubmit = async (data: CreateUserData) => {
    setIsSubmitting(true)
    createMutation.mutate(data)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen)
      if (!newOpen) {
        form.reset()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20'>
              <UserPlus className='h-5 w-5 text-primary' />
            </div>
            Create New Admin
          </DialogTitle>
          <DialogDescription>
            Add a new admin to a learning center. They will have full access to manage their learning center.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid gap-4'>
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
                          <UserPlus className='h-4 w-4 text-primary' />
                        </div>
                        <div className='flex-1'>
                          <div className='font-medium'>Admin</div>
                          <div className='text-sm text-muted-foreground'>
                            Full access to learning center management
                          </div>
                        </div>
                        <Badge variant='default' className='bg-primary/10 text-primary hover:bg-primary/20'>
                          Selected
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
                      defaultValue={field.value?.toString()}
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
                            <div className='flex items-center space-x-3'>
                              <Avatar className='h-6 w-6'>
                                <AvatarImage src={getLogoUrl(center.logo)} alt={center.name} />
                                <AvatarFallback>
                                  <Building2 className='h-3 w-3' />
                                </AvatarFallback>
                              </Avatar>
                              <span>{center.name}</span>
                              <Badge 
                                variant={center.is_active ? 'default' : 'secondary'} 
                                className='ml-auto text-xs'
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
                Create Admin
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
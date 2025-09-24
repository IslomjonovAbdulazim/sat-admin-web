import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PlusCircle, Type, Image, Volume2 } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { contentApi } from '@/lib/content-api'
import { createWordSchema, type CreateWordData, difficultyOptions } from '../data/schema'

interface CreateWordDialogProps {
  lessonId?: number
  children?: React.ReactNode
  onSuccess?: () => void
}

export function CreateWordDialog({ lessonId, children, onSuccess }: CreateWordDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<CreateWordData>({
    resolver: zodResolver(createWordSchema),
    defaultValues: {
      word: '',
      translation: '',
      definition: '',
      sentence: '',
      difficulty: 'easy',
      order: 1,
    },
  })

  // Fetch lessons for dropdown (if lessonId not provided)
  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => contentApi.lessons.list(),
    enabled: !lessonId,
  })

  // Create word mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateWordData & { lessonId: number }) => 
      contentApi.words.create(data.lessonId, data),
    onSuccess: () => {
      toast.success('Word created successfully')
      queryClient.invalidateQueries({ queryKey: ['words'] })
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      form.reset()
      setOpen(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error('Failed to create word')
      console.error('Create word error:', error)
    },
  })

  const handleSubmit = (data: CreateWordData) => {
    const selectedLessonId = lessonId || parseInt(form.watch('lessonId' as any))
    if (!selectedLessonId) {
      toast.error('Please select a lesson')
      return
    }
    createMutation.mutate({ ...data, lessonId: selectedLessonId })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <PlusCircle className='h-4 w-4' />
            Add Word
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Type className='h-5 w-5' />
            Create New Word
          </DialogTitle>
          <DialogDescription>
            Add a new vocabulary word with translation, definition, and example usage.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
            <div className='grid gap-4'>
              {!lessonId && (
                <FormField
                  control={form.control}
                  name={'lessonId' as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson *</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                        disabled={lessonsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a lesson' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lessons?.map((lesson) => (
                            <SelectItem key={lesson.id} value={lesson.id.toString()}>
                              <div className='flex items-center gap-2'>
                                <div className={`w-2 h-2 rounded-full ${
                                  lesson.is_active ? 'bg-green-500' : 'bg-red-500'
                                }`} />
                                <span className='font-medium'>{lesson.title}</span>
                                {lesson.course_title && (
                                  <span className='text-muted-foreground text-sm'>
                                    ({lesson.course_title})
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='word'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Word *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder='e.g., hello' 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='translation'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Translation *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder='e.g., salom' 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='definition'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Definition *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Provide a clear definition of the word...'
                        className='min-h-[80px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='sentence'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Example Sentence *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Write an example sentence using this word...'
                        className='min-h-[80px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='difficulty'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level *</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select difficulty' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {difficultyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className='flex items-center gap-2'>
                                <Badge 
                                  variant='secondary' 
                                  className={`text-xs ${option.color} border-0`}
                                >
                                  {option.label}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='order'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order *</FormLabel>
                      <FormControl>
                        <Input 
                          type='number'
                          min='1'
                          placeholder='1'
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Media Upload Hint */}
              <div className='bg-muted/50 border rounded-lg p-4'>
                <div className='flex items-start gap-3'>
                  <div className='flex gap-2 mt-1'>
                    <Volume2 className='h-4 w-4 text-muted-foreground' />
                    <Image className='h-4 w-4 text-muted-foreground' />
                  </div>
                  <div className='text-sm'>
                    <p className='font-medium text-muted-foreground mb-1'>
                      Audio & Image Upload
                    </p>
                    <p className='text-muted-foreground'>
                      You can upload audio pronunciation and images after creating the word.
                      Use the edit menu to add media files.
                    </p>
                  </div>
                </div>
              </div>
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
                  'Create Word'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
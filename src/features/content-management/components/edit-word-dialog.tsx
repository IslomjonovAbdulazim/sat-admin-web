import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Edit, BookOpen } from 'lucide-react'
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
import { contentApi, type Word } from '@/lib/content-api'
import { updateWordSchema, type UpdateWordData, difficultyOptions } from '../data/schema'

interface EditWordDialogProps {
  word: Word | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditWordDialog({ word, open, onOpenChange, onSuccess }: EditWordDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<UpdateWordData>({
    resolver: zodResolver(updateWordSchema),
    defaultValues: {
      word: '',
      translation: '',
      definition: '',
      sentence: '',
      difficulty: 'easy',
      order: 1,
    },
  })

  // Fetch lessons for dropdown
  const { data: lessons } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => contentApi.lessons.list(),
  })

  // Update word mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateWordData) => {
      if (!word) throw new Error('No word selected')
      return contentApi.words.update(word.id, data)
    },
    onSuccess: () => {
      toast.success('Word updated successfully')
      queryClient.invalidateQueries({ queryKey: ['words'] })
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error('Failed to update word')
      console.error('Update word error:', error)
    },
  })

  // Reset form when word changes
  useEffect(() => {
    if (word) {
      form.reset({
        word: word.word,
        translation: word.translation,
        definition: word.definition,
        sentence: word.sentence,
        difficulty: word.difficulty,
        order: word.order,
      })
    }
  }, [word, form])

  const handleSubmit = (data: UpdateWordData) => {
    updateMutation.mutate(data)
  }

  if (!word) return null

  const selectedLesson = lessons?.find(l => l.id === word.lesson_id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Edit className='h-5 w-5' />
            Edit Word
          </DialogTitle>
          <DialogDescription>
            Update the word information and content.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
            <div className='grid gap-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='word'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Word *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder='e.g., Hello' 
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
                          placeholder='e.g., Hola' 
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
                        placeholder='Explain what this word means...'
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
                    <FormLabel>Example Sentence</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Provide an example sentence using this word...'
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
                      <Select onValueChange={field.onChange} value={field.value}>
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

              <div className='bg-muted/50 border rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <BookOpen className='h-4 w-4 text-muted-foreground' />
                  <span className='font-medium text-sm'>Current Lesson</span>
                </div>
                <div className='text-sm text-muted-foreground'>
                  {selectedLesson?.title || `Lesson ${word.lesson_id}`}
                </div>
                <div className='text-xs text-muted-foreground mt-1'>
                  Note: To move this word to a different lesson, please create a new word in the target lesson.
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={updateMutation.isPending}
                className='min-w-[100px]'
              >
                {updateMutation.isPending ? (
                  <div className='flex items-center gap-2'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    Updating...
                  </div>
                ) : (
                  'Update Word'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
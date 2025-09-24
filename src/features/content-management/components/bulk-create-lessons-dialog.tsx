import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { FileText, CheckCircle, XCircle, Copy, Download } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { contentApi } from '@/lib/content-api'
import { cn } from '@/lib/utils'

interface BulkCreateLessonsDialogProps {
  courseId: number
  courseName: string
  children?: React.ReactNode
  onSuccess?: () => void
}

interface LessonJson {
  title: string
  content: string
  order: number
}

interface CreationResult {
  lesson: LessonJson
  success: boolean
  error?: string
  id?: number
}

const EXAMPLE_JSON = `[
  {
    "title": "Introduction to English",
    "content": "Welcome to our English course! In this first lesson, we'll cover the basics of English grammar and pronunciation.",
    "order": 1
  },
  {
    "title": "Basic Greetings",
    "content": "Learn common greetings and how to introduce yourself in English. Practice saying hello, goodbye, and asking how someone is doing.",
    "order": 2
  },
  {
    "title": "Numbers and Counting",
    "content": "Master numbers 1-100 in English. Learn how to count, tell time, and express quantities in everyday situations.",
    "order": 3
  },
  {
    "title": "Family and Relationships",
    "content": "Vocabulary for describing family members and relationships. Learn to talk about your family tree and close friends.",
    "order": 4
  },
  {
    "title": "Daily Activities",
    "content": "Common verbs and phrases for daily routines. Practice describing what you do from morning to night.",
    "order": 5
  }
]`

export function BulkCreateLessonsDialog({ 
  courseId, 
  courseName, 
  children, 
  onSuccess 
}: BulkCreateLessonsDialogProps) {
  const [open, setOpen] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [parsedLessons, setParsedLessons] = useState<LessonJson[]>([])
  const [, setIsCreating] = useState(false)
  const [creationResults, setCreationResults] = useState<CreationResult[]>([])
  const [currentStep, setCurrentStep] = useState<'input' | 'preview' | 'creating' | 'results'>('input')
  const [progress, setProgress] = useState(0)
  
  const queryClient = useQueryClient()

  // Validate JSON format
  const validateJsonFormat = (jsonText: string): { valid: boolean; lessons?: LessonJson[]; errors: string[] } => {
    const errors: string[] = []
    
    if (!jsonText.trim()) {
      errors.push('JSON input is required')
      return { valid: false, errors }
    }

    try {
      const parsed = JSON.parse(jsonText)
      
      if (!Array.isArray(parsed)) {
        errors.push('JSON must be an array of lesson objects')
        return { valid: false, errors }
      }

      if (parsed.length === 0) {
        errors.push('Array cannot be empty')
        return { valid: false, errors }
      }

      if (parsed.length > 50) {
        errors.push('Maximum 50 lessons allowed per bulk creation')
        return { valid: false, errors }
      }

      // Validate each lesson object
      const lessons: LessonJson[] = []
      const orders = new Set<number>()
      
      parsed.forEach((item, index) => {
        if (typeof item !== 'object' || item === null) {
          errors.push(`Item ${index + 1}: Must be an object`)
          return
        }

        const { title, content, order } = item

        // Validate title
        if (!title || typeof title !== 'string') {
          errors.push(`Item ${index + 1}: "title" is required and must be a string`)
        } else if (title.length > 200) {
          errors.push(`Item ${index + 1}: "title" must be less than 200 characters`)
        }

        // Validate content
        if (!content || typeof content !== 'string') {
          errors.push(`Item ${index + 1}: "content" is required and must be a string`)
        } else if (content.length > 5000) {
          errors.push(`Item ${index + 1}: "content" must be less than 5000 characters`)
        }

        // Validate order
        if (typeof order !== 'number' || order < 1) {
          errors.push(`Item ${index + 1}: "order" must be a positive number`)
        } else if (orders.has(order)) {
          errors.push(`Item ${index + 1}: "order" ${order} is duplicated`)
        } else {
          orders.add(order)
        }

        if (title && content && typeof order === 'number' && order >= 1) {
          lessons.push({ title: title.trim(), content: content.trim(), order })
        }
      })

      return { valid: errors.length === 0, lessons, errors }
    } catch (e) {
      errors.push('Invalid JSON format: ' + (e as Error).message)
      return { valid: false, errors }
    }
  }

  const handleValidateAndPreview = () => {
    const { valid, lessons, errors } = validateJsonFormat(jsonInput)
    
    setValidationErrors(errors)
    
    if (valid && lessons) {
      setParsedLessons(lessons)
      setCurrentStep('preview')
    }
  }

  const handleBulkCreate = async () => {
    setCurrentStep('creating')
    setIsCreating(true)
    setProgress(0)
    const results: CreationResult[] = []

    for (let i = 0; i < parsedLessons.length; i++) {
      const lesson = parsedLessons[i]
      
      try {
        const created = await contentApi.lessons.create(courseId, {
          title: lesson.title,
          content: lesson.content,
          order: lesson.order,
        })
        
        results.push({
          lesson,
          success: true,
          id: created.id,
        })
        
        toast.success(`Created lesson: ${lesson.title}`)
      } catch (error) {
        results.push({
          lesson,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        
        toast.error(`Failed to create lesson: ${lesson.title}`)
      }
      
      setProgress(((i + 1) / parsedLessons.length) * 100)
      setCreationResults([...results])
    }

    setIsCreating(false)
    setCurrentStep('results')
    
    // Refresh the lessons list
    queryClient.invalidateQueries({ queryKey: ['lessons'] })
    queryClient.invalidateQueries({ queryKey: ['courses'] })
    
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length
    
    if (successCount > 0) {
      toast.success(`Successfully created ${successCount} lesson${successCount > 1 ? 's' : ''}`)
    }
    
    if (failureCount > 0) {
      toast.error(`Failed to create ${failureCount} lesson${failureCount > 1 ? 's' : ''}`)
    }
    
    onSuccess?.()
  }

  const handleReset = () => {
    setCurrentStep('input')
    setJsonInput('')
    setValidationErrors([])
    setParsedLessons([])
    setCreationResults([])
    setProgress(0)
  }

  const copyExampleJson = () => {
    navigator.clipboard.writeText(EXAMPLE_JSON)
    toast.success('Example JSON copied to clipboard')
  }

  const downloadExampleJson = () => {
    const blob = new Blob([EXAMPLE_JSON], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lessons-example.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Example JSON downloaded')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant='outline'>
            <FileText className='h-4 w-4' />
            Bulk Create (JSON)
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[900px] max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Bulk Create Lessons for "{courseName}"
          </DialogTitle>
          <DialogDescription>
            Create multiple lessons at once using JSON format. Each lesson will be created individually.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentStep} className='w-full flex-1 flex flex-col overflow-hidden'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger 
              value='input' 
              disabled={currentStep === 'creating'}
              className={cn(
                currentStep === 'input' && 'bg-primary text-primary-foreground',
                ['preview', 'creating', 'results'].includes(currentStep) && 'bg-muted'
              )}
            >
              1. JSON Input
            </TabsTrigger>
            <TabsTrigger 
              value='preview' 
              disabled={currentStep === 'creating' || parsedLessons.length === 0}
              className={cn(
                currentStep === 'preview' && 'bg-primary text-primary-foreground',
                ['creating', 'results'].includes(currentStep) && 'bg-muted'
              )}
            >
              2. Preview
            </TabsTrigger>
            <TabsTrigger 
              value='creating' 
              disabled={true}
              className={cn(
                currentStep === 'creating' && 'bg-primary text-primary-foreground',
                currentStep === 'results' && 'bg-muted'
              )}
            >
              3. Creating...
            </TabsTrigger>
            <TabsTrigger 
              value='results' 
              disabled={creationResults.length === 0}
              className={cn(
                currentStep === 'results' && 'bg-primary text-primary-foreground'
              )}
            >
              4. Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value='input' className='space-y-4 flex-1 overflow-y-auto'>
            <div className='grid gap-4'>
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='text-sm font-medium'>Lessons JSON Array</label>
                  <div className='flex gap-2'>
                    <Button 
                      variant='ghost' 
                      size='sm' 
                      onClick={copyExampleJson}
                    >
                      <Copy className='h-3 w-3 mr-1' />
                      Copy Example
                    </Button>
                    <Button 
                      variant='ghost' 
                      size='sm' 
                      onClick={downloadExampleJson}
                    >
                      <Download className='h-3 w-3 mr-1' />
                      Download Example
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='Paste your JSON array here...'
                  className='min-h-[300px] max-h-[400px] font-mono text-sm resize-none'
                />
              </div>

              {validationErrors.length > 0 && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-red-600'>
                    <XCircle className='h-4 w-4' />
                    <span className='font-medium'>Validation Errors:</span>
                  </div>
                  <ScrollArea className='max-h-[100px]'>
                    <ul className='space-y-1 text-sm text-red-600'>
                      {validationErrors.map((error, index) => (
                        <li key={index} className='flex items-start gap-2'>
                          <span className='text-red-400 mt-0.5'>•</span>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}

              <div className='bg-muted/50 rounded-lg p-4'>
                <h4 className='font-medium mb-2'>JSON Format Requirements:</h4>
                <ul className='text-sm text-muted-foreground space-y-1'>
                  <li>• Must be a valid JSON array</li>
                  <li>• Each object requires: "title", "content", "order"</li>
                  <li>• Title: max 200 characters</li>
                  <li>• Content: max 5000 characters</li>
                  <li>• Order: positive number, unique per lesson</li>
                  <li>• Maximum 50 lessons per bulk operation</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='preview' className='space-y-4 flex-1 overflow-y-auto'>
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <CheckCircle className='h-5 w-5 text-green-600' />
                <span className='font-medium'>Ready to create {parsedLessons.length} lesson{parsedLessons.length > 1 ? 's' : ''}</span>
              </div>
              
              <ScrollArea className='flex-1 max-h-[400px]'>
                <div className='space-y-3'>
                  {parsedLessons.map((lesson, index) => (
                    <div key={index} className='border rounded-lg p-3'>
                      <div className='flex items-center gap-2 mb-2'>
                        <Badge variant='outline'>#{lesson.order}</Badge>
                        <span className='font-medium'>{lesson.title}</span>
                      </div>
                      <p className='text-sm text-muted-foreground line-clamp-2'>
                        {lesson.content}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value='creating' className='space-y-4 flex-1 overflow-y-auto'>
            <div className='text-center space-y-4'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
              <div>
                <p className='font-medium'>Creating lessons...</p>
                <p className='text-sm text-muted-foreground'>
                  {Math.round(progress)}% complete ({creationResults.length} of {parsedLessons.length})
                </p>
              </div>
              <Progress value={progress} className='w-full' />
              
              {creationResults.length > 0 && (
                <ScrollArea className='max-h-[300px]'>
                  <div className='space-y-2 text-left'>
                    {creationResults.map((result, index) => (
                      <div key={index} className='flex items-center gap-2 text-sm'>
                        {result.success ? (
                          <CheckCircle className='h-4 w-4 text-green-600' />
                        ) : (
                          <XCircle className='h-4 w-4 text-red-600' />
                        )}
                        <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                          {result.lesson.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </TabsContent>

          <TabsContent value='results' className='space-y-4 flex-1 overflow-y-auto'>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg'>
                  <div className='text-2xl font-bold text-green-600'>
                    {creationResults.filter(r => r.success).length}
                  </div>
                  <div className='text-sm text-green-600'>Successful</div>
                </div>
                <div className='text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg'>
                  <div className='text-2xl font-bold text-red-600'>
                    {creationResults.filter(r => !r.success).length}
                  </div>
                  <div className='text-sm text-red-600'>Failed</div>
                </div>
              </div>

              <ScrollArea className='flex-1 max-h-[400px]'>
                <div className='space-y-2'>
                  {creationResults.map((result, index) => (
                    <div key={index} className='flex items-start gap-3 p-2 rounded border'>
                      {result.success ? (
                        <CheckCircle className='h-4 w-4 text-green-600 mt-0.5' />
                      ) : (
                        <XCircle className='h-4 w-4 text-red-600 mt-0.5' />
                      )}
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium text-sm'>{result.lesson.title}</div>
                        {result.error && (
                          <div className='text-xs text-red-600 mt-1'>{result.error}</div>
                        )}
                        {result.success && result.id && (
                          <div className='text-xs text-green-600 mt-1'>Created with ID: {result.id}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {currentStep === 'input' && (
            <>
              <Button variant='outline' onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleValidateAndPreview} disabled={!jsonInput.trim()}>
                Validate & Preview
              </Button>
            </>
          )}
          
          {currentStep === 'preview' && (
            <>
              <Button variant='outline' onClick={() => setCurrentStep('input')}>
                Back
              </Button>
              <Button onClick={handleBulkCreate} disabled={parsedLessons.length === 0}>
                Create {parsedLessons.length} Lesson{parsedLessons.length > 1 ? 's' : ''}
              </Button>
            </>
          )}
          
          {currentStep === 'creating' && (
            <Button disabled>
              Creating... {Math.round(progress)}%
            </Button>
          )}
          
          {currentStep === 'results' && (
            <>
              <Button variant='outline' onClick={handleReset}>
                Create More
              </Button>
              <Button onClick={() => setOpen(false)}>
                Done
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
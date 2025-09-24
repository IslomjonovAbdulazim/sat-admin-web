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
import { difficultyOptions } from '../data/schema'
import { cn } from '@/lib/utils'

interface BulkCreateWordsDialogProps {
  lessonId: number
  lessonName: string
  children?: React.ReactNode
  onSuccess?: () => void
}

interface WordJson {
  word: string
  translation: string
  definition: string
  sentence?: string
  difficulty: 'easy' | 'medium' | 'hard'
  order: number
}

interface CreationResult {
  word: WordJson
  success: boolean
  error?: string
  id?: number
}

const EXAMPLE_JSON = `[
  {
    "word": "Hello",
    "translation": "Hola",
    "definition": "A greeting used when meeting someone or starting a conversation",
    "sentence": "Hello, how are you today?",
    "difficulty": "easy",
    "order": 1
  },
  {
    "word": "Goodbye",
    "translation": "Adiós",
    "definition": "A farewell expression used when leaving or ending a conversation",
    "sentence": "Goodbye, see you tomorrow!",
    "difficulty": "easy",
    "order": 2
  },
  {
    "word": "Beautiful",
    "translation": "Hermoso",
    "definition": "Pleasing to the senses or mind; having qualities that give great pleasure",
    "sentence": "The sunset was absolutely beautiful.",
    "difficulty": "medium",
    "order": 3
  },
  {
    "word": "Understand",
    "translation": "Entender",
    "definition": "To perceive the intended meaning of words, language, or a speaker",
    "sentence": "Do you understand what I'm saying?",
    "difficulty": "medium",
    "order": 4
  },
  {
    "word": "Sophisticated",
    "translation": "Sofisticado",
    "definition": "Having or showing a great deal of worldly experience and knowledge",
    "sentence": "She has a very sophisticated taste in art.",
    "difficulty": "hard",
    "order": 5
  }
]`

export function BulkCreateWordsDialog({ 
  lessonId, 
  lessonName, 
  children, 
  onSuccess 
}: BulkCreateWordsDialogProps) {
  const [open, setOpen] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [parsedWords, setParsedWords] = useState<WordJson[]>([])
  const [creationResults, setCreationResults] = useState<CreationResult[]>([])
  const [currentStep, setCurrentStep] = useState<'input' | 'preview' | 'creating' | 'results'>('input')
  const [progress, setProgress] = useState(0)
  
  const queryClient = useQueryClient()

  // Validate JSON format
  const validateJsonFormat = (jsonText: string): { valid: boolean; words?: WordJson[]; errors: string[] } => {
    const errors: string[] = []
    
    if (!jsonText.trim()) {
      errors.push('JSON input is required')
      return { valid: false, errors }
    }

    try {
      const parsed = JSON.parse(jsonText)
      
      if (!Array.isArray(parsed)) {
        errors.push('JSON must be an array of word objects')
        return { valid: false, errors }
      }

      if (parsed.length === 0) {
        errors.push('Array cannot be empty')
        return { valid: false, errors }
      }

      if (parsed.length > 100) {
        errors.push('Maximum 100 words allowed per bulk creation')
        return { valid: false, errors }
      }

      // Validate each word object
      const words: WordJson[] = []
      const orders = new Set<number>()
      const wordTexts = new Set<string>()
      
      parsed.forEach((item, index) => {
        if (typeof item !== 'object' || item === null) {
          errors.push(`Item ${index + 1}: Must be an object`)
          return
        }

        const { word, translation, definition, sentence, difficulty, order } = item

        // Validate word
        if (!word || typeof word !== 'string') {
          errors.push(`Item ${index + 1}: "word" is required and must be a string`)
        } else if (word.length > 100) {
          errors.push(`Item ${index + 1}: "word" must be less than 100 characters`)
        } else if (wordTexts.has(word.toLowerCase())) {
          errors.push(`Item ${index + 1}: "word" "${word}" is duplicated`)
        } else {
          wordTexts.add(word.toLowerCase())
        }

        // Validate translation
        if (!translation || typeof translation !== 'string') {
          errors.push(`Item ${index + 1}: "translation" is required and must be a string`)
        } else if (translation.length > 100) {
          errors.push(`Item ${index + 1}: "translation" must be less than 100 characters`)
        }

        // Validate definition
        if (!definition || typeof definition !== 'string') {
          errors.push(`Item ${index + 1}: "definition" is required and must be a string`)
        } else if (definition.length > 1000) {
          errors.push(`Item ${index + 1}: "definition" must be less than 1000 characters`)
        }

        // Validate sentence (optional)
        if (sentence !== undefined && sentence !== null) {
          if (typeof sentence !== 'string') {
            errors.push(`Item ${index + 1}: "sentence" must be a string`)
          } else if (sentence.length > 500) {
            errors.push(`Item ${index + 1}: "sentence" must be less than 500 characters`)
          }
        }

        // Validate difficulty
        const validDifficulties = ['easy', 'medium', 'hard']
        if (!difficulty || !validDifficulties.includes(difficulty)) {
          errors.push(`Item ${index + 1}: "difficulty" must be one of: ${validDifficulties.join(', ')}`)
        }

        // Validate order
        if (typeof order !== 'number' || order < 1) {
          errors.push(`Item ${index + 1}: "order" must be a positive number`)
        } else if (orders.has(order)) {
          errors.push(`Item ${index + 1}: "order" ${order} is duplicated`)
        } else {
          orders.add(order)
        }

        if (word && translation && definition && difficulty && typeof order === 'number' && order >= 1) {
          words.push({ 
            word: word.trim(), 
            translation: translation.trim(), 
            definition: definition.trim(),
            sentence: sentence ? sentence.trim() : '',
            difficulty,
            order 
          })
        }
      })

      return { valid: errors.length === 0, words, errors }
    } catch (e) {
      errors.push('Invalid JSON format: ' + (e as Error).message)
      return { valid: false, errors }
    }
  }

  const handleValidateAndPreview = () => {
    const { valid, words, errors } = validateJsonFormat(jsonInput)
    
    setValidationErrors(errors)
    
    if (valid && words) {
      setParsedWords(words)
      setCurrentStep('preview')
    }
  }

  const handleBulkCreate = async () => {
    setCurrentStep('creating')
    setProgress(0)
    const results: CreationResult[] = []

    for (let i = 0; i < parsedWords.length; i++) {
      const word = parsedWords[i]
      
      try {
        const created = await contentApi.words.create(lessonId, {
          word: word.word,
          translation: word.translation,
          definition: word.definition,
          sentence: word.sentence || '',
          difficulty: word.difficulty,
          order: word.order,
        })
        
        results.push({
          word,
          success: true,
          id: created.id,
        })
        
        toast.success(`Created word: ${word.word}`)
      } catch (error) {
        results.push({
          word,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        
        toast.error(`Failed to create word: ${word.word}`)
      }
      
      setProgress(((i + 1) / parsedWords.length) * 100)
      setCreationResults([...results])
    }

    setCurrentStep('results')
    
    // Refresh the words list
    queryClient.invalidateQueries({ queryKey: ['words'] })
    queryClient.invalidateQueries({ queryKey: ['lessons'] })
    
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length
    
    if (successCount > 0) {
      toast.success(`Successfully created ${successCount} word${successCount > 1 ? 's' : ''}`)
    }
    
    if (failureCount > 0) {
      toast.error(`Failed to create ${failureCount} word${failureCount > 1 ? 's' : ''}`)
    }
    
    onSuccess?.()
  }

  const handleReset = () => {
    setCurrentStep('input')
    setJsonInput('')
    setValidationErrors([])
    setParsedWords([])
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
    a.download = 'words-example.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Example JSON downloaded')
  }

  const getDifficultyOption = (difficulty: string) => {
    return difficultyOptions.find(opt => opt.value === difficulty) || difficultyOptions[0]
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
            Bulk Create Words for "{lessonName}"
          </DialogTitle>
          <DialogDescription>
            Create multiple vocabulary words at once using JSON format. Each word will be created individually.
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
              disabled={currentStep === 'creating' || parsedWords.length === 0}
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
                  <label className='text-sm font-medium'>Words JSON Array</label>
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
                  <li>• Each object requires: "word", "translation", "definition", "difficulty", "order"</li>
                  <li>• Optional: "sentence" for example usage</li>
                  <li>• Word & Translation: max 100 characters each</li>
                  <li>• Definition: max 1000 characters</li>
                  <li>• Sentence: max 500 characters (optional)</li>
                  <li>• Difficulty: "easy", "medium", or "hard"</li>
                  <li>• Order: positive number, unique per word</li>
                  <li>• Maximum 100 words per bulk operation</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='preview' className='space-y-4 flex-1 overflow-y-auto'>
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <CheckCircle className='h-5 w-5 text-green-600' />
                <span className='font-medium'>Ready to create {parsedWords.length} word{parsedWords.length > 1 ? 's' : ''}</span>
              </div>
              
              <ScrollArea className='flex-1 max-h-[400px]'>
                <div className='space-y-3'>
                  {parsedWords.map((word, index) => {
                    const difficultyOption = getDifficultyOption(word.difficulty)
                    return (
                      <div key={index} className='border rounded-lg p-3'>
                        <div className='flex items-center gap-2 mb-2'>
                          <Badge variant='outline'>#{word.order}</Badge>
                          <span className='font-medium'>{word.word}</span>
                          <span className='text-muted-foreground'>→</span>
                          <span className='font-medium'>{word.translation}</span>
                          <Badge 
                            variant='secondary' 
                            className={`text-xs ${difficultyOption.color} border-0 ml-auto`}
                          >
                            {difficultyOption.label}
                          </Badge>
                        </div>
                        <p className='text-sm text-muted-foreground line-clamp-2'>
                          {word.definition}
                        </p>
                        {word.sentence && (
                          <p className='text-xs text-muted-foreground italic mt-1 line-clamp-1'>
                            Example: {word.sentence}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value='creating' className='space-y-4 flex-1 overflow-y-auto'>
            <div className='text-center space-y-4'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
              <div>
                <p className='font-medium'>Creating words...</p>
                <p className='text-sm text-muted-foreground'>
                  {Math.round(progress)}% complete ({creationResults.length} of {parsedWords.length})
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
                          {result.word.word}
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
                        <div className='font-medium text-sm'>
                          {result.word.word} → {result.word.translation}
                        </div>
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
              <Button onClick={handleBulkCreate} disabled={parsedWords.length === 0}>
                Create {parsedWords.length} Word{parsedWords.length > 1 ? 's' : ''}
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
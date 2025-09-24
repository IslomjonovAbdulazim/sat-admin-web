import { useState, useCallback, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Upload, Volume2, FileAudio, X, Check, Loader2, FolderOpen, Wand2, Play, Pause } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { contentApi, type Word } from '@/lib/content-api'
import { generateAudio, blobToFile } from '@/lib/tts-api'
import { NARAKEET_LANGUAGES, getLanguageDisplayName, findLanguageByCode } from '@/lib/narakeet-languages'
import { cn } from '@/lib/utils'

interface AudioUploadDialogProps {
  word: Word
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface UploadedFile {
  file: File
  preview?: string
  uploading: boolean
  uploaded: boolean
  error?: string
  audioUrl?: string
  isPlaying?: boolean
}

export function AudioUploadDialog({ word, open, onOpenChange, onSuccess }: AudioUploadDialogProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([])
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [generationText, setGenerationText] = useState(word.word)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    return localStorage.getItem('lastUsedLanguage') || 'en-US'
  })
  const [playingFileIndex, setPlayingFileIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([])
  const queryClient = useQueryClient()

  // Upload audio mutation
  const uploadMutation = useMutation({
    mutationFn: ({ file }: { file: File }) => contentApi.words.uploadAudio(word.id, file),
    onSuccess: () => {
      toast.success('Audio uploaded successfully')
      queryClient.invalidateQueries({ queryKey: ['words'] })
      onSuccess?.()
      onOpenChange(false)
      resetState()
    },
    onError: (error) => {
      toast.error('Failed to upload audio')
      console.error('Upload error:', error)
    },
  })

  // Save selected language to localStorage
  useEffect(() => {
    if (selectedLanguage) {
      localStorage.setItem('lastUsedLanguage', selectedLanguage)
    }
  }, [selectedLanguage])

  const resetState = () => {
    // Clean up audio URLs
    selectedFiles.forEach(file => {
      if (file.audioUrl) {
        URL.revokeObjectURL(file.audioUrl)
      }
    })
    
    setSelectedFiles([])
    setShowGenerateDialog(false)
    setDragActive(false)
    setGenerationText(word.word)
    setIsGenerating(false)
    setPlayingFileIndex(null)
    audioRefs.current = []
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    const audioFiles = files.filter(file => file.type.startsWith('audio/'))
    
    if (audioFiles.length === 0) {
      toast.error('Please select valid audio files')
      return
    }

    if (audioFiles.length > 3) {
      toast.error('Maximum 3 audio files allowed')
      return
    }

    const newFiles = audioFiles.map(file => {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`)
        return null
      }

      return {
        file,
        uploading: false,
        uploaded: false,
        audioUrl: URL.createObjectURL(file),
        isPlaying: false
      }
    }).filter(Boolean) as UploadedFile[]

    setSelectedFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev]
      const fileToRemove = newFiles[index]
      
      // Clean up audio URL
      if (fileToRemove.audioUrl) {
        URL.revokeObjectURL(fileToRemove.audioUrl)
      }
      
      // Stop playing if this file is currently playing
      if (playingFileIndex === index) {
        setPlayingFileIndex(null)
      }
      
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const uploadFile = async (file: UploadedFile, index: number) => {
    setSelectedFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, uploading: true } : f
    ))

    try {
      await uploadMutation.mutateAsync({ file: file.file })
      setSelectedFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, uploading: false, uploaded: true } : f
      ))
    } catch (error) {
      setSelectedFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          uploading: false, 
          error: error instanceof Error ? error.message : 'Upload failed' 
        } : f
      ))
    }
  }

  const handleGenerateAudio = async () => {
    if (!generationText.trim()) {
      toast.error('Please enter text to generate audio')
      return
    }

    if (!selectedLanguage) {
      toast.error('Please select a language for generation')
      return
    }

    setIsGenerating(true)
    
    try {
      const selectedLang = findLanguageByCode(selectedLanguage)
      const languageName = selectedLang ? getLanguageDisplayName(selectedLang) : selectedLanguage
      
      toast.info(`Generating audio for "${generationText}" in ${languageName}...`)
      
      // Generate audio using backend TTS API
      const result = await generateAudio({
        text: generationText,
        languageCode: selectedLanguage
      })

      if (!result.success || !result.audioBlob) {
        throw new Error(result.error || 'Failed to generate audio')
      }

      // Convert blob to file and add to file list
      const audioFile = blobToFile(
        result.audioBlob,
        `${generationText.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedLanguage}.m4a`
      )

      // Add to selected files list
      const newUploadedFile: UploadedFile = {
        file: audioFile,
        uploading: false,
        uploaded: false,
        audioUrl: URL.createObjectURL(audioFile),
        isPlaying: false
      }

      setSelectedFiles(prev => [...prev, newUploadedFile])
      
      toast.success(`Audio generated successfully! Added to file list.`)
      
      // Go back to main upload dialog
      setShowGenerateDialog(false)
      
    } catch (error) {
      console.error('Audio generation error:', error)
      
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Failed to generate audio. Please try again.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const togglePlayAudio = (index: number) => {
    const audioRef = audioRefs.current[index]
    const file = selectedFiles[index]
    
    if (!audioRef || !file.audioUrl) return

    if (playingFileIndex === index) {
      // Currently playing this file, pause it
      audioRef.pause()
      setPlayingFileIndex(null)
    } else {
      // Stop any other playing audio
      if (playingFileIndex !== null && audioRefs.current[playingFileIndex]) {
        audioRefs.current[playingFileIndex]?.pause()
      }
      
      // Play this audio
      audioRef.currentTime = 0
      audioRef.play()
      setPlayingFileIndex(index)
      
      // Set up event listener to update state when audio ends
      audioRef.onended = () => {
        setPlayingFileIndex(null)
      }
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (file: File) => {
    // This would require loading the audio file to get duration
    // For now, just show file type
    const extension = file.name.split('.').pop()?.toUpperCase()
    return extension || 'AUDIO'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        'max-h-[80vh] flex flex-col',
        showGenerateDialog ? 'sm:max-w-[500px]' : 'sm:max-w-[700px]'
      )}>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Volume2 className='h-5 w-5' />
            Upload Audio for "{word.word}"
          </DialogTitle>
          <DialogDescription>
            Upload audio pronunciation or generate it using AI. Supports MP3, WAV, OGG up to 10MB.
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 space-y-4'>
          {!showGenerateDialog ? (
            <>
              {/* Drag & Drop Area */}
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-12 text-center transition-colors min-h-[300px] flex flex-col justify-center',
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className='flex flex-col items-center gap-6'>
                  <div className='rounded-full bg-muted p-6'>
                    <Upload className='h-12 w-12 text-muted-foreground' />
                  </div>
                  <div className='space-y-3'>
                    <p className='text-xl font-medium'>
                      {dragActive ? 'Drop audio files here' : 'Drag & drop audio files here'}
                    </p>
                    <p className='text-muted-foreground'>
                      or use the buttons below
                    </p>
                  </div>
                  <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                    <Badge variant='outline' className='px-3 py-1'>MP3</Badge>
                    <Badge variant='outline' className='px-3 py-1'>WAV</Badge>
                    <Badge variant='outline' className='px-3 py-1'>OGG</Badge>
                    <Badge variant='outline' className='px-3 py-1'>Max 10MB</Badge>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type='file'
                accept='audio/*'
                multiple
                onChange={handleFileInput}
                className='hidden'
              />

              {/* File List */}
              {selectedFiles.length > 0 && (
                <div className='space-y-3 max-h-[200px] overflow-y-auto'>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className='flex items-center gap-3 p-3 border rounded-lg'>
                      {/* Hidden audio element for each file */}
                      {file.audioUrl && (
                        <audio
                          ref={(el) => {
                            audioRefs.current[index] = el
                          }}
                          src={file.audioUrl}
                          preload='metadata'
                          style={{ display: 'none' }}
                        />
                      )}
                      
                      <div className='h-12 w-12 rounded bg-muted flex items-center justify-center'>
                        <FileAudio className='h-6 w-6 text-muted-foreground' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium text-sm truncate'>
                          {file.file.name}
                        </div>
                        <div className='text-xs text-muted-foreground flex items-center gap-2'>
                          <span>{formatFileSize(file.file.size)}</span>
                          <span>•</span>
                          <span>{formatDuration(file.file)}</span>
                        </div>
                        {file.error && (
                          <div className='text-xs text-red-600 mt-1'>
                            {file.error}
                          </div>
                        )}
                      </div>
                      <div className='flex items-center gap-2'>
                        {/* Play/Pause Button */}
                        {file.audioUrl && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => togglePlayAudio(index)}
                            disabled={file.uploading}
                            className='h-8 w-8 p-0'
                          >
                            {playingFileIndex === index ? (
                              <Pause className='h-4 w-4' />
                            ) : (
                              <Play className='h-4 w-4' />
                            )}
                          </Button>
                        )}
                        
                        {file.uploading && (
                          <Loader2 className='h-4 w-4 animate-spin text-primary' />
                        )}
                        {file.uploaded && (
                          <Check className='h-4 w-4 text-green-600' />
                        )}
                        {!file.uploading && !file.uploaded && (
                          <Button
                            size='sm'
                            onClick={() => uploadFile(file, index)}
                            disabled={uploadMutation.isPending}
                          >
                            Upload
                          </Button>
                        )}
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => removeFile(index)}
                          disabled={file.uploading}
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Generate Audio Section */
            <div className='space-y-4'>
              <div className='text-center py-4'>
                <div className='rounded-full bg-primary/10 p-4 w-fit mx-auto mb-3'>
                  <Wand2 className='h-8 w-8 text-primary' />
                </div>
                <h3 className='text-lg font-semibold mb-1'>AI Audio Generation</h3>
                <p className='text-sm text-muted-foreground'>
                  Generate pronunciation audio
                </p>
              </div>

              <div className='space-y-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='generation-text'>Text to Generate</Label>
                  <Textarea
                    id='generation-text'
                    value={generationText}
                    onChange={(e) => setGenerationText(e.target.value)}
                    placeholder='Enter the word or phrase to generate audio for...'
                    className='min-h-[80px]'
                  />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='language-select'>Language</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select language...' />
                    </SelectTrigger>
                    <SelectContent>
                      {NARAKEET_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {getLanguageDisplayName(lang)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className='justify-between'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          
          {!showGenerateDialog ? (
            <div className='flex gap-2'>
              <Button variant='outline' onClick={openFileDialog}>
                <FolderOpen className='h-4 w-4 mr-2' />
                Browse Files
              </Button>
              <Button onClick={() => setShowGenerateDialog(true)}>
                <Wand2 className='h-4 w-4 mr-2' />
                Generate Audio
              </Button>
            </div>
          ) : (
            <div className='flex gap-2'>
              <Button variant='outline' onClick={() => setShowGenerateDialog(false)}>
                Back to Upload
              </Button>
              <Button
                onClick={handleGenerateAudio}
                disabled={isGenerating || !generationText.trim() || !selectedLanguage}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className='h-4 w-4 mr-2' />
                    Generate Now
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
import { useState, useCallback, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Upload, Image, X, Check, Loader2, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { contentApi, type Word } from '@/lib/content-api'
import { cn } from '@/lib/utils'

interface ImageUploadDialogProps {
  word: Word
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface UploadedFile {
  file: File
  preview: string
  uploading: boolean
  uploaded: boolean
  error?: string
}

export function ImageUploadDialog({ word, open, onOpenChange, onSuccess }: ImageUploadDialogProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  // Upload image mutation
  const uploadMutation = useMutation({
    mutationFn: ({ file }: { file: File }) => contentApi.words.uploadImage(word.id, file),
    onSuccess: () => {
      toast.success('Image uploaded successfully')
      queryClient.invalidateQueries({ queryKey: ['words'] })
      onSuccess?.()
      onOpenChange(false)
      resetState()
    },
    onError: (error) => {
      toast.error('Failed to upload image')
      console.error('Upload error:', error)
    },
  })

  const resetState = () => {
    setSelectedFiles([])
    setDragActive(false)
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
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      toast.error('Please select valid image files')
      return
    }

    if (imageFiles.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    const newFiles = imageFiles.map(file => {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB.`)
        return null
      }

      return {
        file,
        preview: URL.createObjectURL(file),
        uploading: false,
        uploaded: false,
      }
    }).filter(Boolean) as UploadedFile[]

    setSelectedFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px] max-h-[80vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Image className='h-5 w-5' />
            Upload Image for "{word.word}"
          </DialogTitle>
          <DialogDescription>
            Upload an image to help visualize this word. Supports JPG, PNG, GIF up to 5MB.
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 space-y-4'>
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
                  {dragActive ? 'Drop images here' : 'Drag & drop images here'}
                </p>
                <p className='text-muted-foreground'>
                  or use the browse button below
                </p>
              </div>
              <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                <Badge variant='outline' className='px-3 py-1'>JPG</Badge>
                <Badge variant='outline' className='px-3 py-1'>PNG</Badge>
                <Badge variant='outline' className='px-3 py-1'>GIF</Badge>
                <Badge variant='outline' className='px-3 py-1'>Max 5MB</Badge>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            multiple
            onChange={handleFileInput}
            className='hidden'
          />

          {/* File List */}
          {selectedFiles.length > 0 && (
            <div className='space-y-3 max-h-[200px] overflow-y-auto'>
              {selectedFiles.map((file, index) => (
                <div key={index} className='flex items-center gap-3 p-3 border rounded-lg'>
                  <img
                    src={file.preview}
                    alt='Preview'
                    className='h-12 w-12 object-cover rounded'
                  />
                  <div className='flex-1 min-w-0'>
                    <div className='font-medium text-sm truncate'>
                      {file.file.name}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {formatFileSize(file.file.size)}
                    </div>
                    {file.error && (
                      <div className='text-xs text-red-600 mt-1'>
                        {file.error}
                      </div>
                    )}
                  </div>
                  <div className='flex items-center gap-2'>
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
        </div>

        <DialogFooter className='justify-between'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <div className='flex gap-2'>
            {selectedFiles.length > 0 && (
              <Button
                variant='outline'
                onClick={() => {
                  selectedFiles.forEach((file, index) => {
                    if (!file.uploaded && !file.uploading && !file.error) {
                      uploadFile(file, index)
                    }
                  })
                }}
                disabled={uploadMutation.isPending || selectedFiles.every(f => f.uploaded || f.uploading)}
              >
                Upload All ({selectedFiles.filter(f => !f.uploaded && !f.uploading && !f.error).length})
              </Button>
            )}
            <Button onClick={openFileDialog}>
              <FolderOpen className='h-4 w-4 mr-2' />
              Browse Files
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
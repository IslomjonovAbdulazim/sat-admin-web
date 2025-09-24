import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Upload, Loader2, Image, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { learningCentersApi, type LearningCenter } from '@/lib/learning-centers-api'
import { getLogoUrl } from '@/lib/media-utils'

interface UploadLogoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  center: LearningCenter
  onSuccess: () => void
}

export function UploadLogoDialog({
  open,
  onOpenChange,
  center,
  onSuccess,
}: UploadLogoDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useMutation({
    mutationFn: (file: File) => learningCentersApi.uploadLogo(center.id, file),
    onSuccess: (data) => {
      toast.success(data.message)
      setSelectedFile(null)
      setPreviewUrl(null)
      onSuccess()
    },
    onError: (error) => {
      toast.error('Failed to upload logo')
      // eslint-disable-next-line no-console
      console.error('Upload logo error:', error)
    },
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      handleRemoveFile()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center space-x-2'>
            <Upload className='h-5 w-5' />
            <span>Upload Logo</span>
          </DialogTitle>
          <DialogDescription>
            Upload a new logo for "{center.name}". Supported formats: JPEG, PNG, WebP (max 5MB).
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Current Logo */}
          <div className='flex items-center space-x-3'>
            <div className='text-sm font-medium'>Current Logo:</div>
            <Avatar className='h-12 w-12'>
              <AvatarImage src={getLogoUrl(center.logo)} alt={center.name} />
              <AvatarFallback>
                <Image className='h-6 w-6' />
              </AvatarFallback>
            </Avatar>
          </div>

          {/* File Upload Area */}
          <div className='border-2 border-dashed border-muted-foreground/25 rounded-lg p-6'>
            {selectedFile ? (
              <div className='flex flex-col items-center space-y-4'>
                <div className='relative'>
                  <Avatar className='h-20 w-20'>
                    <AvatarImage src={previewUrl || undefined} alt='Preview' />
                    <AvatarFallback>
                      <Image className='h-8 w-8' />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type='button'
                    variant='destructive'
                    size='sm'
                    className='absolute -top-2 -right-2 h-6 w-6 rounded-full p-0'
                    onClick={handleRemoveFile}
                  >
                    <X className='h-3 w-3' />
                  </Button>
                </div>
                <div className='text-center'>
                  <div className='text-sm font-medium'>{selectedFile.name}</div>
                  <div className='text-xs text-muted-foreground'>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-center'>
                <Upload className='mx-auto h-12 w-12 text-muted-foreground' />
                <div className='mt-4'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                </div>
                <p className='mt-2 text-xs text-muted-foreground'>
                  JPEG, PNG, WebP up to 5MB
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type='file'
            accept='image/jpeg,image/jpg,image/png,image/webp'
            onChange={handleFileSelect}
            className='hidden'
          />
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => handleDialogClose(false)}
            disabled={uploadMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
          >
            {uploadMutation.isPending && (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            )}
            Upload Logo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
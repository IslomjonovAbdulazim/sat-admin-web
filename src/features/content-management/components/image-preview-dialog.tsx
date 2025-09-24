import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink } from 'lucide-react'
import { getImageUrl } from '@/lib/media-utils'
import type { Word } from '@/lib/content-api'

interface ImagePreviewDialogProps {
  word: Word | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImagePreviewDialog({ word, open, onOpenChange }: ImagePreviewDialogProps) {
  if (!word || !word.image) return null

  const imageUrl = getImageUrl(word.image)

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = `${word.word}_image.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleOpenExternal = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[800px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <span>Image for "{word.word}"</span>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleDownload}
              >
                <Download className='h-4 w-4 mr-2' />
                Download
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={handleOpenExternal}
              >
                <ExternalLink className='h-4 w-4 mr-2' />
                Open in New Tab
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className='w-full'>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Image for ${word.word}`}
              className='w-full h-auto max-h-[600px] object-contain rounded-lg border'
              onError={(e) => {
                e.currentTarget.src = '/placeholder-image.png'
              }}
            />
          ) : (
            <div className='flex items-center justify-center h-48 bg-muted rounded-lg'>
              <p className='text-muted-foreground'>Image not available</p>
            </div>
          )}
        </div>

        <div className='bg-muted/50 rounded-lg p-3 text-sm'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <span className='font-medium'>Word:</span> {word.word}
            </div>
            <div>
              <span className='font-medium'>Translation:</span> {word.translation}
            </div>
            <div className='col-span-2'>
              <span className='font-medium'>Definition:</span> {word.definition}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
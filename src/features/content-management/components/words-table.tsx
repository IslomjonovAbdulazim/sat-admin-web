import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Type,
  Volume2,
  Image,
  Calendar,
  Hash,
  Upload,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { contentApi, type Word } from '@/lib/content-api'
import { getAudioUrl } from '@/lib/media-utils'
import { difficultyOptions } from '../data/schema'

interface WordsTableProps {
  data: Word[]
  isLoading?: boolean
  onEdit: (word: Word) => void
  onUploadMedia: (word: Word, type: 'audio' | 'image') => void
  onRefresh: () => void
  lessonName?: string
  onPreviewImage?: (word: Word) => void
}

export function WordsTable({
  data,
  isLoading,
  onEdit,
  onUploadMedia,
  onRefresh,
  lessonName,
  onPreviewImage,
}: WordsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const queryClient = useQueryClient()

  // Delete word mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => contentApi.words.delete(id),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['words'] })
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      onRefresh()
      setDeleteDialogOpen(false)
      setSelectedWord(null)
    },
    onError: (error) => {
      toast.error('Failed to delete word')
      console.error('Delete error:', error)
    },
  })

  const handleDelete = (word: Word) => {
    setSelectedWord(word)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedWord) {
      deleteMutation.mutate(selectedWord.id)
    }
  }

  const getDifficultyOption = (difficulty: string) => {
    return difficultyOptions.find(opt => opt.value === difficulty) || difficultyOptions[0]
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Words</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Words</CardTitle>
          <CardDescription>
            {lessonName ? `No words found in "${lessonName}"` : 'No words found'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-8'>
            <Type className='h-12 w-12 text-muted-foreground mb-4' />
            <p className='text-muted-foreground text-center'>
              {lessonName 
                ? `No vocabulary words have been created for "${lessonName}" yet.`
                : 'No vocabulary words have been created yet.'
              }
              <br />
              Click "Add Word" to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className='border-0 shadow-lg bg-gradient-to-br from-card via-card to-card/95'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-xl font-semibold flex items-center gap-2'>
                <Type className='h-5 w-5 text-primary' />
                Words ({data.length})
                {lessonName && (
                  <Badge variant='outline' className='ml-2'>
                    {lessonName}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className='mt-1'>
                {lessonName 
                  ? `Manage vocabulary for "${lessonName}" lesson`
                  : 'Manage vocabulary words and their content'
                }
              </CardDescription>
            </div>
            <div className='text-right'>
              <div className='text-sm text-muted-foreground'>With Media</div>
              <div className='text-2xl font-bold text-primary'>
                {data.filter(w => w.audio || w.image).length}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Word</TableHead>
                <TableHead>Translation</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Media</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className='w-[70px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((word) => {
                const difficultyOption = getDifficultyOption(word.difficulty)
                return (
                  <TableRow key={word.id}>
                    <TableCell className='max-w-[250px]'>
                      <div className='space-y-1'>
                        <div className='font-medium truncate' title={word.word}>
                          {word.word}
                        </div>
                        <div className='text-sm text-muted-foreground line-clamp-1' title={word.definition}>
                          {word.definition}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='max-w-[200px]'>
                      <div className='space-y-1'>
                        <div className='font-medium text-sm truncate' title={word.translation}>
                          {word.translation}
                        </div>
                        <div className='text-xs text-muted-foreground line-clamp-1' title={word.sentence}>
                          {word.sentence}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant='secondary' 
                        className={`${difficultyOption.color} border-0`}
                      >
                        {difficultyOption.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1'>
                        {word.audio && (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50'
                            onClick={() => {
                              const audioUrl = getAudioUrl(word.audio || null)
                              if (audioUrl) {
                                const audio = new Audio(audioUrl)
                                audio.play().catch(console.error)
                              }
                            }}
                            title='Play audio pronunciation'
                          >
                            <Volume2 className='h-4 w-4' />
                          </Button>
                        )}
                        {word.image && (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                            onClick={() => {
                              if (onPreviewImage) {
                                onPreviewImage(word)
                              }
                            }}
                            title='View image'
                          >
                            <Image className='h-4 w-4' />
                          </Button>
                        )}
                        {!word.audio && !word.image && (
                          <span className='text-xs text-muted-foreground px-2'>No media</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Hash className='h-3 w-3 text-muted-foreground' />
                        <span className='text-sm font-mono'>
                          {word.order}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Calendar className='h-3 w-3' />
                        {new Date(word.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' className='h-8 w-8 p-0'>
                            <span className='sr-only'>Open menu</span>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onEdit(word)}>
                            <Edit className='mr-2 h-4 w-4' />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {word.audio ? (
                            <DropdownMenuItem 
                              onClick={() => {
                                const audioUrl = getAudioUrl(word.audio || null)
                                if (audioUrl) {
                                  const audio = new Audio(audioUrl)
                                  audio.play().catch(console.error)
                                }
                              }}
                            >
                              <Volume2 className='mr-2 h-4 w-4' />
                              Play Audio
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem onClick={() => onUploadMedia(word, 'audio')}>
                            <Upload className='mr-2 h-4 w-4' />
                            {word.audio ? 'Update Audio' : 'Upload Audio'}
                          </DropdownMenuItem>
                          {word.image ? (
                            <DropdownMenuItem 
                              onClick={() => {
                                if (onPreviewImage) {
                                  onPreviewImage(word)
                                }
                              }}
                            >
                              <Eye className='mr-2 h-4 w-4' />
                              View Image
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem onClick={() => onUploadMedia(word, 'image')}>
                            <Upload className='mr-2 h-4 w-4' />
                            {word.image ? 'Update Image' : 'Upload Image'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(word)}
                            className='text-red-600'
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title='Delete Word'
        desc={`Are you sure you want to delete "${selectedWord?.word}"? This action cannot be undone.`}
        confirmText='Delete'
        handleConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  BookOpen,
  Eye,
  Calendar,
  Hash,
  Type,
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
import { contentApi, type Lesson } from '@/lib/content-api'

interface LessonsTableProps {
  data: Lesson[]
  isLoading?: boolean
  onEdit: (lesson: Lesson) => void
  onViewWords: (lesson: Lesson) => void
  onRefresh: () => void
  courseName?: string
}

export function LessonsTable({
  data,
  isLoading,
  onEdit,
  onViewWords,
  onRefresh,
  courseName,
}: LessonsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const queryClient = useQueryClient()

  // Delete lesson mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => contentApi.lessons.delete(id),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      onRefresh()
      setDeleteDialogOpen(false)
      setSelectedLesson(null)
    },
    onError: (error) => {
      toast.error('Failed to delete lesson')
      console.error('Delete error:', error)
    },
  })

  const handleDelete = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedLesson) {
      deleteMutation.mutate(selectedLesson.id)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lessons</CardTitle>
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
          <CardTitle>Lessons</CardTitle>
          <CardDescription>
            {courseName ? `No lessons found in "${courseName}"` : 'No lessons found'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-8'>
            <BookOpen className='h-12 w-12 text-muted-foreground mb-4' />
            <p className='text-muted-foreground text-center'>
              {courseName 
                ? `No lessons have been created for "${courseName}" yet.`
                : 'No lessons have been created yet.'
              }
              <br />
              Click "Add Lesson" to get started.
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
                <BookOpen className='h-5 w-5 text-primary' />
                Lessons ({data.length})
                {courseName && (
                  <Badge variant='outline' className='ml-2'>
                    {courseName}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className='mt-1'>
                {courseName 
                  ? `Manage lessons for "${courseName}" course`
                  : 'Manage educational lessons and their content'
                }
              </CardDescription>
            </div>
            <div className='text-right'>
              <div className='text-sm text-muted-foreground'>Total Words</div>
              <div className='text-2xl font-bold text-primary'>
                {data.reduce((sum, l) => sum + (l.words_count || 0), 0)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lesson</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Words</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className='w-[70px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell className='max-w-[300px]'>
                    <div className='space-y-1'>
                      <div className='font-medium truncate' title={lesson.title}>
                        {lesson.title}
                      </div>
                      <div className='text-sm text-muted-foreground line-clamp-1' title={lesson.content}>
                        {lesson.content}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='max-w-[200px]'>
                    <div className='flex items-center gap-2'>
                      <BookOpen className='h-4 w-4 text-muted-foreground' />
                      <div className='min-w-0 flex-1'>
                        <div className='font-medium text-sm truncate' title={lesson.course_title || `Course ${lesson.course_id}`}>
                          {lesson.course_title || `Course ${lesson.course_id}`}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-auto p-1 hover:bg-muted/50'
                      onClick={() => onViewWords(lesson)}
                    >
                      <div className='flex items-center gap-2'>
                        <Type className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm font-medium'>
                          Words
                        </span>
                      </div>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Hash className='h-3 w-3 text-muted-foreground' />
                      <span className='text-sm font-mono'>
                        {lesson.order}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Calendar className='h-3 w-3' />
                      {new Date(lesson.created_at).toLocaleDateString()}
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
                        <DropdownMenuItem onClick={() => onViewWords(lesson)}>
                          <Eye className='mr-2 h-4 w-4' />
                          View Words
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(lesson)}>
                          <Edit className='mr-2 h-4 w-4' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(lesson)}
                          className='text-red-600'
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title='Delete Lesson'
        desc={`Are you sure you want to delete "${selectedLesson?.title}"? This action cannot be undone and will also delete all associated words.`}
        confirmText='Delete'
        handleConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}
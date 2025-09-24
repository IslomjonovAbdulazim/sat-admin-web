import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  BookOpen,
  Building2,
  Eye,
  Calendar,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { contentApi, type Course } from '@/lib/content-api'
import { type LearningCenter } from '@/lib/learning-centers-api'
import { getLogoUrl } from '@/lib/media-utils'

interface CoursesTableProps {
  data: Course[]
  learningCenters: LearningCenter[]
  isLoading?: boolean
  onEdit: (course: Course) => void
  onViewLessons: (course: Course) => void
  onRefresh: () => void
}

export function CoursesTable({
  data,
  learningCenters,
  isLoading,
  onEdit,
  onViewLessons,
  onRefresh,
}: CoursesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const queryClient = useQueryClient()

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => contentApi.courses.delete(id),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      onRefresh()
      setDeleteDialogOpen(false)
      setSelectedCourse(null)
    },
    onError: (error) => {
      toast.error('Failed to delete course')
      console.error('Delete error:', error)
    },
  })

  const handleDelete = (course: Course) => {
    setSelectedCourse(course)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedCourse) {
      deleteMutation.mutate(selectedCourse.id)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
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
          <CardTitle>Courses</CardTitle>
          <CardDescription>No courses found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-8'>
            <BookOpen className='h-12 w-12 text-muted-foreground mb-4' />
            <p className='text-muted-foreground text-center'>
              No courses have been created yet.
              <br />
              Click "Add Course" to get started.
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
                Courses ({data.length})
              </CardTitle>
              <CardDescription className='mt-1'>
                Manage educational courses and their content
              </CardDescription>
            </div>
            <div className='text-right'>
              <div className='text-sm text-muted-foreground'>Total Lessons</div>
              <div className='text-2xl font-bold text-primary'>
                {data.reduce((sum, c) => sum + (c.lessons_count || 0), 0)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Learning Center</TableHead>
                <TableHead>Lessons</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className='w-[70px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className='max-w-[350px]'>
                    <div className='space-y-1'>
                      <div className='font-medium truncate' title={course.title}>{course.title}</div>
                      {course.description && (
                        <div className='text-sm text-muted-foreground line-clamp-1' title={course.description}>
                          {course.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='max-w-[200px]'>
                    {(() => {
                      const center = learningCenters.find(c => c.id === course.learning_center_id)
                      return (
                        <div className='flex items-center gap-3'>
                          <Avatar className='h-8 w-8'>
                            <AvatarImage
                              src={getLogoUrl(center?.logo || null)}
                              alt={center?.name}
                            />
                            <AvatarFallback>
                              <Building2 className='h-4 w-4' />
                            </AvatarFallback>
                          </Avatar>
                          <div className='min-w-0 flex-1'>
                            <div className='font-medium text-sm truncate' title={center?.name || `Center ${course.learning_center_id}`}>
                              {center?.name || `Center ${course.learning_center_id}`}
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-auto p-1 hover:bg-muted/50'
                      onClick={() => onViewLessons(course)}
                    >
                      <div className='flex items-center gap-2'>
                        <Users className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm font-medium'>
                          Lessons
                        </span>
                      </div>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Calendar className='h-3 w-3' />
                      {new Date(course.created_at).toLocaleDateString()}
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
                        <DropdownMenuItem onClick={() => onViewLessons(course)}>
                          <Eye className='mr-2 h-4 w-4' />
                          View Lessons
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(course)}>
                          <Edit className='mr-2 h-4 w-4' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(course)}
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
        title='Delete Course'
        desc={`Are you sure you want to delete "${selectedCourse?.title}"? This action cannot be undone and will also delete all associated lessons and words.`}
        confirmText='Delete'
        handleConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}
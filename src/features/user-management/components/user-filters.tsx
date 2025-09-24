import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { learningCentersApi } from '@/lib/learning-centers-api'

interface UserFiltersProps {
  filters: {
    learning_center_id?: number
  }
  onFiltersChange: (filters: any) => void
  className?: string
}

export function UserFilters({ filters, onFiltersChange, className }: UserFiltersProps) {
  // Fetch learning centers for the filter dropdown
  const { data: learningCenters = [] } = useQuery({
    queryKey: ['learning-centers'],
    queryFn: () => learningCentersApi.list(),
  })


  const handleCenterChange = (centerId: string) => {
    onFiltersChange({
      ...filters,
      learning_center_id: centerId === 'all' ? undefined : parseInt(centerId),
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      learning_center_id: undefined,
    })
  }

  const hasActiveFilters = filters.learning_center_id

  return (
    <Card className={cn('bg-gray-50/50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800', className)}>
      <CardContent className='p-4'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='flex flex-1 items-center space-x-4'>

            {/* Learning Center Filter */}
            <Select 
              value={filters.learning_center_id?.toString() || 'all'} 
              onValueChange={handleCenterChange}
            >
              <SelectTrigger className='w-[180px] bg-white dark:bg-gray-950'>
                <SelectValue placeholder='Learning Center' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Centers</SelectItem>
                {(learningCenters as any[]).map((center: any) => (
                  <SelectItem key={center.id} value={center.id.toString()}>
                    {center.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant='ghost'
              size='sm'
              onClick={clearFilters}
              className='text-muted-foreground hover:text-foreground'
            >
              <X className='mr-2 h-4 w-4' />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className='mt-3 flex flex-wrap items-center gap-2'>
            <div className='flex items-center text-sm text-muted-foreground'>
              <Filter className='mr-2 h-4 w-4' />
              Active filters:
            </div>
            
            
            {filters.learning_center_id && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                Center: {(learningCenters as any[]).find((c: any) => c.id === filters.learning_center_id)?.name || `Center #${filters.learning_center_id}`}
                <X 
                  className='h-3 w-3 cursor-pointer hover:text-destructive' 
                  onClick={() => handleCenterChange('all')}
                />
              </Badge>
            )}
            
          </div>
        )}
      </CardContent>
    </Card>
  )
}
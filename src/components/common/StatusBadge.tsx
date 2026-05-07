import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'DRAFT' | 'SUBMITTED'
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (status === 'SUBMITTED') {
    return (
      <Badge
        className={cn('bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200', className)}
        variant="outline"
      >
        제출완료
      </Badge>
    )
  }

  return (
    <Badge
      className={cn('bg-gray-100 text-gray-600 hover:bg-gray-100 border-gray-200', className)}
      variant="outline"
    >
      임시저장
    </Badge>
  )
}

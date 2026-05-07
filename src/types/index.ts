// 공통 API 응답 타입 — API_SCHEME.md §1.2
export type ApiResponse<T> = {
  success: boolean
  data: T | null
  error: { code: string; message: string } | null
}

export type PaginationMeta = {
  page: number
  size: number
  totalCount: number
  totalPages: number
}

export type PaginatedResponse<T> = {
  items: T[]
  pagination: PaginationMeta
}

// 역할 — API_SCHEME.md §1.5
export type UserRole = 'SALESPERSON' | 'MANAGER' | 'ADMIN'

export type ReportStatus = 'DRAFT' | 'SUBMITTED'

export type NoteType = 'PROBLEM' | 'PLAN'

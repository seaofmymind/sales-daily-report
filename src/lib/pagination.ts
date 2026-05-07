import type { PaginationMeta, PaginatedResponse } from '@/types'

const DEFAULT_PAGE = 1
const DEFAULT_SIZE = 20
const MAX_SIZE = 100

/**
 * URLSearchParams에서 page / size를 파싱한다.
 * size는 최대 100으로 클램프한다.
 */
export function parsePagination(searchParams: URLSearchParams): { page: number; size: number } {
  const rawPage = parseInt(searchParams.get('page') ?? '', 10)
  const rawSize = parseInt(searchParams.get('size') ?? '', 10)

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : DEFAULT_PAGE
  const sizeRaw = Number.isFinite(rawSize) && rawSize > 0 ? rawSize : DEFAULT_SIZE
  const size = Math.min(sizeRaw, MAX_SIZE)

  return { page, size }
}

/**
 * 페이지네이션 메타를 계산한다.
 */
export function buildPaginationMeta(
  page: number,
  size: number,
  totalCount: number
): PaginationMeta {
  return {
    page,
    size,
    totalCount,
    totalPages: Math.ceil(totalCount / size),
  }
}

/**
 * Prisma skip / take 값을 반환한다.
 */
export function getPrismaSkipTake(page: number, size: number): { skip: number; take: number } {
  return {
    skip: (page - 1) * size,
    take: size,
  }
}

/**
 * PaginatedResponse 객체를 생성한다.
 */
export function buildPaginatedResponse<T>(
  items: T[],
  page: number,
  size: number,
  totalCount: number
): PaginatedResponse<T> {
  return {
    items,
    pagination: buildPaginationMeta(page, size, totalCount),
  }
}

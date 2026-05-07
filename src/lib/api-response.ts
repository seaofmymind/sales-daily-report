import { NextResponse } from 'next/server'
import type { ApiResponse, PaginatedResponse } from '@/types'
import type { ErrorCode } from '@/lib/error-codes'

/**
 * 성공 응답 헬퍼 — { success: true, data, error: null }
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, error: null }, { status })
}

/**
 * 페이지네이션 성공 응답 헬퍼
 */
export function paginatedResponse<T>(
  paginatedData: PaginatedResponse<T>,
  status: number = 200
): NextResponse<ApiResponse<PaginatedResponse<T>>> {
  return NextResponse.json({ success: true, data: paginatedData, error: null }, { status })
}

/**
 * 에러 응답 헬퍼 — { success: false, data: null, error: { code, message } }
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number
): NextResponse<ApiResponse<null>> {
  return NextResponse.json({ success: false, data: null, error: { code, message } }, { status })
}

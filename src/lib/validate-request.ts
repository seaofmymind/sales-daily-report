import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { errorResponse } from '@/lib/api-response'
import { ERROR_CODES } from '@/lib/error-codes'
import type { ApiResponse } from '@/types'

type ValidateBodyResult<T> =
  | { success: true; data: T; response: null }
  | { success: false; data: null; response: NextResponse<ApiResponse<null>> }

/**
 * 요청 바디를 Zod 스키마로 파싱·검증한다.
 * 실패 시 400 VALIDATION_ERROR 응답을 담은 result를 반환한다.
 */
export async function validateBody<T>(
  req: NextRequest,
  schema: z.ZodType<T>
): Promise<ValidateBodyResult<T>> {
  let raw: unknown

  try {
    raw = await req.json()
  } catch {
    return {
      success: false,
      data: null,
      response: errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        '요청 바디가 올바른 JSON 형식이 아닙니다.',
        400
      ),
    }
  }

  const result = schema.safeParse(raw)

  if (!result.success) {
    const firstIssue = result.error.issues[0]
    const message = firstIssue
      ? `${firstIssue.path.join('.') || 'value'}: ${firstIssue.message}`
      : '요청 데이터가 올바르지 않습니다.'

    return {
      success: false,
      data: null,
      response: errorResponse(ERROR_CODES.VALIDATION_ERROR, message, 400),
    }
  }

  return { success: true, data: result.data, response: null }
}

import { describe, it, expect } from 'vitest'
import { successResponse, errorResponse, paginatedResponse } from './api-response'
import { ERROR_CODES } from './error-codes'

describe('successResponse', () => {
  it('기본 상태 200으로 성공 응답을 생성한다', async () => {
    const res = successResponse({ id: 1 })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toEqual({ id: 1 })
    expect(body.error).toBeNull()
  })

  it('201 상태코드로 성공 응답을 생성한다', async () => {
    const res = successResponse({ id: 2 }, 201)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  it('data가 null이어도 성공 응답을 생성한다', async () => {
    const res = successResponse(null)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toBeNull()
  })
})

describe('errorResponse', () => {
  it('에러 응답을 올바른 구조로 생성한다', async () => {
    const res = errorResponse(ERROR_CODES.REPORT_NOT_FOUND, '보고서를 찾을 수 없습니다.', 404)
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.data).toBeNull()
    expect(body.error.code).toBe('REPORT_NOT_FOUND')
    expect(body.error.message).toBe('보고서를 찾을 수 없습니다.')
  })

  it('401 UNAUTHORIZED 응답을 생성한다', async () => {
    const res = errorResponse(ERROR_CODES.UNAUTHORIZED, '인증이 필요합니다.', 401)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error.code).toBe('UNAUTHORIZED')
  })

  it('403 FORBIDDEN 응답을 생성한다', async () => {
    const res = errorResponse(ERROR_CODES.FORBIDDEN, '권한이 없습니다.', 403)
    expect(res.status).toBe(403)
  })
})

describe('paginatedResponse', () => {
  it('페이지네이션 응답을 올바른 구조로 생성한다', async () => {
    const data = {
      items: [{ id: 1 }, { id: 2 }],
      pagination: { page: 1, size: 20, totalCount: 2, totalPages: 1 },
    }
    const res = paginatedResponse(data)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.items).toHaveLength(2)
    expect(body.data.pagination.totalCount).toBe(2)
    expect(body.error).toBeNull()
  })
})

describe('ERROR_CODES', () => {
  it('모든 공통 에러 코드가 정의되어 있다', () => {
    expect(ERROR_CODES.VALIDATION_ERROR).toBe('VALIDATION_ERROR')
    expect(ERROR_CODES.UNAUTHORIZED).toBe('UNAUTHORIZED')
    expect(ERROR_CODES.FORBIDDEN).toBe('FORBIDDEN')
    expect(ERROR_CODES.NOT_FOUND).toBe('NOT_FOUND')
    expect(ERROR_CODES.INTERNAL_SERVER_ERROR).toBe('INTERNAL_SERVER_ERROR')
  })

  it('보고서 관련 에러 코드가 정의되어 있다', () => {
    expect(ERROR_CODES.REPORT_NOT_FOUND).toBe('REPORT_NOT_FOUND')
    expect(ERROR_CODES.REPORT_ALREADY_EXISTS).toBe('REPORT_ALREADY_EXISTS')
    expect(ERROR_CODES.INVALID_REPORT_DATE).toBe('INVALID_REPORT_DATE')
    expect(ERROR_CODES.REPORT_ALREADY_SUBMITTED).toBe('REPORT_ALREADY_SUBMITTED')
  })

  it('영업 사원 마스터 에러 코드가 정의되어 있다', () => {
    expect(ERROR_CODES.SALESPERSON_NOT_FOUND).toBe('SALESPERSON_NOT_FOUND')
    expect(ERROR_CODES.EMAIL_ALREADY_EXISTS).toBe('EMAIL_ALREADY_EXISTS')
    expect(ERROR_CODES.SELF_MANAGER_REFERENCE).toBe('SELF_MANAGER_REFERENCE')
    expect(ERROR_CODES.CIRCULAR_MANAGER_REFERENCE).toBe('CIRCULAR_MANAGER_REFERENCE')
  })
})

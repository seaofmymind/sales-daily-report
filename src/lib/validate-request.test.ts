import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { validateBody } from './validate-request'
import { ERROR_CODES } from './error-codes'

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function makeInvalidJsonRequest(): NextRequest {
  return new NextRequest('http://localhost/api/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'not-valid-json',
  })
}

const testSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
})

describe('validateBody', () => {
  it('유효한 바디를 파싱하면 success: true와 데이터를 반환한다', async () => {
    const req = makeRequest({ name: '홍길동', age: 30 })
    const result = await validateBody(req, testSchema)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ name: '홍길동', age: 30 })
      expect(result.response).toBeNull()
    }
  })

  it('스키마 검증 실패 시 success: false와 400 VALIDATION_ERROR 응답을 반환한다', async () => {
    const req = makeRequest({ name: '', age: 30 })
    const result = await validateBody(req, testSchema)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.data).toBeNull()
      expect(result.response).not.toBeNull()
      const body = await result.response!.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      expect(result.response!.status).toBe(400)
    }
  })

  it('필수 필드 누락 시 VALIDATION_ERROR를 반환한다', async () => {
    const req = makeRequest({ name: '홍길동' })
    const result = await validateBody(req, testSchema)
    expect(result.success).toBe(false)
    if (!result.success) {
      const body = await result.response!.json()
      expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR)
    }
  })

  it('JSON 파싱 실패 시 VALIDATION_ERROR를 반환한다', async () => {
    const req = makeInvalidJsonRequest()
    const result = await validateBody(req, testSchema)
    expect(result.success).toBe(false)
    if (!result.success) {
      const body = await result.response!.json()
      expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      expect(result.response!.status).toBe(400)
    }
  })
})

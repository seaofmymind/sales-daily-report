import { describe, it, expect } from 'vitest'
import { loginSchema, refreshTokenSchema } from './auth.schema'

describe('auth.schema', () => {
  describe('loginSchema', () => {
    it('유효한 이메일/비밀번호를 파싱한다', () => {
      const result = loginSchema.safeParse({ email: 'hong@test.com', password: 'Test1234!' })
      expect(result.success).toBe(true)
    })

    it('이메일 형식이 올바르지 않으면 실패한다', () => {
      const result = loginSchema.safeParse({ email: 'not-an-email', password: 'Test1234!' })
      expect(result.success).toBe(false)
    })

    it('비밀번호가 빈 문자열이면 실패한다', () => {
      const result = loginSchema.safeParse({ email: 'hong@test.com', password: '' })
      expect(result.success).toBe(false)
    })

    it('이메일이 누락되면 실패한다', () => {
      const result = loginSchema.safeParse({ password: 'Test1234!' })
      expect(result.success).toBe(false)
    })

    it('비밀번호가 누락되면 실패한다', () => {
      const result = loginSchema.safeParse({ email: 'hong@test.com' })
      expect(result.success).toBe(false)
    })
  })

  describe('refreshTokenSchema', () => {
    it('유효한 refreshToken을 파싱한다', () => {
      const result = refreshTokenSchema.safeParse({ refreshToken: 'some.jwt.token' })
      expect(result.success).toBe(true)
    })

    it('refreshToken이 빈 문자열이면 실패한다', () => {
      const result = refreshTokenSchema.safeParse({ refreshToken: '' })
      expect(result.success).toBe(false)
    })

    it('refreshToken이 누락되면 실패한다', () => {
      const result = refreshTokenSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })
})

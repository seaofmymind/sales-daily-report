import { z } from 'zod'

/**
 * 로그인 요청 스키마 — POST /auth/login
 */
export const loginSchema = z.object({
  email: z.string().min(1, '이메일을 입력해 주세요.').email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(1, '비밀번호를 입력해 주세요.'),
})

export type LoginInput = z.infer<typeof loginSchema>

/**
 * 토큰 갱신 요청 스키마 — POST /auth/refresh
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, '리프레시 토큰을 입력해 주세요.'),
})

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>

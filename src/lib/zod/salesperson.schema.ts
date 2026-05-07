import { z } from 'zod'

/**
 * 영업 사원 등록/수정 요청 스키마 — POST|PUT /salespersons
 * 이메일 중복 및 순환 참조 검증은 DB 레이어에서 처리
 */
export const salespersonSchema = z.object({
  name: z.string().min(1, '이름을 입력해 주세요.').max(50, '이름은 50자 이하여야 합니다.'),
  department: z
    .string()
    .min(1, '부서를 입력해 주세요.')
    .max(100, '부서명은 100자 이하여야 합니다.'),
  position: z.string().min(1, '직급을 입력해 주세요.').max(50, '직급은 50자 이하여야 합니다.'),
  email: z.string().min(1, '이메일을 입력해 주세요.').email('올바른 이메일 형식이 아닙니다.'),
  phone: z.string().max(20, '전화번호는 20자 이하여야 합니다.').optional().nullable(),
  managerId: z
    .number({ error: 'managerId는 숫자여야 합니다.' })
    .int()
    .positive('유효한 상급자 ID를 입력해 주세요.')
    .optional()
    .nullable(),
})

export type SalespersonInput = z.infer<typeof salespersonSchema>

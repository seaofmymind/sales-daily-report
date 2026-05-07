import { z } from 'zod'

/**
 * 고객 등록/수정 요청 스키마 — POST|PUT /customers
 */
export const customerSchema = z.object({
  name: z.string().min(1, '고객명을 입력해 주세요.').max(100, '고객명은 100자 이하여야 합니다.'),
  company: z.string().min(1, '회사명을 입력해 주세요.').max(200, '회사명은 200자 이하여야 합니다.'),
  contactName: z.string().max(50, '담당자명은 50자 이하여야 합니다.').optional().nullable(),
  phone: z.string().max(20, '전화번호는 20자 이하여야 합니다.').optional().nullable(),
  email: z
    .string()
    .max(100, '이메일은 100자 이하여야 합니다.')
    .email('올바른 이메일 형식이 아닙니다.')
    .optional()
    .nullable(),
  address: z.string().max(300, '주소는 300자 이하여야 합니다.').optional().nullable(),
})

export type CustomerInput = z.infer<typeof customerSchema>

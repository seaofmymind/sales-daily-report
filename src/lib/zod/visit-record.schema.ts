import { z } from 'zod'

/**
 * HH:mm 형식 시각 검증 정규식
 */
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

/**
 * 방문 기록 추가/수정 요청 스키마 — POST|PUT /reports/{id}/visit-records
 */
export const visitRecordSchema = z.object({
  seq: z.number({ error: 'seq는 숫자여야 합니다.' }).int().positive('seq는 1 이상이어야 합니다.'),
  customerId: z
    .number({ error: 'customerId는 숫자여야 합니다.' })
    .int()
    .positive('유효한 고객 ID를 입력해 주세요.'),
  visitTime: z
    .string()
    .regex(timeRegex, '방문 시각은 HH:mm 형식이어야 합니다.')
    .optional()
    .nullable(),
  content: z.string().min(1, '방문 내용을 입력해 주세요.'),
  result: z.string().optional().nullable(),
})

export type VisitRecordInput = z.infer<typeof visitRecordSchema>

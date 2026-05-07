import { z } from 'zod'
import { visitRecordSchema } from './visit-record.schema'
import { noteTypeEnum } from './note.schema'

/**
 * YYYY-MM-DD 형식 날짜 검증 정규식
 */
const dateRegex = /^\d{4}-\d{2}-\d{2}$/

/**
 * 보고서 생성 요청 스키마 — POST /reports
 * visitRecords: 최소 1건 필수
 */
export const createReportSchema = z.object({
  reportDate: z.string().regex(dateRegex, '날짜는 YYYY-MM-DD 형식이어야 합니다.'),
  status: z.enum(['DRAFT', 'SUBMITTED'], {
    error: 'status는 DRAFT 또는 SUBMITTED이어야 합니다.',
  }),
  visitRecords: z.array(visitRecordSchema).min(1, '방문 기록은 최소 1건 이상 필요합니다.'),
  dailyNotes: z
    .array(
      z.object({
        noteType: noteTypeEnum,
        seq: z
          .number({ error: 'seq는 숫자여야 합니다.' })
          .int()
          .positive('seq는 1 이상이어야 합니다.'),
        content: z.string().min(1, '내용을 입력해 주세요.'),
      })
    )
    .optional()
    .default([]),
})

export type CreateReportInput = z.infer<typeof createReportSchema>

/**
 * 보고서 수정 요청 스키마 — PUT /reports/{id}
 * reportDate 변경 불가 — 수정 시 reportDate 필드 무시
 */
export const updateReportSchema = z.object({
  status: z.enum(['DRAFT', 'SUBMITTED'], {
    error: 'status는 DRAFT 또는 SUBMITTED이어야 합니다.',
  }),
  visitRecords: z.array(visitRecordSchema).min(1, '방문 기록은 최소 1건 이상 필요합니다.'),
  dailyNotes: z
    .array(
      z.object({
        noteType: noteTypeEnum,
        seq: z
          .number({ error: 'seq는 숫자여야 합니다.' })
          .int()
          .positive('seq는 1 이상이어야 합니다.'),
        content: z.string().min(1, '내용을 입력해 주세요.'),
      })
    )
    .optional()
    .default([]),
})

export type UpdateReportInput = z.infer<typeof updateReportSchema>

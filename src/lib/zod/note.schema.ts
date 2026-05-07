import { z } from 'zod'

/**
 * noteType enum
 */
export const noteTypeEnum = z.enum(['PROBLEM', 'PLAN'], {
  error: 'noteType은 PROBLEM 또는 PLAN이어야 합니다.',
})

/**
 * Problem/Plan 항목 추가 요청 스키마 — POST /reports/{id}/notes
 */
export const createNoteSchema = z.object({
  noteType: noteTypeEnum,
  seq: z.number({ error: 'seq는 숫자여야 합니다.' }).int().positive('seq는 1 이상이어야 합니다.'),
  content: z.string().min(1, '내용을 입력해 주세요.'),
})

export type CreateNoteInput = z.infer<typeof createNoteSchema>

/**
 * Problem/Plan 항목 수정 요청 스키마 — PUT /reports/{id}/notes/{noteId}
 * noteType 변경 불가 — 수정 시 noteType 필드 무시
 */
export const updateNoteSchema = z.object({
  seq: z.number({ error: 'seq는 숫자여야 합니다.' }).int().positive('seq는 1 이상이어야 합니다.'),
  content: z.string().min(1, '내용을 입력해 주세요.'),
})

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>

import { z } from 'zod'

/**
 * 댓글 작성/수정 요청 스키마 — POST|PUT /reports/{id}/notes/{noteId}/comments
 */
export const commentSchema = z.object({
  content: z.string().min(1, '댓글 내용을 입력해 주세요.'),
})

export type CommentInput = z.infer<typeof commentSchema>

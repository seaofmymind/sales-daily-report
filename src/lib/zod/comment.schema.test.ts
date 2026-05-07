import { describe, it, expect } from 'vitest'
import { commentSchema } from './comment.schema'

describe('commentSchema', () => {
  it('유효한 댓글 내용을 파싱한다', () => {
    const result = commentSchema.safeParse({ content: '확인 요청 바랍니다.' })
    expect(result.success).toBe(true)
  })

  it('content가 빈 문자열이면 실패한다 (TC-CMT-004)', () => {
    const result = commentSchema.safeParse({ content: '' })
    expect(result.success).toBe(false)
  })

  it('content가 누락되면 실패한다', () => {
    const result = commentSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('content가 1자인 경우 파싱한다', () => {
    const result = commentSchema.safeParse({ content: 'A' })
    expect(result.success).toBe(true)
  })
})

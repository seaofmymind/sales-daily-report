import { describe, it, expect } from 'vitest'
import { createNoteSchema, updateNoteSchema } from './note.schema'

describe('createNoteSchema', () => {
  it('PROBLEM 항목을 파싱한다', () => {
    const result = createNoteSchema.safeParse({ noteType: 'PROBLEM', seq: 1, content: '현안 내용' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.noteType).toBe('PROBLEM')
  })

  it('PLAN 항목을 파싱한다', () => {
    const result = createNoteSchema.safeParse({ noteType: 'PLAN', seq: 1, content: '계획 내용' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.noteType).toBe('PLAN')
  })

  it('PROBLEM / PLAN 이외의 noteType은 실패한다 (TC-NOTE-004)', () => {
    const result = createNoteSchema.safeParse({ noteType: 'TODO', seq: 1, content: '내용' })
    expect(result.success).toBe(false)
  })

  it('content가 빈 문자열이면 실패한다', () => {
    const result = createNoteSchema.safeParse({ noteType: 'PLAN', seq: 1, content: '' })
    expect(result.success).toBe(false)
  })

  it('seq가 누락되면 실패한다', () => {
    const result = createNoteSchema.safeParse({ noteType: 'PLAN', content: '내용' })
    expect(result.success).toBe(false)
  })
})

describe('updateNoteSchema', () => {
  it('seq와 content만으로 파싱한다', () => {
    const result = updateNoteSchema.safeParse({ seq: 2, content: '수정된 내용' })
    expect(result.success).toBe(true)
  })

  it('content가 빈 문자열이면 실패한다', () => {
    const result = updateNoteSchema.safeParse({ seq: 1, content: '' })
    expect(result.success).toBe(false)
  })

  it('noteType 필드가 포함되어도 무시되지 않고 파싱된다 (API 레이어에서 무시)', () => {
    // updateNoteSchema는 noteType을 정의하지 않으므로 unknown key는 strip된다
    const result = updateNoteSchema.safeParse({ seq: 1, content: '수정', noteType: 'PLAN' })
    expect(result.success).toBe(true)
    if (result.success) {
      // noteType은 스키마에 없으므로 파싱 결과에 포함되지 않는다
      expect('noteType' in result.data).toBe(false)
    }
  })
})

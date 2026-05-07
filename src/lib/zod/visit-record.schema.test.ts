import { describe, it, expect } from 'vitest'
import { visitRecordSchema } from './visit-record.schema'

describe('visitRecordSchema', () => {
  const validInput = {
    seq: 1,
    customerId: 10,
    visitTime: '10:00',
    content: '신제품 소개 미팅 진행',
    result: '2차 미팅 일정 협의 중',
  }

  it('유효한 방문 기록을 파싱한다', () => {
    const result = visitRecordSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('visitTime이 없어도 파싱한다', () => {
    const result = visitRecordSchema.safeParse({ ...validInput, visitTime: undefined })
    expect(result.success).toBe(true)
  })

  it('result가 없어도 파싱한다', () => {
    const result = visitRecordSchema.safeParse({ ...validInput, result: undefined })
    expect(result.success).toBe(true)
  })

  it('content가 빈 문자열이면 실패한다', () => {
    const result = visitRecordSchema.safeParse({ ...validInput, content: '' })
    expect(result.success).toBe(false)
  })

  it('content가 누락되면 실패한다', () => {
    const result = visitRecordSchema.safeParse({ seq: 1, customerId: 10 })
    expect(result.success).toBe(false)
  })

  it('customerId가 누락되면 실패한다', () => {
    const result = visitRecordSchema.safeParse({ seq: 1, content: '방문 내용' })
    expect(result.success).toBe(false)
  })

  it('visitTime이 HH:mm 형식이 아니면 실패한다', () => {
    const result = visitRecordSchema.safeParse({ ...validInput, visitTime: '10:0' })
    expect(result.success).toBe(false)
  })

  it('visitTime이 25:00이면 실패한다', () => {
    const result = visitRecordSchema.safeParse({ ...validInput, visitTime: '25:00' })
    expect(result.success).toBe(false)
  })

  it('seq가 0이면 실패한다', () => {
    const result = visitRecordSchema.safeParse({ ...validInput, seq: 0 })
    expect(result.success).toBe(false)
  })
})

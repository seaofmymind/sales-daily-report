import { describe, it, expect } from 'vitest'
import { createReportSchema, updateReportSchema } from './report.schema'

describe('createReportSchema', () => {
  const validVisitRecord = {
    seq: 1,
    customerId: 10,
    visitTime: '10:00',
    content: '신제품 소개 미팅',
    result: '2차 협의 예정',
  }

  const validInput = {
    reportDate: '2026-05-07',
    status: 'DRAFT' as const,
    visitRecords: [validVisitRecord],
    dailyNotes: [{ noteType: 'PROBLEM' as const, seq: 1, content: 'ABC사 계약 지연' }],
  }

  it('유효한 보고서 생성 데이터를 파싱한다 (TC-RPT-007)', () => {
    const result = createReportSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('dailyNotes가 없어도 파싱한다', () => {
    const result = createReportSchema.safeParse({ ...validInput, dailyNotes: undefined })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.dailyNotes).toEqual([])
  })

  it('visitRecords가 빈 배열이면 실패한다 (TC-RPT-010)', () => {
    const result = createReportSchema.safeParse({ ...validInput, visitRecords: [] })
    expect(result.success).toBe(false)
  })

  it('reportDate가 YYYY-MM-DD 형식이 아니면 실패한다', () => {
    const result = createReportSchema.safeParse({ ...validInput, reportDate: '2026/05/07' })
    expect(result.success).toBe(false)
  })

  it('status가 DRAFT / SUBMITTED 이외이면 실패한다', () => {
    const result = createReportSchema.safeParse({ ...validInput, status: 'PENDING' })
    expect(result.success).toBe(false)
  })

  it('visitRecord의 content가 빈 문자열이면 실패한다', () => {
    const result = createReportSchema.safeParse({
      ...validInput,
      visitRecords: [{ ...validVisitRecord, content: '' }],
    })
    expect(result.success).toBe(false)
  })

  it('dailyNote의 noteType이 PROBLEM / PLAN 이외이면 실패한다', () => {
    const result = createReportSchema.safeParse({
      ...validInput,
      dailyNotes: [{ noteType: 'TODO', seq: 1, content: '내용' }],
    })
    expect(result.success).toBe(false)
  })

  it('SUBMITTED 상태로 생성할 수 있다', () => {
    const result = createReportSchema.safeParse({ ...validInput, status: 'SUBMITTED' })
    expect(result.success).toBe(true)
  })
})

describe('updateReportSchema', () => {
  const validInput = {
    status: 'DRAFT' as const,
    visitRecords: [{ seq: 1, customerId: 10, content: '수정된 방문 내용' }],
  }

  it('유효한 보고서 수정 데이터를 파싱한다 (TC-RPT-011)', () => {
    const result = updateReportSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('visitRecords가 빈 배열이면 실패한다', () => {
    const result = updateReportSchema.safeParse({ ...validInput, visitRecords: [] })
    expect(result.success).toBe(false)
  })

  it('reportDate 필드가 포함되어도 strip되어 파싱된다', () => {
    const result = updateReportSchema.safeParse({ ...validInput, reportDate: '2026-05-07' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect('reportDate' in result.data).toBe(false)
    }
  })
})

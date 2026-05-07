import { describe, it, expect } from 'vitest'
import { customerSchema } from './customer.schema'

describe('customerSchema', () => {
  const validInput = {
    name: '김철수',
    company: '(주)ABC',
    contactName: '김철수',
    phone: '02-1234-5678',
    email: 'kim@abc.com',
    address: '서울시 강남구',
  }

  it('유효한 고객 정보를 파싱한다', () => {
    const result = customerSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('선택 필드가 없어도 파싱한다', () => {
    const result = customerSchema.safeParse({ name: '박영희', company: '(주)DEF' })
    expect(result.success).toBe(true)
  })

  it('name이 빈 문자열이면 실패한다 (TC-CUST-003)', () => {
    const result = customerSchema.safeParse({ ...validInput, name: '' })
    expect(result.success).toBe(false)
  })

  it('name이 누락되면 실패한다 (TC-CUST-003)', () => {
    const result = customerSchema.safeParse({ company: validInput.company })
    expect(result.success).toBe(false)
  })

  it('company가 빈 문자열이면 실패한다', () => {
    const result = customerSchema.safeParse({ ...validInput, company: '' })
    expect(result.success).toBe(false)
  })

  it('이메일 형식이 올바르지 않으면 실패한다 (TC-CUST-004)', () => {
    const result = customerSchema.safeParse({ ...validInput, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('name이 100자를 초과하면 실패한다', () => {
    const result = customerSchema.safeParse({ ...validInput, name: 'A'.repeat(101) })
    expect(result.success).toBe(false)
  })

  it('company가 200자를 초과하면 실패한다', () => {
    const result = customerSchema.safeParse({ ...validInput, company: 'B'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('email이 null이면 파싱한다', () => {
    const result = customerSchema.safeParse({ ...validInput, email: null })
    expect(result.success).toBe(true)
  })
})

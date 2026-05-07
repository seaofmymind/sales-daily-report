import { describe, it, expect } from 'vitest'
import { salespersonSchema } from './salesperson.schema'

describe('salespersonSchema', () => {
  const validInput = {
    name: '홍길동',
    department: '영업1팀',
    position: '대리',
    email: 'hong@test.com',
    phone: '010-1234-5678',
    managerId: 5,
  }

  it('유효한 사원 정보를 파싱한다', () => {
    const result = salespersonSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('managerId가 없어도 파싱한다', () => {
    const result = salespersonSchema.safeParse({ ...validInput, managerId: undefined })
    expect(result.success).toBe(true)
  })

  it('phone이 없어도 파싱한다', () => {
    const result = salespersonSchema.safeParse({ ...validInput, phone: undefined })
    expect(result.success).toBe(true)
  })

  it('name이 빈 문자열이면 실패한다', () => {
    const result = salespersonSchema.safeParse({ ...validInput, name: '' })
    expect(result.success).toBe(false)
  })

  it('email이 형식에 맞지 않으면 실패한다', () => {
    const result = salespersonSchema.safeParse({ ...validInput, email: 'not-email' })
    expect(result.success).toBe(false)
  })

  it('email이 누락되면 실패한다', () => {
    const result = salespersonSchema.safeParse({
      name: validInput.name,
      department: validInput.department,
      position: validInput.position,
    })
    expect(result.success).toBe(false)
  })

  it('department가 누락되면 실패한다', () => {
    const result = salespersonSchema.safeParse({
      name: validInput.name,
      position: validInput.position,
      email: validInput.email,
    })
    expect(result.success).toBe(false)
  })

  it('position이 누락되면 실패한다', () => {
    const result = salespersonSchema.safeParse({
      name: validInput.name,
      department: validInput.department,
      email: validInput.email,
    })
    expect(result.success).toBe(false)
  })

  it('name이 50자를 초과하면 실패한다', () => {
    const result = salespersonSchema.safeParse({ ...validInput, name: 'A'.repeat(51) })
    expect(result.success).toBe(false)
  })

  it('managerId가 null이면 파싱한다', () => {
    const result = salespersonSchema.safeParse({ ...validInput, managerId: null })
    expect(result.success).toBe(true)
  })
})

import { describe, it, expect } from 'vitest'
import type { ApiResponse, UserRole, ReportStatus, NoteType } from './index'

describe('타입 정의 smoke test', () => {
  it('ApiResponse 성공 구조를 만족한다', () => {
    const res: ApiResponse<{ id: number }> = { success: true, data: { id: 1 }, error: null }
    expect(res.success).toBe(true)
    expect(res.data?.id).toBe(1)
  })

  it('ApiResponse 실패 구조를 만족한다', () => {
    const res: ApiResponse<null> = {
      success: false,
      data: null,
      error: { code: 'NOT_FOUND', message: '없음' },
    }
    expect(res.success).toBe(false)
    expect(res.error?.code).toBe('NOT_FOUND')
  })

  it('UserRole 값이 올바르다', () => {
    const roles: UserRole[] = ['SALESPERSON', 'MANAGER', 'ADMIN']
    expect(roles).toHaveLength(3)
  })

  it('ReportStatus 값이 올바르다', () => {
    const statuses: ReportStatus[] = ['DRAFT', 'SUBMITTED']
    expect(statuses).toHaveLength(2)
  })

  it('NoteType 값이 올바르다', () => {
    const types: NoteType[] = ['PROBLEM', 'PLAN']
    expect(types).toHaveLength(2)
  })
})

import { describe, it, expect } from 'vitest'
import {
  parsePagination,
  buildPaginationMeta,
  getPrismaSkipTake,
  buildPaginatedResponse,
} from './pagination'

describe('parsePagination', () => {
  it('기본값: page=1, size=20', () => {
    const params = new URLSearchParams()
    expect(parsePagination(params)).toEqual({ page: 1, size: 20 })
  })

  it('page=2, size=10을 파싱한다', () => {
    const params = new URLSearchParams({ page: '2', size: '10' })
    expect(parsePagination(params)).toEqual({ page: 2, size: 10 })
  })

  it('size가 100을 초과하면 100으로 클램프한다', () => {
    const params = new URLSearchParams({ size: '200' })
    expect(parsePagination(params)).toEqual({ page: 1, size: 100 })
  })

  it('page가 음수이면 기본값 1을 사용한다', () => {
    const params = new URLSearchParams({ page: '-1' })
    expect(parsePagination(params)).toEqual({ page: 1, size: 20 })
  })

  it('page가 0이면 기본값 1을 사용한다', () => {
    const params = new URLSearchParams({ page: '0' })
    expect(parsePagination(params)).toEqual({ page: 1, size: 20 })
  })

  it('page가 문자열이면 기본값 1을 사용한다', () => {
    const params = new URLSearchParams({ page: 'abc' })
    expect(parsePagination(params)).toEqual({ page: 1, size: 20 })
  })

  it('size가 문자열이면 기본값 20을 사용한다', () => {
    const params = new URLSearchParams({ size: 'abc' })
    expect(parsePagination(params)).toEqual({ page: 1, size: 20 })
  })
})

describe('buildPaginationMeta', () => {
  it('totalPages를 올바르게 계산한다', () => {
    expect(buildPaginationMeta(1, 20, 45)).toEqual({
      page: 1,
      size: 20,
      totalCount: 45,
      totalPages: 3,
    })
  })

  it('totalCount가 size의 배수이면 나머지 없이 계산한다', () => {
    expect(buildPaginationMeta(1, 20, 40)).toEqual({
      page: 1,
      size: 20,
      totalCount: 40,
      totalPages: 2,
    })
  })

  it('totalCount가 0이면 totalPages는 0이다', () => {
    expect(buildPaginationMeta(1, 20, 0)).toEqual({
      page: 1,
      size: 20,
      totalCount: 0,
      totalPages: 0,
    })
  })
})

describe('getPrismaSkipTake', () => {
  it('page=1, size=20이면 skip=0, take=20', () => {
    expect(getPrismaSkipTake(1, 20)).toEqual({ skip: 0, take: 20 })
  })

  it('page=2, size=20이면 skip=20, take=20', () => {
    expect(getPrismaSkipTake(2, 20)).toEqual({ skip: 20, take: 20 })
  })

  it('page=3, size=10이면 skip=20, take=10', () => {
    expect(getPrismaSkipTake(3, 10)).toEqual({ skip: 20, take: 10 })
  })
})

describe('buildPaginatedResponse', () => {
  it('items와 pagination을 포함한 응답을 생성한다', () => {
    const items = [{ id: 1 }, { id: 2 }]
    const result = buildPaginatedResponse(items, 1, 20, 2)
    expect(result.items).toEqual(items)
    expect(result.pagination).toEqual({ page: 1, size: 20, totalCount: 2, totalPages: 1 })
  })
})

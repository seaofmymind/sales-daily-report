'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ShieldOff, FileQuestion } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ErrorPageProps {
  code: 403 | 404 | 500
  message?: string
}

const errorConfig: Record<
  403 | 404 | 500,
  { title: string; defaultMessage: string; icon: React.ComponentType<{ className?: string }> }
> = {
  403: {
    title: '접근 권한이 없습니다',
    defaultMessage: '이 페이지에 접근할 권한이 없습니다.',
    icon: ShieldOff,
  },
  404: {
    title: '페이지를 찾을 수 없습니다',
    defaultMessage: '요청하신 페이지가 존재하지 않거나 삭제되었습니다.',
    icon: FileQuestion,
  },
  500: {
    title: '서버 오류가 발생했습니다',
    defaultMessage: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    icon: AlertTriangle,
  },
}

export function ErrorPage({ code, message }: ErrorPageProps) {
  const router = useRouter()
  const config = errorConfig[code]
  const Icon = config.icon

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">오류 {code}</p>
        <h1 className="text-2xl font-bold tracking-tight">{config.title}</h1>
        <p className="max-w-sm text-muted-foreground">{message ?? config.defaultMessage}</p>
      </div>
      <Button variant="outline" onClick={() => router.back()}>
        이전 페이지로 돌아가기
      </Button>
    </div>
  )
}

'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, BarChart2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface UserInfo {
  id: number
  name: string
  role: 'SALESPERSON' | 'MANAGER' | 'ADMIN'
  department?: string
  position?: string
}

function getUserFromLocalStorage(): UserInfo | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw) as UserInfo
  } catch {
    return null
  }
}

const navItems = [
  { href: '/dashboard', label: '대시보드' },
  { href: '/reports', label: '보고서 목록' },
]

const adminNavItem = { href: '/master/customers', label: '마스터 관리' }

export function GlobalHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = React.useState<UserInfo | null>(null)

  React.useEffect(() => {
    setUser(getUserFromLocalStorage())
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    router.push('/login')
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-primary">
          <BarChart2 className="h-5 w-5" />
          <span className="hidden sm:inline">영업 보고 시스템</span>
        </Link>

        <Separator orientation="vertical" className="mx-4 h-6" />

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                isActive(item.href)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
          {user?.role === 'ADMIN' && (
            <Link
              href={adminNavItem.href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                isActive(adminNavItem.href)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {adminNavItem.label}
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.name}
              {user.position ? ` (${user.position})` : ''}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">로그아웃</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

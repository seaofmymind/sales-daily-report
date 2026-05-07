import * as React from 'react'

import { GlobalHeader } from '@/components/layout/GlobalHeader'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <GlobalHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  )
}

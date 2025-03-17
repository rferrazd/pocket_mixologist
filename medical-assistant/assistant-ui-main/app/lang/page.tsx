'use client'

import { Shadcn } from '@/components/assistant-ui/shadcn'
import { MyRuntimeProvider } from './MyRuntimeProvider'

export default function Home() {
  return (
    <MyRuntimeProvider>
      <main className="h-dvh">
        <Shadcn />
      </main>
    </MyRuntimeProvider>
  )
}

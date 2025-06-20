'use client'
import React from 'react'
import AuthSessionProvider from './AuthSessionProvider'
import { SearchStatusProvider } from '@/context/SearchStatusContext'

export default function RootClientProviders({ children }: { children: React.ReactNode }) {
  const isClient = typeof window !== 'undefined'
  if (!isClient) return <>{children}</>
  return (
    <AuthSessionProvider>
      <SearchStatusProvider>{children}</SearchStatusProvider>
    </AuthSessionProvider>
  )
}

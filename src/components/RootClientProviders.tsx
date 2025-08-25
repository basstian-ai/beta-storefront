'use client'
import React from 'react'
import AuthSessionProvider from './AuthSessionProvider'
import { SearchStatusProvider } from '@/contexts/SearchStatusContext'

export default function RootClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <SearchStatusProvider>{children}</SearchStatusProvider>
    </AuthSessionProvider>
  )
}

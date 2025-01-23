import type { NavigateOptions } from 'react-router-dom'

import { HeroUIProvider } from "@heroui/system"
import { useHref, useNavigate } from 'react-router-dom'
import { AuthProvider } from './config/auth-provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AwardsProvider } from './hooks/awards-context'

declare module '@react-types/shared' {
  interface RouterConfig {
    routerOptions: NavigateOptions
  }
}

const queryClient = new QueryClient()

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <Toaster />
      <QueryClientProvider client={queryClient}>
        <AwardsProvider>
          <AuthProvider>{children}</AuthProvider>
        </AwardsProvider>
      </QueryClientProvider>
    </HeroUIProvider>
  )
}

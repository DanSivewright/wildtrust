import React from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <NuqsAdapter>{children}</NuqsAdapter>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}

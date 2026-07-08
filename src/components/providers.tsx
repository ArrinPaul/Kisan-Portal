"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from "@/hooks/use-language"
import { FarmerModeProvider } from "@/hooks/use-farmer-mode"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <LanguageProvider>
        <FarmerModeProvider>
          {children}
          <Toaster />
        </FarmerModeProvider>
      </LanguageProvider>
    </NextThemesProvider>
  )
}

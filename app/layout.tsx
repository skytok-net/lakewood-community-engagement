import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import { ATProvider } from "@/components/at-provider"
import { AiRuntimeProvider } from "@/components/ai-runtime-provider"

export const metadata = {
      generator: 'v0.dev'
    };

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AiRuntimeProvider>
          <ATProvider>
            <Header />
            {children}
            <Toaster />
          </ATProvider>
          </AiRuntimeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

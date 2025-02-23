"use client"

import { createContext, type ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useSession } from "@/hooks/use-session"

interface ATContextProps {
  children: ReactNode
}

interface ATContextValue {
  auth: ReturnType<typeof useAuth>
}

const ATContext = createContext<ATContextValue | null>(null)

export const ATProvider = ({ children }: ATContextProps) => {
  const auth = useAuth()
  if (!auth) throw new Error("useAuth must be used within an ATProvider")

  // Initialize session management
  useSession()

  return <ATContext.Provider value={{ auth }}>{children}</ATContext.Provider>
}

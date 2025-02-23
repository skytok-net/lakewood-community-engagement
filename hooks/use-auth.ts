"use client"

import { useAuthStore } from "@/stores/auth-store"

export function useAuth() {
  const { 
    isAuthenticated, 
    isLoading, 
    login, 
    logout, 
    resumeSession, 
    register, 
    agent, 
    session,
    user
  } = useAuthStore()

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    resumeSession,
    register,
    agent,
    session,
    user
  }
}


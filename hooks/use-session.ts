"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth-store"

export function useSession() {
  const { resumeSession, validateSession } = useAuthStore()

  useEffect(() => {
    const initSession = async () => {
      const session = await resumeSession()
      if (session) {
        // Periodically validate the session
        const validateInterval = setInterval(async () => {
          const isValid = await validateSession()
          if (!isValid) {
            clearInterval(validateInterval)
          }
        }, 5 * 60 * 1000) // Check every 5 minutes

        // Cleanup interval on unmount
        return () => clearInterval(validateInterval)
      }
    }

    initSession()
  }, [resumeSession, validateSession])
}

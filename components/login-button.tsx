"use client"

import { useAtStore } from "@/lib/at-store"
import { Button } from "@/components/ui/button"

export function LoginButton() {
  const { isAuthenticated, login, logout } = useAtStore()

  return (
    <Button onClick={isAuthenticated ? logout : login} className="mb-4">
      {isAuthenticated ? "Logout" : "Login with BlueSky"}
    </Button>
  )
}


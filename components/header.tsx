"use client"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoonIcon, SunIcon, User, Settings, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { Loader2 } from "lucide-react"

export function Header() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0A0A1E] text-white">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/26369f67-f2dc-4ce1-9311-3f37d74afe75-KP2pW9t3ogWLszAxdHhOfXZaCjBaUh.png"
            alt="SkyTok Logo"
            width={120}
            height={40}
            style={{ width: "auto", height: "32px" }}
          />
          <span className="font-semibold text-lg">Community Engagement</span>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-white hover:bg-[#1E1E3F]"
          >
            <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {isLoading ? (
            <Button disabled className="bg-[#9966FF] hover:bg-[#8A5CE6] text-white">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.displayName || user.handle} />
                    <AvatarFallback>{user.handle[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={login} className="bg-[#9966FF] hover:bg-[#8A5CE6] text-white">
              Login with AT Protocol
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}


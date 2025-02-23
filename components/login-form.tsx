"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"

export function LoginForm() {
  const [handle, setHandle] = useState("")
  const [password, setPassword] = useState("")
  const [pdsServer, setPdsServer] = useState("https://bsky.social")
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(handle, password, pdsServer)
      toast({
        title: "Login successful",
        description: "You have been logged in successfully.",
      })
      router.push("/") // Redirect to home page after successful login
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your details to login to your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="handle">Handle</Label>
              <Input
                id="handle"
                placeholder="Your AT Protocol handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="pdsServer">PDS Server</Label>
              <Input
                id="pdsServer"
                placeholder="https://bsky.social"
                value={pdsServer}
                onChange={(e) => setPdsServer(e.target.value)}
              />
            </div>
          </div>
          <Button className="w-full mt-4" type="submit">
            Login
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-center w-full">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}


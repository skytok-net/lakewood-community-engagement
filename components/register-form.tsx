"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  handle: z.string().min(3, "Handle must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  pdsServer: z.string().url("Invalid PDS server URL"),
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    handle: "",
    email: "",
    password: "",
    pdsServer: "https://bsky.social",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({})
  const router = useRouter()
  const { toast } = useToast()
  const { register } = useAuth()

  const handleChange = (field: keyof RegisterFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Validate form data
      const validatedData = registerSchema.parse(formData)
      
      // Attempt registration
      const result = await register(
        validatedData.name,
        validatedData.handle,
        validatedData.email,
        validatedData.password,
        validatedData.pdsServer
      )
      if (result instanceof Error) {
        throw result
      }
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      })
      router.push("/login")
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const newErrors: Partial<Record<keyof RegisterFormData, string>> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof RegisterFormData] = err.message
          }
        })
        setErrors(newErrors)
      } else {
        // Handle other errors
        toast({
          title: "Registration failed",
          description: "There was an error creating your account. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create a new account to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange("name")}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="handle">Handle</Label>
              <Input
                id="handle"
                placeholder="Your AT Protocol handle"
                value={formData.handle}
                onChange={handleChange("handle")}
                aria-invalid={!!errors.handle}
              />
              {errors.handle && <p className="text-sm text-destructive">{errors.handle}</p>}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email address"
                value={formData.email}
                onChange={handleChange("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange("password")}
                aria-invalid={!!errors.password}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="pdsServer">PDS Server</Label>
              <Input
                id="pdsServer"
                placeholder="https://bsky.social"
                value={formData.pdsServer}
                onChange={handleChange("pdsServer")}
                aria-invalid={!!errors.pdsServer}
              />
              {errors.pdsServer && <p className="text-sm text-destructive">{errors.pdsServer}</p>}
            </div>
          </div>
          <Button className="w-full mt-4" type="submit">
            Register
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-center w-full">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

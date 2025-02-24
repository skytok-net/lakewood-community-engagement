"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { AtpAgent, type AtpSessionData, type AtpSessionEvent } from "@atproto/api"
import type { AuthState, User } from "@/types"
import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { supabase } from "@/lib/supabaseClient"
import { randomUUID } from "crypto"
import type { UserInsert } from "@/types"

interface AuthStore extends AuthState {
  agent: AtpAgent | null
  login: (identifier: string, email: string, password: string, service: string) => Promise<User | Error>
  logout: () => Promise<void>
  register: (name: string, handle: string, email: string, password: string, service: string) => Promise<User | Error>
  setUser: (user: User | null) => void
  profile: ProfileViewDetailed | null
  isLoading: boolean
  session: AtpSessionData | null
  resumeSession: () => Promise<AtpSessionData | null>
  validateSession: () => Promise<boolean>
  clearError: () => void
}

const createAgent = (service: string, set: (state: Partial<AuthStore>) => void) => {
  return new AtpAgent({
    service,
    persistSession: (event: AtpSessionEvent, session: AtpSessionData | undefined) => {
      if (typeof window === "undefined") return
      if (event === "create" || event === "update") {
        set({ session, isAuthenticated: true })
        localStorage.setItem("authState", JSON.stringify({ session }))
      } else {
        set({ session: null, agent: null, user: null, isAuthenticated: false })
        localStorage.removeItem("authState")
      }
    },
  })
}

const storage = createJSONStorage(() => {
  if (typeof window === "undefined") {
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve()
    }
  }
  return localStorage
})

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      agent: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      profile: null,
      session: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      clearError: () => set({ error: null }),

      resumeSession: async () => {
        try {
          if (typeof window === "undefined") return null
          
          const storedData = localStorage.getItem("authState")
          if (!storedData) return null
          
          const { session } = JSON.parse(storedData)
          if (!session?.did || !session?.accessJwt || !session?.refreshJwt) {
            localStorage.removeItem("authState")
            return null
          }

          set({ session, isAuthenticated: true, isLoading: true })
          
          const agent = createAgent(session.service || "https://bsky.social", set)
          try {
            await agent.resumeSession(session)
            set({ agent, isLoading: false })
            return session
          } catch (error) {
            console.error("Session validation failed:", error)
            set({ 
              session: null, 
              isAuthenticated: false, 
              agent: null, 
              error: error as Error,
              isLoading: false 
            })
            localStorage.removeItem("authState")
            return null
          }
        } catch (error) {
          console.error("Error resuming session:", error)
          set({ 
            session: null, 
            isAuthenticated: false, 
            agent: null, 
            error: error as Error,
            isLoading: false 
          })
          localStorage.removeItem("authState")
          return null
        }
      },

      validateSession: async () => {
        const state = get()
        if (!state.session || !state.agent) return false
        
        try {
          set({ isLoading: true, error: null })
          await state.agent.resumeSession(state.session)
          set({ isLoading: false })
          return true
        } catch (error) {
          console.error("Session validation failed:", error)
          set({ 
            session: null, 
            isAuthenticated: false, 
            agent: null, 
            error: error as Error,
            isLoading: false,
            profile: null,
            user: null
          })
          return false
        }
      },

      login: async (identifier: string, email: string, password: string, service: string) : Promise<User | Error> =>  {
        try {
          set({ isLoading: true, error: null })
          
          const agent = createAgent(service, set)
          const res = await agent.login({ identifier, password })

          if (!res.success || !res.data) throw new Error("Login failed")

          const profileRes = await agent.getProfile()

          if (!profileRes.success || !profileRes.data) throw new Error("Failed to get profile")

          //set({ agent })
          
          const { data: existingUser, error: fetchError } = await supabase
          .schema('dallas') 
            .from("users")
            .select()
            .eq("email", email)
            .single()
          
          if (fetchError && fetchError.code !== "PGRST116") {
            throw fetchError
          }
          
          if (!existingUser) {
            const newUser: UserInsert = {
              id: randomUUID(),
              did: res.data.did,
              service,
              avatar: profileRes.data.avatar,
              display_name: profileRes.data.displayName || identifier,
              email,
              handle: identifier,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
            
            const { data: u, error: insertError } = await supabase
              .schema('dallas') 
              .from("users")
              .insert(newUser)
              .select()
              .single()
              
            if (insertError) throw insertError

            const userReturned = {
              ...newUser,
              id: u?.id,
            } as User
            
            set({ 
              user: userReturned, 
              isAuthenticated: true, 
              isLoading: false, 
              agent, 
              session: agent.session, 
              error: null, 
              profile: profileRes.data
            })
            return userReturned
          }

          const userReturned = {
            ...existingUser,
            id: existingUser.id,
          } as User

          set({ 
            user: userReturned, 
            isAuthenticated: true, 
            isLoading: false, 
            profile: profileRes.data,
            agent, 
            session: agent.session,
            error: null
          })
          return userReturned
          
        } catch (error) {
          console.error("Login failed:", error)
          set({ 
            error: error as Error, 
            isLoading: false, 
            user: null, 
            isAuthenticated: false, 
            agent: null ,
            session: null,
            profile: null
          })
          return error as Error
        }
      },

      register: async (name: string, handle: string, email: string, password: string, service: string) => {
        try {
          set({ isLoading: true, error: null })
          
          const agent = createAgent(service, set)
          const res = await agent.createAccount({ handle, password, email })

          if (!res.success) throw new Error("Failed to create account")
          
          const profileRes = await agent.getProfile()
          if (!profileRes.success) throw new Error("Failed to get profile")
          
          const newUser: UserInsert = {
            id: randomUUID(),
              did: res.data.did,
              service,
              avatar: profileRes.data.avatar,
              display_name: profileRes.data.displayName || handle,
              email,
              handle,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
          }
          
          const { data: user, error: insertError } = await supabase
            .schema('dallas')
            .from("users")
            .insert(newUser)
            .select()
            .single()
            
          if (insertError) throw insertError

          const userReturned = {
            ...newUser,
            id: user?.id,
          } as User

          set({ user: userReturned, agent, isAuthenticated: true, isLoading: false })
          return userReturned
          
        } catch (error) {
          console.error("Registration failed:", error)
          set({ 
            error: error as Error, 
            isLoading: false, 
            user: null, 
            isAuthenticated: false, 
            agent: null ,
            session: null,
            profile: null
          })
          return error as Error
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null })
          
          const state = get()
          if (state.agent) {
            await state.agent.logout()
          }
          
          localStorage.removeItem("authState")
          
          set({
            user: null,
            agent: null,
            session: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false
          })
          
        } catch (error) {
          console.error("Logout failed:", error)
          set({ error: error as Error, isLoading: false })
          throw error
        }
      }
    }),
    {
      name: "auth-store",
      storage,
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

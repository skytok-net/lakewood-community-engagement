"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { StoreApi } from "zustand"
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
}

let globalAgent: AtpAgent | null = null

const getAgent = (service: string, set: (state: Partial<AuthStore>) => void, get: StoreApi<AuthStore>["getState"]) => {
  if (!globalAgent) {
    globalAgent = new AtpAgent({
      service,
      persistSession: (event: AtpSessionEvent, session: AtpSessionData | undefined) => {
        if (typeof window === "undefined") return
        if (event === "create" || event === "update") {
          set({ session, isAuthenticated: true })
          localStorage.setItem("authState", JSON.stringify({ session }))
        } else {
          set({ session: null, agent: null, user: null, isAuthenticated: false })
          localStorage.removeItem("authState")
          globalAgent = null
        }
      },
    })
  }
  return globalAgent
}

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

          set({ session, isAuthenticated: true })
          
          // Validate the session is still valid
          const agent = getAgent(session.service || "https://bsky.social", set, get)
          try {
            await agent.resumeSession(session)
            set({ agent })
            return session
          } catch (error) {
            console.error("Session validation failed:", error)
            set({ session: null, isAuthenticated: false, agent: null })
            localStorage.removeItem("authState")
            return null
          }
        } catch (error) {
          console.error("Error resuming session:", error)
          set({ session: null, isAuthenticated: false, agent: null })
          localStorage.removeItem("authState")
          return null
        }
      },

      validateSession: async () => {
        const state = get()
        if (!state.session || !state.agent) return false
        
        try {
          await state.agent.resumeSession(state.session)
          return true
        } catch (error) {
          console.error("Session validation failed:", error)
          set({ session: null, isAuthenticated: false, agent: null })
          localStorage.removeItem("authState")
          return false
        }
      },

      login: async (identifier: string, email: string, password: string, service: string): Promise<User | Error> => {
        try {
          set({ isLoading: true })
          const agent = getAgent(service, set, get)

          const loginResponse = await agent.login({ identifier, password })

          if (!loginResponse.success || !loginResponse.data?.did) {
            throw new Error("Failed to login")
          }

          const response = await agent.getProfile()
          if (!response.data || !response.success) {
            throw new Error("Failed to get profile")
          }

          const { data: userData, error: userError } = await supabase
            .schema('dallas')
            .from('users')
            .select('*')
            .eq('did', response.data.did)
            .single()

          if (userError) {
            console.error("Error fetching user:", userError)
            throw userError
          }

          const id = userData?.id || randomUUID()

          const newUser: UserInsert = {
            id,
            did: response.data.did,
            handle: response.data.handle,
            email,
            display_name: response.data.displayName || 'anonymous',
            avatar: response.data.avatar || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          if (!userData) {
            const { error: insertError } = await supabase
              .schema('dallas')
              .from('users')
              .insert([newUser])

            if (insertError) {
              console.error("Error creating user:", insertError)
              throw insertError
            }
          }

          const user: User = {
            id,
            did: response.data.did,
            handle: response.data.handle,
            email,
            displayName: response.data.displayName || 'anonymous',
            avatar: response.data.avatar,
            profile: response.data
          }

          set({ 
            user,
            agent,
            profile: response.data,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

          return user
        } catch (error) {
          set({ 
            isLoading: false,
            error: error instanceof Error ? error : new Error('Unknown error occurred')
          })
          return error instanceof Error ? error : new Error('Unknown error occurred')
        }
      },

      register: async (name: string, handle: string, email: string, password: string, service: string): Promise<User | Error> => {
        try {
          set({ isLoading: true })
          const agent = getAgent(service, set, get)
          const result = await agent.createAccount({ handle, email, password })
          
          if (!result.success) {
            throw new Error("Failed to create account")
          }

          return await get().login(handle, email, password, service)
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error : new Error('Unknown error occurred') })
          return error instanceof Error ? error : new Error('Unknown error occurred')
        }
      },

      logout: async () => {
        try {
          const agent = get().agent
          if (agent) {
            await agent.logout()
          }
          set({ 
            user: null,
            agent: null,
            profile: null,
            isAuthenticated: false,
            session: null,
            error: null
          })
        } catch (error) {
          console.error("Error during logout:", error)
          set({ error: error instanceof Error ? error : new Error('Unknown error occurred') })
        }
      }
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        }
      }),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        session: state.session
      })
    }
  )
)

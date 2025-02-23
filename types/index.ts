import type { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import type { AtpAgent } from "@atproto/api"

import type { Database } from '@/types/supabase'

export type Comment = Database['dallas']['Tables']['comments']['Row']
export type CommentInsert = Database['dallas']['Tables']['comments']['Insert']
export type CommentUpdate = Database['dallas']['Tables']['comments']['Update']

export type Post = Database['dallas']['Tables']['posts']['Row']
export type PostInsert = Database['dallas']['Tables']['posts']['Insert']
export type PostUpdate = Database['dallas']['Tables']['posts']['Update']

export type Profile = Database['dallas']['Tables']['user_profiles']['Row']
export type ProfileInsert = Database['dallas']['Tables']['user_profiles']['Insert']
export type ProfileUpdate = Database['dallas']['Tables']['user_profiles']['Update']

export type Reaction = Database['dallas']['Tables']['reactions']['Row']
export type ReactionInsert = Database['dallas']['Tables']['reactions']['Insert']
export type ReactionUpdate = Database['dallas']['Tables']['reactions']['Update']

export type DbUser = Database['dallas']['Tables']['users']['Row']
export type UserInsert = Database['dallas']['Tables']['users']['Insert']
export type UserUpdate = Database['dallas']['Tables']['users']['Update']

export type Property = Database['dallas']['Tables']['properties']['Row']
export type PropertyInsert = Database['dallas']['Tables']['properties']['Insert']
export type PropertyUpdate = Database['dallas']['Tables']['properties']['Update']

export type NewsItem = Database['dallas']['Tables']['news_items']['Row']
export type NewsItemInsert = Database['dallas']['Tables']['news_items']['Insert']
export type NewsItemUpdate = Database['dallas']['Tables']['news_items']['Update']

export interface User {
  id: string
  did: string
  handle: string
  email: string
  displayName?: string
  avatar?: string
  profile?: ProfileViewDetailed
}

export interface AuthState {
  user: User | null
  agent: AtpAgent | null
  isAuthenticated: boolean
  isLoading: boolean
  error: Error | null
}

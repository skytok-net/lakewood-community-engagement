"use client"

import { create } from "zustand"
import { supabase } from "@/lib/supabaseClient"
import type { Property } from "@/types"
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import { toast } from "sonner"

// Helper function to validate Property type
const isValidProperty = (item: unknown): item is Property => {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'address' in item &&
    'city' in item &&
    'state' in item &&
    'zip' in item &&
    'owner' in item
  )
}

// Define a type for our realtime payloads
type PropertyChangePayload = RealtimePostgresChangesPayload<{
  old: Property | null
  new: Property | null
}>

interface PropertyState {
  property: Property | null
  properties: Property[]
  isLoading: boolean
  error: Error | null
  hasLoaded: boolean
  subscription: RealtimeChannel | null
  setProperty: (property: Property) => void
  setProperties: (properties: Property[]) => void
  setError: (error: Error | null) => void
  fetchProperties: () => Promise<void>
  fetchProperty: (id: string) => Promise<void>
  subscribeToChanges: () => void
  unsubscribe: () => void
  handlePropertyChange: (property: Property) => void
  handlePropertyDelete: (id: string) => void
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  property: null,
  properties: [],
  isLoading: false,
  error: null,
  hasLoaded: false,
  subscription: null,
  
  setProperty: (property) => set({ property }),
  setProperties: (properties) => set({ properties }),
  setError: (error) => set({ error }),
  
  handlePropertyChange: (property) => {
    const { properties } = get()
    const updatedProperties = properties.map(p => 
      p.id === property.id ? property : p
    )
    set({ properties: updatedProperties })
  },

  handlePropertyDelete: (id) => {
    const { properties } = get()
    const updatedProperties = properties.filter(p => p.id !== id)
    set({ properties: updatedProperties })
  },

  subscribeToChanges: () => {
    const { subscription } = get()
    
    // Clean up existing subscription if any
    if (subscription) {
      subscription.unsubscribe()
    }

    try {
      const channel = supabase.channel('properties_changes')
      
      const newSubscription = channel
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'dallas',
          table: 'properties'
        }, (payload: PropertyChangePayload) => {
          if (payload.new && isValidProperty(payload.new)) {
            const { properties } = get()
            set({ properties: [...properties, payload.new] })
            toast.success('New property added')
          }
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'dallas',
          table: 'properties'
        }, (payload: PropertyChangePayload) => {
          if (payload.new && isValidProperty(payload.new)) {
            get().handlePropertyChange(payload.new)
            toast.success('Property updated')
          }
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'dallas',
          table: 'properties'
        }, (payload: PropertyChangePayload) => {
          if (payload.old && isValidProperty(payload.old)) {
            get().handlePropertyDelete(payload.old.id)
            toast.success('Property deleted')
          }
        })
        .subscribe((status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR', err?: Error) => {
          if (err) {
            console.error('Subscription error:', err)
            set({ error: new Error('Failed to subscribe to property changes') })
            toast.error('Failed to subscribe to property changes')
            // Retry subscription after error
            setTimeout(() => get().subscribeToChanges(), 5000)
          }
        })

      set({ subscription: newSubscription })
    } catch (error) {
      console.error('Error setting up subscription:', error)
      const err = error instanceof Error ? error : new Error('Failed to set up property subscription')
      set({ error: err })
      toast.error(err.message)
      // Retry subscription after error
      setTimeout(() => get().subscribeToChanges(), 5000)
    }
  },

  unsubscribe: () => {
    const { subscription } = get()
    if (subscription) {
      subscription.unsubscribe()
      set({ subscription: null })
    }
  },

  fetchProperties: async () => {
    const { hasLoaded, error } = get()
    // Only return if already loaded and no error
    if (hasLoaded && !error) return

    try {
      set({ isLoading: true, error: null })
      const { data, error: fetchError } = await supabase
        .schema('dallas')
        .from('properties')
        .select('*')

      if (fetchError) throw fetchError

      // Ensure all required fields are present in the data
      const validData = data?.filter(isValidProperty) || []

      set({ 
        properties: validData, 
        isLoading: false,
        hasLoaded: true 
      })

      // Start subscription after initial load
      get().subscribeToChanges()
    } catch (error) {
      console.error('Error fetching properties:', error)
      const err = error instanceof Error ? error : new Error('Failed to fetch properties')
      set({ 
        error: err,
        isLoading: false 
      })
      toast.error(err.message)
    }
  },

  fetchProperty: async (id: string) => {
    try {
      set({ isLoading: true, error: null })
      const { data, error: fetchError } = await supabase
        .schema('dallas')
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Validate the property data
      if (data && isValidProperty(data)) {
        set({ property: data, isLoading: false })
      } else {
        throw new Error('Invalid property data received')
      }
    } catch (error) {
      console.error('Error fetching property:', error)
      const err = error instanceof Error ? error : new Error('Failed to fetch property')
      set({ 
        error: err,
        isLoading: false 
      })
      toast.error(err.message)
    }
  }
}))
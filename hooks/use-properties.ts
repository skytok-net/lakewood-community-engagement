"use client"

import { useCallback, useEffect } from "react"
import { usePropertyStore } from "@/stores/property-store"
import type { Property } from "@/types"
import { toast } from "sonner"

export interface UsePropertiesReturn {
  // State
  properties: Property[]
  property: Property | null
  isLoading: boolean
  error: Error | null
  hasLoaded: boolean

  // Actions
  fetchProperties: () => Promise<void>
  fetchProperty: (id: string) => Promise<void>
  setProperty: (property: Property) => void
  setProperties: (properties: Property[]) => void
  clearError: () => void

  // Computed
  getValidProperties: () => Property[]
}

export function useProperties(): UsePropertiesReturn {
  const store = usePropertyStore()

  // Initialize properties and subscription
  useEffect(() => {
    // Only fetch if we haven't loaded before
    store.fetchProperties().catch((error) => {
      console.error('Error in useProperties effect:', error)
      toast.error('Failed to load properties')
    })

    // Cleanup subscription on unmount
    return () => {
      store.unsubscribe()
    }
  }, []) // Empty dependency array since we only want to run this once

  // Memoize the getValidProperties function
  const getValidProperties = useCallback(() => {
    return store.properties.filter(
      (p) => p.latitude !== null && p.longitude !== null
    )
  }, [store.properties])

  // Add clearError utility
  const clearError = useCallback(() => {
    if (store.error) {
      store.setError(null)
    }
  }, [store])

  return {
    // Expose store state
    properties: store.properties,
    property: store.property,
    isLoading: store.isLoading,
    error: store.error,
    hasLoaded: store.hasLoaded,

    // Expose store actions
    fetchProperties: store.fetchProperties,
    fetchProperty: store.fetchProperty,
    setProperty: store.setProperty,
    setProperties: store.setProperties,
    clearError,

    // Expose computed values
    getValidProperties,
  }
}

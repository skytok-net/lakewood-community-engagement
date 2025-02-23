"use client"

import { useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { createMarkerIcon } from "./map-markers"
import { useProperties } from "@/hooks/use-properties"
import { ClientMap } from "./client-map"
import { toast } from "sonner"

export function MapComponent() {
  const { isLoading, error, getValidProperties, clearError } = useProperties()

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error.message)
      // Clear the error after showing toast
      clearError()
    }
  }, [error, clearError])

  if (isLoading) {
    return <Skeleton className="w-full h-[600px] rounded-lg" />
  }

  const validProperties = getValidProperties()
  return <ClientMap properties={validProperties} createMarkerIcon={createMarkerIcon} />
}

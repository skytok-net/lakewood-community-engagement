"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { createMarkerIcon } from "./map-markers"
import { useProperties } from "@/hooks/use-properties"
import ClientMap from "./client-map"

export default function MapComponent() {
  const { properties, isLoading } = useProperties()

  if (isLoading) {
    return <Skeleton className="w-full h-[600px] rounded-lg" />
  }

  return (
    <ClientMap
      properties={properties}
      createMarkerIcon={createMarkerIcon}
    />
  )
}

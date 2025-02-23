"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import type { LatLngExpression } from "leaflet"
import type { Property } from "@/types"

// Dynamically import Leaflet components with no SSR
const LeafletMap = dynamic(
  () => import("./leaflet-map"),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[600px] rounded-lg" />
  }
)

interface ClientMapProps {
  properties: Property[]
  createMarkerIcon: (reply: boolean | null) => any
}

export function ClientMap({ properties, createMarkerIcon }: ClientMapProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    console.log("ClientMap mounting...")
    setIsMounted(true)
    return () => {
      console.log("ClientMap unmounting...")
      setIsMounted(false)
    }
  }, [])

  if (!isMounted) {
    console.log("ClientMap not yet mounted, showing skeleton...")
    return <Skeleton className="w-full h-[600px] rounded-lg" />
  }

  console.log("ClientMap mounted, rendering map with", properties.length, "properties")

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border">
      <LeafletMap properties={properties} createMarkerIcon={createMarkerIcon} />
    </div>
  )
}

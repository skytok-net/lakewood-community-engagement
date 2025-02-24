"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import type { Property } from "@/types"
import type { Icon } from "leaflet"

// Dynamically import Leaflet components with no SSR
const LeafletMap = dynamic(
  () => import("./leaflet-map").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[600px] rounded-lg" />
  }
)

interface ClientMapProps {
  properties: Property[]
  createMarkerIcon: (reply: boolean | null) => Icon
}

export default function ClientMap({ properties, createMarkerIcon }: ClientMapProps) {
  return <LeafletMap properties={properties} createMarkerIcon={createMarkerIcon} />
}

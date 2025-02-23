"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Import the map component with no SSR
const MapComponent = dynamic(() => import("./map-component").then(mod => mod.MapComponent), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[600px] rounded-lg" />
})

export default function MapSection() {
  return <MapComponent />
}

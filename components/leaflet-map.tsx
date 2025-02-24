"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { Button } from "@/components/ui/button"
import type { LatLngExpression, Icon } from "leaflet"
import "leaflet/dist/leaflet.css"

interface Property {
  id: string
  address: string
  owner: string
  reply: boolean | null
  latitude: number | null
  longitude: number | null
}

interface LeafletMapProps {
  properties: Property[]
  createMarkerIcon: (reply: boolean | null) => Icon
}

const MAP_CONFIG = {
  center: [32.8135, -96.7505] as LatLngExpression,
  zoom: 16 as const
}

function MapController() {
  const map = useMap()

  useEffect(() => {
    map.invalidateSize()
  }, [map])

  return null
}

function ResetViewControl() {
  const map = useMap()

  const resetView = () => {
    map.setView(MAP_CONFIG.center, MAP_CONFIG.zoom, { animate: true })
  }

  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control leaflet-bar">
        <Button
          variant="outline"
          size="sm"
          onClick={resetView}
          className="bg-background hover:bg-accent"
        >
          Reset View
        </Button>
      </div>
    </div>
  )
}

function LeafletMap({ properties, createMarkerIcon }: LeafletMapProps) {
  return (
    <MapContainer
      center={MAP_CONFIG.center}
      zoom={MAP_CONFIG.zoom}
      className="w-full h-[600px] rounded-lg"
    >
      <MapController />
      <ResetViewControl />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {properties.map((property) => {
        if (!property.latitude || !property.longitude) return null
        
        return (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]}
            icon={createMarkerIcon(property.reply)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{property.address}</h3>
                <p className="text-sm text-muted-foreground">{property.owner}</p>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}

export default LeafletMap

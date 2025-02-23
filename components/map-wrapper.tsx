"use client"

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { Button } from "@/components/ui/button"
import type { LatLngExpression } from "leaflet"
import { useEffect } from "react"

// Only import Leaflet CSS if we're on the client side
if (typeof window !== "undefined") {
  require("leaflet/dist/leaflet.css")
}

interface Property {
  id: string
  address: string
  owner: string
  reply: boolean | null
  latitude: number | null
  longitude: number | null
}

interface MapWrapperProps {
  properties: Property[]
  createMarkerIcon: (reply: boolean | null) => any
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
        <Button onClick={resetView} className="px-2 py-1 text-xs" variant="secondary">
          Reset View
        </Button>
      </div>
    </div>
  )
}

export function MapWrapper({ properties, createMarkerIcon }: MapWrapperProps) {
  return (
    <MapContainer
      center={MAP_CONFIG.center}
      zoom={MAP_CONFIG.zoom}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <MapController />
      <ResetViewControl />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {properties.map((property) =>
        property.latitude && property.longitude ? (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]}
            icon={createMarkerIcon(property.reply)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{property.address}</h3>
                <p className="text-sm">Owner: {property.owner}</p>
                <p className="text-sm">
                  Status: {property.reply === true ? "Support" : property.reply === false ? "Oppose" : "No Response"}
                </p>
              </div>
            </Popup>
          </Marker>
        ) : null
      )}
    </MapContainer>
  )
}

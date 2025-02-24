"use client"

import L from "leaflet"

const ICON_SIZE = 24

export const createMarkerIcon = (status: boolean | null) => {
  const color =
    status === true
      ? "#22c55e" // green for support
      : status === false
      ? "#ef4444" // red for oppose
      : "#94a3b8" // gray for no response

  // Create an SVG marker
  const svg = `
    <svg width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${ICON_SIZE/2}" cy="${ICON_SIZE/2}" r="${ICON_SIZE/2-2}" fill="${color}" stroke="white" stroke-width="2" opacity="0.8"/>
    </svg>
  `

  // Convert SVG to data URL
  const svgUrl = `data:image/svg+xml;base64,${btoa(svg)}`

  return L.icon({
    iconUrl: svgUrl,
    iconSize: [ICON_SIZE, ICON_SIZE],
    iconAnchor: [ICON_SIZE/2, ICON_SIZE/2],
    popupAnchor: [0, -ICON_SIZE/2],
  })
}

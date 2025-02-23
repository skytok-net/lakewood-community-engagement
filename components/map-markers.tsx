"use client"

import L from "leaflet"

export const createMarkerIcon = (status: boolean | null) => {
  const color =
    status === true
      ? "#22c55e"
      : // green for support
        status === false
        ? "#ef4444"
        : // red for oppose
          "#94a3b8" // gray for no response

  const markerHtmlStyles = `
    background-color: ${color};
    width: 1.5rem;
    height: 1.5rem;
    display: block;
    border-radius: 50%;
    opacity: 0.8;
  `

  return L.divIcon({
    className: "my-custom-pin",
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
    html: `<span style="${markerHtmlStyles}" />`,
  })
}


"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

interface MapComponentProps {
  startCoords: [number, number] | null
  endCoords: [number, number] | null
  waypoints: [number, number][]
  routeGeometry?: string | null
  onMapClick: (lat: number, lng: number) => void
  mapClicked: "start" | "end" | "waypoint" | null
}

export default function MapComponent({
  startCoords,
  endCoords,
  waypoints = [],
  routeGeometry,
  onMapClick,
  mapClicked,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const startMarkerRef = useRef<L.Marker | null>(null)
  const endMarkerRef = useRef<L.Marker | null>(null)
  const waypointMarkersRef = useRef<L.Marker[]>([])
  const routeLayerRef = useRef<L.Polyline | null>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current || !mapContainerRef.current) return

    initializedRef.current = true

    mapRef.current = L.map(mapContainerRef.current, {
      center: [34.0, 9.5],
      zoom: 7,
      maxBounds: [
        [30.2, 7.5],
        [38.0, 12.0],
      ],
      maxBoundsViscosity: 1.0,
      zoomControl: true,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      dragging: true,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 6,
      bounds: [
        [30.2, 7.5],
        [38.0, 12.0],
      ],
    }).addTo(mapRef.current)

    mapRef.current.on("click", (e) => {
      const lat = e.latlng.lat
      const lng = e.latlng.lng
      if (lat >= 30.2 && lat <= 38.0 && lng >= 7.5 && lng <= 12.0) {
        onMapClick(lat, lng)
      }
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        initializedRef.current = false
      }
    }
  }, [onMapClick])

  // Update markers and route...
  useEffect(() => {
    if (!mapRef.current || !initializedRef.current) return

    if (startMarkerRef.current) {
      startMarkerRef.current.remove()
      startMarkerRef.current = null
    }

    if (startCoords) {
      const startIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      })

      startMarkerRef.current = L.marker(startCoords, { icon: startIcon })
        .addTo(mapRef.current)
        .bindPopup("Starting Point")
    }
  }, [startCoords])

  useEffect(() => {
    if (!mapRef.current || !initializedRef.current) return

    if (endMarkerRef.current) {
      endMarkerRef.current.remove()
      endMarkerRef.current = null
    }

    if (endCoords) {
      const endIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      })

      endMarkerRef.current = L.marker(endCoords, { icon: endIcon }).addTo(mapRef.current).bindPopup("Destination")
    }
  }, [endCoords])

  useEffect(() => {
    if (!mapRef.current || !initializedRef.current) return

    waypointMarkersRef.current.forEach((marker) => marker.remove())
    waypointMarkersRef.current = []

    waypoints.forEach((coords, index) => {
      const waypointIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background-color: #10b981; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      })

      const marker = L.marker(coords, { icon: waypointIcon })
        .addTo(mapRef.current!)
        .bindPopup(`Waypoint ${index + 1}`)

      waypointMarkersRef.current.push(marker)
    })
  }, [waypoints])

  useEffect(() => {
    if (!mapRef.current || !routeGeometry || !initializedRef.current) return

    if (routeLayerRef.current) {
      routeLayerRef.current.remove()
      routeLayerRef.current = null
    }

    try {
      const decodedPath = decodePolyline(routeGeometry)

      routeLayerRef.current = L.polyline(decodedPath, {
        color: "#10b981",
        weight: 4,
        opacity: 0.8,
      }).addTo(mapRef.current)

      const shouldFitBounds =
        !startMarkerRef.current && !endMarkerRef.current && waypointMarkersRef.current.length === 0

      if (shouldFitBounds) {
        const allPoints: [number, number][] = []
        if (startCoords) allPoints.push(startCoords)
        waypoints.forEach((wp) => allPoints.push(wp))
        if (endCoords) allPoints.push(endCoords)

        if (allPoints.length >= 2) {
          mapRef.current.fitBounds(allPoints, {
            padding: [50, 50],
            animate: false,
          })
        }
      }
    } catch (error) {
      console.error("Error rendering route geometry:", error)
    }
  }, [routeGeometry, startCoords, endCoords, waypoints])

  useEffect(() => {
    if (!mapRef.current || !initializedRef.current || !mapContainerRef.current) return

    if (mapClicked) {
      mapContainerRef.current.classList.add("cursor-crosshair")
    } else {
      mapContainerRef.current.classList.remove("cursor-crosshair")
    }
  }, [mapClicked])

  const decodePolyline = (encoded: string): [number, number][] => {
    let index = 0
    const len = encoded.length
    let lat = 0
    let lng = 0
    const coordinates: [number, number][] = []

    while (index < len) {
      let b
      let shift = 0
      let result = 0

      do {
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)

      const dlat = result & 1 ? ~(result >> 1) : result >> 1
      lat += dlat

      shift = 0
      result = 0

      do {
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)

      const dlng = result & 1 ? ~(result >> 1) : result >> 1
      lng += dlng

      coordinates.push([lat / 1e5, lng / 1e5])
    }

    return coordinates
  }

  return (
    <div
      ref={mapContainerRef}
      id="map"
      className={`h-[600px] w-full rounded-xl shadow-lg border border-slate-200 ${
        mapClicked ? "cursor-crosshair" : ""
      }`}
    ></div>
  )
}


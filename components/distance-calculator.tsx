"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import { MapPin, Navigation, Plus, X, CornerDownRight, MapIcon } from "lucide-react"
import dynamic from "next/dynamic"
import type { Vehicle } from "@/types/vehicles"
import { VehicleSelector } from "./vehicle-selector"
import { FuelCostDisplay } from "./fuel-cost-display"
// Update the import statement at the top of the file
import vehiclesData from "../data/vehicles.json"

// Dynamically import the Map component to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-100 animate-pulse rounded-md flex items-center justify-center">
      <p className="text-slate-500">Loading map...</p>
    </div>
  ),
})

// Tunisian cities with their coordinates (for reference only)
const tunisianCities = [
  { name: "Tunis", lat: 36.8065, lng: 10.1815 },
  { name: "Sfax", lat: 34.7406, lng: 10.7603 },
  { name: "Sousse", lat: 35.8245, lng: 10.6346 },
  { name: "Kairouan", lat: 35.6781, lng: 10.0969 },
  { name: "Bizerte", lat: 37.2746, lng: 9.8627 },
  { name: "Gabès", lat: 33.8881, lng: 10.0986 },
  { name: "Ariana", lat: 36.8625, lng: 10.1956 },
  { name: "Gafsa", lat: 34.4311, lng: 8.7757 },
  { name: "Monastir", lat: 35.7643, lng: 10.8113 },
  { name: "Ben Arous", lat: 36.7533, lng: 10.2281 },
  { name: "Kasserine", lat: 35.1722, lng: 8.8304 },
  { name: "Médenine", lat: 33.3399, lng: 10.4917 },
  { name: "Nabeul", lat: 36.4513, lng: 10.7357 },
  { name: "Tataouine", lat: 32.9211, lng: 10.4509 },
  { name: "Béja", lat: 36.7256, lng: 9.1817 },
  { name: "Jendouba", lat: 36.5011, lng: 8.7803 },
  { name: "El Kef", lat: 36.1675, lng: 8.7047 },
  { name: "Mahdia", lat: 35.5047, lng: 11.0622 },
  { name: "Sidi Bouzid", lat: 35.0382, lng: 9.4858 },
  { name: "Tozeur", lat: 33.9197, lng: 8.1335 },
  { name: "Siliana", lat: 36.0844, lng: 9.3744 },
  { name: "Zaghouan", lat: 36.4103, lng: 10.1433 },
  { name: "Kébili", lat: 33.7072, lng: 8.9689 },
]

// Convert cities to combobox options
const cityOptions = tunisianCities.map((city) => ({
  value: city.name,
  label: city.name,
}))

type LocationPoint = {
  name: string
  coords: [number, number]
  isCustom?: boolean
}

const DistanceCalculator = () => {
  const [startPoint, setStartPoint] = useState<LocationPoint | null>(null)
  const [endPoint, setEndPoint] = useState<LocationPoint | null>(null)
  const [startInputValue, setStartInputValue] = useState("")
  const [endInputValue, setEndInputValue] = useState("")
  const [roadDistance, setRoadDistance] = useState<number | null>(null)
  const [mapClicked, setMapClicked] = useState<"start" | "end" | "waypoint" | null>(null)
  const [waypoints, setWaypoints] = useState<LocationPoint[]>([])
  const [isCalculatingRoad, setIsCalculatingRoad] = useState(false)
  const [routeGeometry, setRouteGeometry] = useState<any>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  // Calculate distance between two points using Haversine formula
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return d
  }, [])

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180)
  }

  const calculateRoadDistance = useCallback(async () => {
    if (!startPoint || !endPoint) return

    setIsCalculatingRoad(true)

    try {
      // Prepare coordinates for the API call
      let coordinatesString = `${startPoint.coords[1]},${startPoint.coords[0]}`

      // Add any waypoints
      waypoints.forEach((waypoint) => {
        coordinatesString += `;${waypoint.coords[1]},${waypoint.coords[0]}`
      })

      // Add destination
      coordinatesString += `;${endPoint.coords[1]},${endPoint.coords[0]}`

      // Call the OSRM API with overview=full to get the route geometry
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full`,
      )

      const data = await response.json()

      if (data.routes && data.routes.length > 0) {
        // Distance is returned in meters, convert to kilometers
        const distanceInKm = data.routes[0].distance / 1000
        setRoadDistance(distanceInKm)

        // Store the route geometry for rendering on the map
        setRouteGeometry(data.routes[0].geometry)
      }
    } catch (error) {
      console.error("Error calculating road distance:", error)
    } finally {
      setIsCalculatingRoad(false)
    }
  }, [startPoint, endPoint, waypoints])

  // Handle city selection from dropdown
  const handleCitySelect = (cityName: string, pointType: "start" | "end") => {
    const city = tunisianCities.find((c) => c.name === cityName)
    if (city) {
      const point: LocationPoint = {
        name: city.name,
        coords: [city.lat, city.lng],
      }

      if (pointType === "start") {
        setStartPoint(point)
        setStartInputValue(city.name)
      } else {
        setEndPoint(point)
        setEndInputValue(city.name)
      }
    }
  }

  // Calculate road distance when points change
  useEffect(() => {
    if (startPoint && endPoint) {
      calculateRoadDistance()
    }
  }, [startPoint, endPoint, calculateRoadDistance])

  const formatCoordinates = (coords: [number, number]) => {
    return `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`
  }

  const addWaypoint = (e: React.MouseEvent) => {
    e.preventDefault()
    setMapClicked("waypoint")
  }

  const removeWaypoint = (index: number, e: React.MouseEvent) => {
    e.preventDefault()
    const newWaypoints = [...waypoints]
    newWaypoints.splice(index, 1)
    setWaypoints(newWaypoints)
  }

  // Handle map click
  const handleMapClick = (lat: number, lng: number) => {
    // Format a name for the custom location
    const customName = `Tunisia (${lat.toFixed(4)}, ${lng.toFixed(4)})`

    if (mapClicked === "start") {
      const point: LocationPoint = {
        name: customName,
        coords: [lat, lng],
        isCustom: true,
      }
      setStartPoint(point)
      setStartInputValue(customName)
      setMapClicked(null)
    } else if (mapClicked === "end") {
      const point: LocationPoint = {
        name: customName,
        coords: [lat, lng],
        isCustom: true,
      }
      setEndPoint(point)
      setEndInputValue(customName)
      setMapClicked(null)
    } else if (mapClicked === "waypoint") {
      const point: LocationPoint = {
        name: customName,
        coords: [lat, lng],
        isCustom: true,
      }
      setWaypoints((prev) => [...prev, point])
      setMapClicked(null)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <div className="order-2 lg:order-1 space-y-4">
        <Card className="shadow-md relative z-10">
          <CardHeader className="space-y-1 p-4 md:p-6">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg md:text-xl">
                <MapIcon className="h-5 w-5 text-primary" />
                Route Details
              </div>
              {roadDistance !== null && (
                <div className="flex items-center gap-2 text-emerald-600">
                  <Navigation className="h-5 w-5" />
                  <span className="font-bold">{roadDistance.toFixed(1)} km</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
            <div className="space-y-3">
              <Label htmlFor="start-point">Starting Point</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <div className="flex gap-2">
                    <Combobox
                      options={cityOptions}
                      value={startPoint?.name && !startPoint.isCustom ? startPoint.name : ""}
                      onChange={(value) => handleCitySelect(value, "start")}
                      placeholder="Select a city or click on map"
                    />
                  </div>
                  {startPoint?.isCustom && (
                    <p className="text-xs text-slate-500 mt-1">Custom location: {formatCoordinates(startPoint.coords)}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    setMapClicked("start")
                  }}
                  className={`w-full sm:w-auto ${mapClicked === "start" ? "bg-primary/20" : ""}`}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Pick on Map
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="end-point">Destination</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <div className="flex gap-2">
                    <Combobox
                      options={cityOptions}
                      value={endPoint?.name && !endPoint.isCustom ? endPoint.name : ""}
                      onChange={(value) => handleCitySelect(value, "end")}
                      placeholder="Select a city or click on map"
                    />
                  </div>
                  {endPoint?.isCustom && (
                    <p className="text-xs text-slate-500 mt-1">Custom location: {formatCoordinates(endPoint.coords)}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    setMapClicked("end")
                  }}
                  className={`w-full sm:w-auto ${mapClicked === "end" ? "bg-primary/20" : ""}`}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Pick on Map
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Waypoints</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addWaypoint}
                  className={mapClicked === "waypoint" ? "bg-primary/20" : ""}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Waypoint
                </Button>
              </div>
              {waypoints.length > 0 && (
                <div className="space-y-2">
                  {waypoints.map((waypoint, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CornerDownRight className="h-4 w-4 mt-1 text-slate-400" />
                      <div className="flex-1 text-sm">
                        {waypoint.name}
                        {waypoint.isCustom && (
                          <div className="text-xs text-slate-500">
                            {formatCoordinates(waypoint.coords)}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => removeWaypoint(index, e)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <VehicleSelector
              selectedVehicle={selectedVehicle}
              onSelect={setSelectedVehicle}
              vehicles={vehiclesData.vehicles}
            />
          </CardContent>
        </Card>

        {roadDistance !== null && selectedVehicle && (
          <Card className="shadow-md relative z-10">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg">Trip Receipt</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <FuelCostDisplay
                distanceKm={roadDistance}
                vehicle={selectedVehicle}
                startPoint={startPoint}
                endPoint={endPoint}
                waypoints={waypoints}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="order-1 lg:order-2">
        <div className="h-[300px] md:h-[500px] rounded-lg overflow-hidden shadow-md relative z-0">
          <MapComponent
            startCoords={startPoint?.coords || null}
            endCoords={endPoint?.coords || null}
            waypoints={waypoints.map(w => w.coords)}
            onMapClick={handleMapClick}
            routeGeometry={routeGeometry}
            mapClicked={mapClicked}
          />
        </div>
      </div>
    </div>
  )
}

export default DistanceCalculator


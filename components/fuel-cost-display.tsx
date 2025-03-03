"use client"

import { useEffect, useState } from "react"
import { Fuel, FuelIcon as GasTurbine, AlertCircle, Receipt } from "lucide-react"
import type { Vehicle, FuelPrices } from "@/types/vehicles"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FuelTypeSelector } from "./fuel-type-selector"
import { Receipt as ReceiptComponent } from "./receipt"

interface FuelCostDisplayProps {
  vehicle: Vehicle | null
  distanceKm: number | null
  startPoint?: { name: string; coords: [number, number] } | null
  endPoint?: { name: string; coords: [number, number] } | null
  waypoints?: { name: string; coords: [number, number] }[]
}

export function FuelCostDisplay({
  vehicle,
  distanceKm,
  startPoint = null,
  endPoint = null,
  waypoints = [],
}: FuelCostDisplayProps) {
  const [fuelPrices, setFuelPrices] = useState<FuelPrices>({
    diesel: 2.155,
    gasoline: 2.4,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFuelType, setSelectedFuelType] = useState<"diesel" | "gasoline">("gasoline")
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)

  useEffect(() => {
    const fetchFuelPrices = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/fuel-prices")
        if (!response.ok) {
          throw new Error("Failed to fetch fuel prices")
        }
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        setFuelPrices({
          diesel: data.diesel,
          gasoline: data.gasoline,
        })
        setLastUpdated(data.lastUpdated || new Date().toISOString())
      } catch (error) {
        console.error("Error fetching fuel prices:", error)
        // Don't set error state, just use default prices
      } finally {
        setLoading(false)
      }
    }

    fetchFuelPrices()
  }, [])

  // Determine initial fuel type based on engine type
  useEffect(() => {
    if (vehicle) {
      const engineLower = vehicle.engine.toLowerCase()
      const isDiesel =
        engineLower.includes("hdi") ||
        engineLower.includes("dci") ||
        engineLower.includes("tdi") ||
        engineLower.includes("multijet")
      setSelectedFuelType(isDiesel ? "diesel" : "gasoline")
    }
  }, [vehicle])

  if (!vehicle || !distanceKm) return null

  if (loading) {
    return (
      <Card className="bg-slate-50">
        <CardContent className="pt-6">
          <div className="h-20 animate-pulse bg-slate-200 rounded-md" />
        </CardContent>
      </Card>
    )
  }

  const fuelConsumption = vehicle.fuel_consumption.combined
  const litersNeeded = (distanceKm * fuelConsumption) / 100
  const fuelPrice = selectedFuelType === "diesel" ? fuelPrices.diesel : fuelPrices.gasoline
  const fuelCost = litersNeeded * fuelPrice

  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "February 2024"

  return (
    <>
      <Card className="bg-white">
        <CardContent className="pt-6 space-y-6">
          <FuelTypeSelector value={selectedFuelType} onChange={setSelectedFuelType} />

          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <Fuel className="h-5 w-5 text-emerald-500" />
              <div className="grid gap-0.5">
                <h4 className="text-sm font-medium">
                  Fuel Consumption ({selectedFuelType === "diesel" ? "Diesel" : "Gasoline"})
                </h4>
                <p className="text-sm text-muted-foreground">{fuelConsumption.toFixed(1)} L/100km (combined)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GasTurbine className="h-5 w-5 text-emerald-500" />
              <div className="grid gap-0.5">
                <h4 className="text-sm font-medium">Estimated Fuel Cost</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    {litersNeeded.toFixed(1)} L × {fuelPrice.toFixed(3)} DT/L
                  </p>
                  <p className="font-medium text-emerald-600 text-lg">Total: {fuelCost.toFixed(3)} DT</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price update notice */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-amber-800 text-sm">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <p>Fuel prices shown are the latest official prices in Tunisia. Last updated: {formattedLastUpdated}</p>
          </div>

          {/* Receipt button */}
          <Button onClick={() => setShowReceipt(true)} variant="outline" className="w-full flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Generate Trip Receipt
          </Button>
        </CardContent>
      </Card>

      {showReceipt && (
        <ReceiptComponent
          startPoint={startPoint}
          endPoint={endPoint}
          waypoints={waypoints}
          distance={distanceKm}
          vehicle={vehicle}
          fuelType={selectedFuelType}
          fuelPrice={fuelPrice}
          fuelConsumption={fuelConsumption}
          totalCost={fuelCost}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </>
  )
}


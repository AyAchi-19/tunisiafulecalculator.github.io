"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Printer, X } from "lucide-react"
import type { Vehicle } from "@/types/vehicles"

interface ReceiptProps {
  startPoint: { name: string; coords: [number, number] } | null
  endPoint: { name: string; coords: [number, number] } | null
  waypoints: { name: string; coords: [number, number] }[]
  distance: number | null
  vehicle: Vehicle | null
  fuelType: "diesel" | "gasoline"
  fuelPrice: number
  fuelConsumption: number
  totalCost: number
  onClose: () => void
}

export function Receipt({
  startPoint,
  endPoint,
  waypoints,
  distance,
  vehicle,
  fuelType,
  fuelPrice,
  fuelConsumption,
  totalCost,
  onClose,
}: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const content = receiptRef.current
    if (!content) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow pop-ups to print the receipt")
      return
    }

    // Get the HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Trip Receipt - Tunisia Distance Calculator</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
          }
          .receipt {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ccc;
          }
          .receipt-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
          }
          .receipt-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
          }
          .receipt-subtitle {
            font-size: 16px;
            color: #666;
            margin: 5px 0 0;
          }
          .receipt-date {
            font-size: 14px;
            color: #666;
            margin: 5px 0 0;
          }
          .receipt-section {
            margin-bottom: 20px;
          }
          .receipt-section-title {
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 10px;
          }
          .receipt-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .receipt-label {
            font-weight: bold;
          }
          .receipt-value {
            text-align: right;
          }
          .receipt-total {
            font-size: 18px;
            font-weight: bold;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #eee;
          }
          .receipt-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
          @media print {
            body {
              padding: 0;
            }
            .receipt {
              border: none;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="receipt-header">
            <h1 class="receipt-title">Tunisia Distance Calculator</h1>
            <p class="receipt-subtitle">Trip Receipt</p>
            <p class="receipt-date">${new Date().toLocaleString("en-US", {
              dateStyle: "full",
              timeStyle: "medium",
            })}</p>
          </div>
          
          <div class="receipt-section">
            <h2 class="receipt-section-title">Trip Details</h2>
            <div class="receipt-row">
              <span class="receipt-label">Starting Point:</span>
              <span class="receipt-value">${startPoint?.name || "N/A"}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Destination:</span>
              <span class="receipt-value">${endPoint?.name || "N/A"}</span>
            </div>
            ${
              waypoints.length > 0
                ? `<div class="receipt-row">
                    <span class="receipt-label">Waypoints:</span>
                    <span class="receipt-value">${waypoints.length} point(s)</span>
                  </div>`
                : ""
            }
            <div class="receipt-row">
              <span class="receipt-label">Total Distance:</span>
              <span class="receipt-value">${distance?.toFixed(2) || "0"} km (${
                distance ? (distance * 0.621371).toFixed(2) : "0"
              } miles)</span>
            </div>
          </div>
          
          <div class="receipt-section">
            <h2 class="receipt-section-title">Vehicle Information</h2>
            <div class="receipt-row">
              <span class="receipt-label">Vehicle:</span>
              <span class="receipt-value">${vehicle ? `${vehicle.brand} ${vehicle.model}` : "N/A"}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Engine:</span>
              <span class="receipt-value">${vehicle?.engine || "N/A"}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Fuel Type:</span>
              <span class="receipt-value">${fuelType === "diesel" ? "Diesel (Gasoil)" : "Gasoline (Essence)"}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Fuel Consumption:</span>
              <span class="receipt-value">${fuelConsumption.toFixed(1)} L/100km</span>
            </div>
          </div>
          
          <div class="receipt-section">
            <h2 class="receipt-section-title">Cost Calculation</h2>
            <div class="receipt-row">
              <span class="receipt-label">Fuel Price:</span>
              <span class="receipt-value">${fuelPrice.toFixed(3)} DT/L</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Estimated Fuel Required:</span>
              <span class="receipt-value">${(((distance || 0) * fuelConsumption) / 100).toFixed(1)} L</span>
            </div>
            <div class="receipt-total">
              <div class="receipt-row">
                <span class="receipt-label">Total Estimated Cost:</span>
                <span class="receipt-value">${totalCost.toFixed(3)} DT</span>
              </div>
            </div>
          </div>
          
          <div class="receipt-footer">
            <p>This is an estimated calculation based on the provided information.</p>
            <p>Actual fuel consumption and costs may vary based on driving conditions, vehicle maintenance, and current fuel prices.</p>
            <p>Generated on ${new Date().toISOString().split("T")[0]} by Tunisia Distance Calculator</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `

    // Write to the new window and print
    printWindow.document.open()
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>

        <CardContent className="p-6" ref={receiptRef}>
          <div className="text-center mb-6 pb-4 border-b">
            <h2 className="text-2xl font-bold">Tunisia Distance Calculator</h2>
            <p className="text-muted-foreground">Trip Receipt</p>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date().toLocaleString("en-US", {
                dateStyle: "full",
                timeStyle: "medium",
              })}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Trip Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Starting Point:</div>
              <div className="text-right">{startPoint?.name || "N/A"}</div>

              <div className="font-medium">Destination:</div>
              <div className="text-right">{endPoint?.name || "N/A"}</div>

              {waypoints.length > 0 && (
                <>
                  <div className="font-medium">Waypoints:</div>
                  <div className="text-right">{waypoints.length} point(s)</div>
                </>
              )}

              <div className="font-medium">Total Distance:</div>
              <div className="text-right">
                {distance?.toFixed(2) || "0"} km ({distance ? (distance * 0.621371).toFixed(2) : "0"} miles)
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Vehicle Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Vehicle:</div>
              <div className="text-right">{vehicle ? `${vehicle.brand} ${vehicle.model}` : "N/A"}</div>

              <div className="font-medium">Engine:</div>
              <div className="text-right">{vehicle?.engine || "N/A"}</div>

              <div className="font-medium">Fuel Type:</div>
              <div className="text-right">{fuelType === "diesel" ? "Diesel (Gasoil)" : "Gasoline (Essence)"}</div>

              <div className="font-medium">Fuel Consumption:</div>
              <div className="text-right">{fuelConsumption.toFixed(1)} L/100km</div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Cost Calculation</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Fuel Price:</div>
              <div className="text-right">{fuelPrice.toFixed(3)} DT/L</div>

              <div className="font-medium">Estimated Fuel Required:</div>
              <div className="text-right">{(((distance || 0) * fuelConsumption) / 100).toFixed(1)} L</div>

              <div className="font-medium text-base pt-2 border-t mt-2">Total Estimated Cost:</div>
              <div className="text-right text-base font-bold text-emerald-600 pt-2 border-t mt-2">
                {totalCost.toFixed(3)} DT
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground mt-8 pt-4 border-t">
            <p>This is an estimated calculation based on the provided information.</p>
            <p>
              Actual fuel consumption and costs may vary based on driving conditions, vehicle maintenance, and current
              fuel prices.
            </p>
            <p className="mt-2">Generated on {new Date().toISOString().split("T")[0]} by Tunisia Distance Calculator</p>
          </div>
        </CardContent>

        <div className="p-4 bg-slate-50 border-t flex justify-end">
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
        </div>
      </Card>
    </div>
  )
}


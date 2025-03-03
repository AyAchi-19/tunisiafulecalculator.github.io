"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, ChevronDown } from "lucide-react"
import type { Vehicle } from "@/types/vehicles"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface VehicleSelectorProps {
  vehicles: Vehicle[]
  selectedVehicle: Vehicle | null
  onSelect: (vehicle: Vehicle) => void
}

export function VehicleSelector({ vehicles, selectedVehicle, onSelect }: VehicleSelectorProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : "Select a vehicle..."}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search vehicles..." />
          <CommandList>
            <CommandEmpty>No vehicle found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {vehicles.map((vehicle) => (
                <CommandItem
                  key={vehicle.id}
                  value={`${vehicle.brand} ${vehicle.model}`}
                  onSelect={() => {
                    onSelect(vehicle)
                    setOpen(false)
                  }}
                  className="flex items-center gap-3 px-4 py-2"
                >
                  <div className="relative h-10 w-16 overflow-hidden rounded">
                    <Image
                      src={vehicle.image || "/placeholder.svg"}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {vehicle.engine} - {vehicle.type || vehicle.class}
                    </p>
                  </div>
                  <Check
                    className={cn("ml-auto h-4 w-4", selectedVehicle?.id === vehicle.id ? "opacity-100" : "opacity-0")}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


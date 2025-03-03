"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Droplets, Flame } from "lucide-react"

interface FuelTypeSelectorProps {
  value: "diesel" | "gasoline"
  onChange: (value: "diesel" | "gasoline") => void
}

export function FuelTypeSelector({ value, onChange }: FuelTypeSelectorProps) {
  return (
    <RadioGroup
      defaultValue={value}
      onValueChange={(val) => onChange(val as "diesel" | "gasoline")}
      className="grid grid-cols-2 gap-4"
    >
      <div>
        <RadioGroupItem value="diesel" id="diesel" className="peer sr-only" />
        <Label
          htmlFor="diesel"
          className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-500 [&:has([data-state=checked])]:border-emerald-500"
        >
          <Droplets className="mb-2 h-6 w-6 text-emerald-500" />
          <div className="space-y-1 text-center">
            <p className="text-sm font-medium leading-none">Diesel</p>
            <p className="text-sm text-muted-foreground">Gasoil</p>
          </div>
        </Label>
      </div>

      <div>
        <RadioGroupItem value="gasoline" id="gasoline" className="peer sr-only" />
        <Label
          htmlFor="gasoline"
          className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-500 [&:has([data-state=checked])]:border-emerald-500"
        >
          <Flame className="mb-2 h-6 w-6 text-emerald-500" />
          <div className="space-y-1 text-center">
            <p className="text-sm font-medium leading-none">Gasoline</p>
            <p className="text-sm text-muted-foreground">Essence</p>
          </div>
        </Label>
      </div>
    </RadioGroup>
  )
}


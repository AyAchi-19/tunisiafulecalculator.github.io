export interface Vehicle {
  id: number
  rank?: number
  brand: string
  model: string
  type?: string
  class?: string
  engine: string
  fuel_consumption: {
    city: number
    highway: number
    combined: number
    average?: number
  }
  image: string
}

export interface FuelPrices {
  diesel: number
  gasoline: number
}


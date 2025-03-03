import Image from "next/image"
import DistanceCalculator from "@/components/distance-calculator"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="bg-emerald-500 text-white py-4 md:py-6 mb-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-24 md:w-32 h-auto shrink-0">
              <Image
                src="/logo.png.jpg"
                alt="Tunisia Fuel Calculator Logo"
                width={160}
                height={160}
                priority
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl md:text-4xl font-bold mb-1">Tunisia Fuel Calculator</h1>
              <p className="text-sm md:text-base text-emerald-50">Calculate road distances and fuel costs between locations in Tunisia</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <DistanceCalculator />
      </div>
    </main>
  )
}


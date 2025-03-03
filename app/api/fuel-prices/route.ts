import { NextResponse } from "next/server"
import axios from "axios"
import * as cheerio from "cheerio"

// Fallback prices (updated February 2024)
const FALLBACK_PRICES = {
  diesel: 2.205,
  gasoline: 2.52,
}

export async function GET() {
  try {
    // Fetch the webpage
    const { data } = await axios.get("https://www.globalpetrolprices.com/Tunisia/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
    })

    // Load HTML into Cheerio
    const $ = cheerio.load(data)

    // Find the fuel prices in the table (structure may change!)
    let prices: Record<string, number> = {}

    // Try to find prices in the table
    $("table.countries tr").each((_, row) => {
      const cols = $(row).find("td")
      if (cols.length > 2 && $(cols[0]).text().trim() === "Tunisia") {
        const gasolineText = $(cols[1]).text().trim().replace(",", ".")
        const dieselText = $(cols[2]).text().trim().replace(",", ".")

        if (gasolineText && !isNaN(Number.parseFloat(gasolineText))) {
          prices.gasoline = Number.parseFloat(gasolineText)
        }

        if (dieselText && !isNaN(Number.parseFloat(dieselText))) {
          prices.diesel = Number.parseFloat(dieselText)
        }
      }
    })

    // If we couldn't find prices in the expected format, use fallback
    if (!prices.gasoline || !prices.diesel) {
      console.log("Could not find prices in expected format, using fallback")
      prices = { ...FALLBACK_PRICES }
    }

    // Convert from USD/liter to TND/liter if needed (approximate conversion)
    // Tunisia typically shows prices in TND, but the website might show USD
    const USD_TO_TND = 3.1 // Approximate conversion rate

    // If prices seem too low (in USD), convert to TND
    if (prices.gasoline < 1.0) {
      prices.gasoline = prices.gasoline * USD_TO_TND
      prices.diesel = prices.diesel * USD_TO_TND
    }

    return NextResponse.json({
      diesel: prices.diesel,
      gasoline: prices.gasoline,
      lastUpdated: new Date().toISOString(),
      source: "globalpetrolprices.com",
    })
  } catch (error) {
    console.error("Scraping failed, using fallback:", error)
    return NextResponse.json({
      ...FALLBACK_PRICES,
      warning: "Live prices unavailable, using fallback data",
      lastUpdated: "2024-02-01",
    })
  }
}


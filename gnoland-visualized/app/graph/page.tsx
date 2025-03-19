"use client"

import { useEffect, useState } from "react"
import DependencyGraph from "./components/DependencyGraph"
import { PackageProvider } from "@/contexts/PackageContext"
import { PackageInfo } from "./components/PackageInfo"
import { getPackages } from "./api/package-api"
import { PackageFilters } from "./components/PackageFilters"
import { Skeleton } from "@/components/ui/skeleton"
import { Package } from "@/types/Package"

export default function GraphPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPackages() {
      try {
        setLoading(true)
        const data = await getPackages()
        setPackages(data)
        setError(null)
      } catch (err) {
        console.error("Failed to load packages:", err)
        setError("Failed to load package data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadPackages()
  }, [])

  if (loading) {
    return (
      <main className="flex h-screen w-screen overflow-hidden bg-[#1a1a1a]">
        <div className="w-80 border-r border-gray-800">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="h-full w-full">
          <div className="flex h-12 items-center justify-center">
            <Skeleton className="h-8 w-40" />
          </div>
          <div className="flex h-[calc(100%-3rem)] items-center justify-center">
            <p className="text-white">Loading graph data...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex h-screen w-screen items-center justify-center bg-[#1a1a1a]">
        <div className="rounded-lg bg-red-900/20 p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-red-400">Error Loading Data</h2>
          <p className="text-white">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-red-700 px-4 py-2 text-white hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </main>
    )
  }

  return (
    <PackageProvider initialPackages={packages}>
      <main className="flex h-screen w-screen overflow-hidden bg-[#1a1a1a]">
        <PackageInfo />
        <PackageFilters />
        <div className="h-full w-full">
          <DependencyGraph packages={packages} />
        </div>
      </main>
    </PackageProvider>
  )
}


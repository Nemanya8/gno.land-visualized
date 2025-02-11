"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import type { Package } from "@/types/Package"
import { getPackages } from "./api/package-api"

const PackageList: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const fetchedRef = useRef(false)

  useEffect(() => {

    if (fetchedRef.current) return

    const fetchPackages = async () => {
      try {
        fetchedRef.current = true
        const fetchedPackages = await getPackages()
        setPackages(fetchedPackages)
      } catch (error) {
        setError("Failed to fetch packages" + error)
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div>
      <h1>Package List</h1>
      <ul>
        {packages.map((pkg) => (
          <li key={pkg.Dir}>{pkg.Name}</li>
        ))}
      </ul>
    </div>
  )
}

export default PackageList


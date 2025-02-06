"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import type { Package } from "@/types/Package"

async function getPackages(): Promise<Package[]> {
  console.log("getPackages called") // Add this line
  const res = await fetch("http://localhost:8080/getAllPackages")
  if (!res.ok) {
    throw new Error("Failed to fetch packages")
  }
  return res.json()
}

const PackageList: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    console.log("PackageList useEffect called") // Add this line

    if (fetchedRef.current) return

    const fetchPackages = async () => {
      try {
        fetchedRef.current = true
        const fetchedPackages = await getPackages()
        setPackages(fetchedPackages)
      } catch (error) {
        setError("Failed to fetch packages")
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  console.log("PackageList rendered") // Add this line

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


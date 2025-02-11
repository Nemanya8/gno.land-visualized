"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { Package } from "@/types/Package"

interface PackageContextType {
  selectedPackage: Package | null
  setSelectedPackage: (pkg: Package | null) => void
  packages: Package[]
  setPackages: (packages: Package[]) => void
}

const PackageContext = createContext<PackageContextType | undefined>(undefined)

export function PackageProvider({
  children,
  initialPackages,
}: { children: React.ReactNode; initialPackages: Package[] }) {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [packages, setPackages] = useState<Package[]>(initialPackages)

  return (
    <PackageContext.Provider value={{ selectedPackage, setSelectedPackage, packages, setPackages }}>
      {children}
    </PackageContext.Provider>
  )
}

export function usePackage() {
  const context = useContext(PackageContext)
  if (context === undefined) {
    throw new Error("usePackage must be used within a PackageProvider")
  }
  return context
}

export function usePackages() {
  const context = useContext(PackageContext)
  if (context === undefined) {
    throw new Error("usePackages must be used within a PackageProvider")
  }
  return context.packages
}


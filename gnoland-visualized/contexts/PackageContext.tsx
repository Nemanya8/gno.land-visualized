"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { Package } from "@/types/Package"

interface PackageContextType {
  selectedPackage: Package | null
  setSelectedPackage: (pkg: Package | null) => void
}

const PackageContext = createContext<PackageContextType | undefined>(undefined)

export function PackageProvider({ children }: { children: React.ReactNode }) {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)

  return <PackageContext.Provider value={{ selectedPackage, setSelectedPackage }}>{children}</PackageContext.Provider>
}

export function usePackage() {
  const context = useContext(PackageContext)
  if (context === undefined) {
    throw new Error("usePackage must be used within a PackageProvider")
  }
  return context
}


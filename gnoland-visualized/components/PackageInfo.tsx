"use client"

import { useState, useEffect } from "react"
import type { Package } from "@/types/Package"

interface PackageInfoProps {
  packages: Package[]
}

export default function PackageInfo({ packages }: PackageInfoProps) {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [packagesImportingThis, setPackagesImportingThis] = useState<Package[]>([])

  useEffect(() => {
    const handlePackageSelect = (event: CustomEvent) => {
      const packageName = event.detail
      const pkg = packages.find((p) => p.Name === packageName)
      if (pkg) {
        setSelectedPackage(pkg)

        const importingPackages = packages.filter((p) =>
          p.Imports.includes(pkg.Name)
        )
        setPackagesImportingThis(importingPackages)
      } else {
        setSelectedPackage(null)
        setPackagesImportingThis([])
      }
    }

    window.addEventListener("packageSelect", handlePackageSelect as EventListener)

    return () => {
      window.removeEventListener("packageSelect", handlePackageSelect as EventListener)
    }
  }, [packages])

  if (!selectedPackage) {
    return <div>Click on a package in the graph to see its details.</div>
  }

  return (
    <div className="p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-2">{selectedPackage.Name}</h2>
      <p>
        <strong>Creator:</strong> {selectedPackage.Creator}
      </p>
      <h3 className="font-bold mt-4 mb-2">Imports:</h3>
      {selectedPackage.Imports.length > 0 ? (
        <ul className="list-disc list-inside">
          {selectedPackage.Imports.map((imp, index) => (
            <li key={index}>{imp}</li>
          ))}
        </ul>
      ) : (
        <p>No imports</p>
      )}

      <h3 className="font-bold mt-4 mb-2">Packages that import this package:</h3>
      {packagesImportingThis.length > 0 ? (
        <ul className="list-disc list-inside">
          {packagesImportingThis.map((pkg, index) => (
            <li key={index}>{pkg.Name}</li>
          ))}
        </ul>
      ) : (
        <p>No packages import this package.</p>
      )}
    </div>
  )
}

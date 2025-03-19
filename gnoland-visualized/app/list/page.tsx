"use client"

import { useState, useEffect, useRef } from "react"
import type { Package } from "@/types/Package"
import { getPackages } from "./api/package-api"
import { Download, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PackageFilters } from "./components/package-filters"
import { SearchAndSort } from "./components/search-and-sort"
import { PackageCard } from "./components/package-card"

export default function PackageList() {
  const [packages, setPackages] = useState<Package[]>([])
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPackages, setExpandedPackages] = useState<string[]>([])
  const fetchedRef = useRef(false)

  const [filterP, setFilterP] = useState<boolean>(true)
  const [filterR, setFilterR] = useState<boolean>(true)
  const [importCount, setImportCount] = useState<number[]>([0, 0])
  const [importedCount, setImportedCount] = useState<number[]>([0, 0])
  const [maxImports, setMaxImports] = useState<number>(0)
  const [maxImported, setMaxImported] = useState<number>(0)

  const [filterM, setFilterM] = useState<boolean>(true)
  const [filterD, setFilterD] = useState<boolean>(true)

  const [searchTerm, setSearchTerm] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("imported-desc")

  useEffect(() => {
    if (fetchedRef.current) return

    const fetchPackages = async () => {
      try {
        fetchedRef.current = true
        const fetchedPackages = await getPackages()

        if (!fetchedPackages || fetchedPackages.length === 0) {
          setError("No packages returned from API")
          setLoading(false)
          return
        }

        setPackages(fetchedPackages)
        setFilteredPackages(fetchedPackages)

        const maxImportsValue = Math.max(...fetchedPackages.map((pkg) => pkg.Imports?.length || 0), 1)
        const maxImportedValue = Math.max(...fetchedPackages.map((pkg) => pkg.Imported?.length || 0), 1)

        setMaxImports(maxImportsValue)
        setMaxImported(maxImportedValue)

        setImportCount([0, maxImportsValue])
        setImportedCount([0, maxImportedValue])
      } catch (error) {
        console.error("Error fetching packages:", error)
        setError(`Failed to fetch packages: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  useEffect(() => {
    if (!packages || packages.length === 0) return

    const preFilteredPackages = packages.filter((pkg) => {
      const isDirP = pkg.Dir?.startsWith("gno.land/p") || false
      const isDirR = pkg.Dir?.startsWith("gno.land/r") || false
      const isMonorepo = pkg.Creator === "monorepo"
      const isDeployed = pkg.Creator !== "monorepo"

      const typeFilter = (filterP && isDirP) || (filterR && isDirR)
      const sourceFilter = (filterM && isMonorepo) || (filterD && isDeployed)
      const dirFilter = (typeFilter && sourceFilter) || (!isDirP && !isDirR)

      const searchFilter =
        searchTerm === "" ||
        pkg.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.Dir?.toLowerCase().includes(searchTerm.toLowerCase())

      return dirFilter && searchFilter
    })

    const newMaxImports = Math.max(...preFilteredPackages.map((pkg) => pkg.Imports?.length || 0), 1)
    const newMaxImported = Math.max(...preFilteredPackages.map((pkg) => pkg.Imported?.length || 0), 1)

    if (newMaxImports !== maxImports) {
      setMaxImports(newMaxImports)
      if (importCount[1] > newMaxImports) {
        setImportCount([importCount[0], newMaxImports])
      }
    }

    if (newMaxImported !== maxImported) {
      setMaxImported(newMaxImported)
      if (importedCount[1] > newMaxImported) {
        setImportedCount([importedCount[0], newMaxImported])
      }
    }

    let filtered = packages.filter((pkg) => {
      const isDirP = pkg.Dir?.startsWith("gno.land/p") || false
      const isDirR = pkg.Dir?.startsWith("gno.land/r") || false
      const isMonorepo = pkg.Creator === "monorepo"
      const isDeployed = pkg.Creator !== "monorepo"

      const typeFilter = (filterP && isDirP) || (filterR && isDirR)
      const sourceFilter = (filterM && isMonorepo) || (filterD && isDeployed)
      const dirFilter = (typeFilter && sourceFilter) || (!isDirP && !isDirR)

      const importsFilter = (pkg.Imports?.length || 0) >= importCount[0] && (pkg.Imports?.length || 0) <= importCount[1]
      const importedFilter =
        (pkg.Imported?.length || 0) >= importedCount[0] && (pkg.Imported?.length || 0) <= importedCount[1]

      const searchFilter =
        searchTerm === "" ||
        pkg.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.Dir?.toLowerCase().includes(searchTerm.toLowerCase())

      return dirFilter && importsFilter && importedFilter && searchFilter
    })

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "imports-asc":
          return (a.Imports?.length || 0) - (b.Imports?.length || 0)
        case "imports-desc":
          return (b.Imports?.length || 0) - (a.Imports?.length || 0)
        case "imported-asc":
          return (a.Imported?.length || 0) - (b.Imported?.length || 0)
        case "imported-desc":
          return (b.Imported?.length || 0) - (a.Imported?.length || 0)
        case "alpha-asc":
          return (a.Name || "").localeCompare(b.Name || "")
        case "alpha-desc":
          return (b.Name || "").localeCompare(a.Name || "")
        default:
          return (b.Imported?.length || 0) - (a.Imported?.length || 0)
      }
    })

    setFilteredPackages(filtered)
  }, [packages, filterP, filterR, filterM, filterD, importCount, importedCount, searchTerm, sortBy])

  const toggleExpand = (pkg: Package) => {
    const uniqueId = `${pkg.Dir}-${pkg.Name}`

    setExpandedPackages((prev) => {
      if (prev.includes(uniqueId)) {
        return prev.filter((id) => id !== uniqueId)
      } else {
        return [...prev, uniqueId]
      }
    })
  }

  const downloadCSV = () => {
    const headers = ["Name", "Directory", "Creator", "Draft", "Imports Count", "Imported Count", "Contributors"].join(
      ",",
    )

    const rows = filteredPackages
      .map((pkg) => {
        const contributorsStr = pkg.Contributors
          ? pkg.Contributors.map((c) => `${c.Name}(${c.Percentage}%)`).join(";")
          : ""

        return [
          `"${pkg.Name || ""}"`,
          `"${pkg.Dir || ""}"`,
          `"${pkg.Creator || ""}"`,
          pkg.Draft ? "Yes" : "No",
          pkg.Imports?.length || 0,
          pkg.Imported?.length || 0,
          `"${contributorsStr}"`,
        ].join(",")
      })
      .join("\n")

    const csv = `${headers}\n${rows}`

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "packages.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-white">Loading packages...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>
  }

  const noMatchingPackages = filteredPackages.length === 0 && packages.length > 0

  return (
    <div className="min-h-screen bg-[#18181a] text-white">
      <div className="container mx-auto p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Data Panel</h1>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Link href="/graph" className="w-full sm:w-auto">
              <Button className="flex items-center gap-2 bg-[#28282B] text-white hover:bg-[#3a3a3d] w-full sm:w-auto">
                <BarChart2 size={16} />
                Graph
              </Button>
            </Link>
            <Button
              onClick={downloadCSV}
              className="flex items-center gap-2 bg-[#28282B] text-white hover:bg-[#3a3a3d] w-full sm:w-auto"
            >
              <Download size={16} />
              Download CSV
            </Button>
          </div>
        </div>

        <PackageFilters
          filterP={filterP}
          setFilterP={setFilterP}
          filterR={filterR}
          setFilterR={setFilterR}
          filterM={filterM}
          setFilterM={setFilterM}
          filterD={filterD}
          setFilterD={setFilterD}
          importCount={importCount}
          setImportCount={setImportCount}
          importedCount={importedCount}
          setImportedCount={setImportedCount}
          maxImports={maxImports}
          maxImported={maxImported}
        />

        <SearchAndSort
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          loading={loading}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPackages.length > 0 ? (
            filteredPackages.map((pkg) => (
              <PackageCard
                key={`${pkg.Dir}-${pkg.Name}-${pkg.Creator || ""}`}
                pkg={pkg}
                isExpanded={expandedPackages.includes(`${pkg.Dir}-${pkg.Name}`)}
                onToggleExpand={() => toggleExpand(pkg)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-300">
              {noMatchingPackages
                ? "No packages match the current filters. Try adjusting your filters."
                : "No packages available. Check your API connection."}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


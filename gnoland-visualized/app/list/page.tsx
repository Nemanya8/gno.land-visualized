"use client"

import { useState, useEffect, useRef } from "react"
import type { Package } from "@/types/Package"
import { getPackages } from "./api/package-api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Download, PackageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function PackageList() {
  const [packages, setPackages] = useState<Package[]>([])
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPackages, setExpandedPackages] = useState<string[]>([])
  const fetchedRef = useRef(false)

  const [filterP, setFilterP] = useState<boolean>(true)
  const [filterR, setFilterR] = useState<boolean>(true)
  const [importCount, setImportCount] = useState<number>(0)
  const [importedCount, setImportedCount] = useState<number>(0)
  const [maxImports, setMaxImports] = useState<number>(0)
  const [maxImported, setMaxImported] = useState<number>(0)

  useEffect(() => {
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL)
  }, [])

  useEffect(() => {
    if (fetchedRef.current) return

    const fetchPackages = async () => {
      try {
        fetchedRef.current = true
        console.log("Fetching packages from:", `${process.env.NEXT_PUBLIC_API_URL}/getAllPackages`)
        const fetchedPackages = await getPackages()
        console.log("Fetched packages:", fetchedPackages)

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

        setImportCount(0)
        setImportedCount(0)
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

    console.log("Applying filters:", { filterP, filterR, importCount, importedCount })
    console.log("Total packages before filtering:", packages.length)

    const filtered = packages.filter((pkg) => {
      const isDirP = pkg.Dir?.startsWith("/p") || false
      const isDirR = pkg.Dir?.startsWith("/r") || false

      const dirFilter = (filterP && isDirP) || (filterR && isDirR) || (!isDirP && !isDirR) // Include packages that don't start with /p or /r

      const importsFilter = (pkg.Imports?.length || 0) >= importCount
      const importedFilter = (pkg.Imported?.length || 0) >= importedCount

      return dirFilter && importsFilter && importedFilter
    })

    console.log("Filtered packages:", filtered.length)
    setFilteredPackages(filtered)
  }, [packages, filterP, filterR, importCount, importedCount])

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Package List</h1>
          <Button onClick={downloadCSV} className="flex items-center gap-2" variant="outline">
            <Download size={16} />
            Download CSV
          </Button>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium mb-2">Directory</h3>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filter-p"
                    checked={filterP}
                    onCheckedChange={(checked) => setFilterP(checked as boolean)}
                  />
                  <Label htmlFor="filter-p">/p</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filter-r"
                    checked={filterR}
                    onCheckedChange={(checked) => setFilterR(checked as boolean)}
                  />
                  <Label htmlFor="filter-r">/r</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="import-count">Imports (min: {importCount})</Label>
                  <span className="text-sm text-gray-400">Max: {maxImports}</span>
                </div>
                <Slider
                  id="import-count"
                  min={0}
                  max={maxImports}
                  step={1}
                  value={[importCount]}
                  onValueChange={(value) => setImportCount(value[0])}
                  className="mb-6"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="imported-count">Imported by (min: {importedCount})</Label>
                  <span className="text-sm text-gray-400">Max: {maxImported}</span>
                </div>
                <Slider
                  id="imported-count"
                  min={0}
                  max={maxImported}
                  step={1}
                  value={[importedCount]}
                  onValueChange={(value) => setImportedCount(value[0])}
                  className="mb-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPackages.length > 0 ? (
            filteredPackages.map((pkg) => (
              <Card
                key={`${pkg.Dir}-${pkg.Name}-${pkg.Creator || ""}`}
                className="overflow-hidden bg-gray-800 border-gray-700"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <PackageIcon className="h-5 w-5" />
                        {pkg.Name}
                      </CardTitle>
                      <CardDescription className="truncate mt-1 text-gray-400">{pkg.Dir}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(pkg)}
                      className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      {expandedPackages.includes(`${pkg.Dir}-${pkg.Name}`) ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pb-2">
                  <div className="flex gap-2 mb-2">
                    <Badge variant="outline" className="text-xs bg-transparent text-gray-300 border-gray-600">
                      Imports: {pkg.Imports.length}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-transparent text-gray-300 border-gray-600">
                      Imported by: {pkg.Imported.length}
                    </Badge>
                    {pkg.Draft && (
                      <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                        Draft
                      </Badge>
                    )}
                  </div>
                </CardContent>

                {expandedPackages.includes(`${pkg.Dir}-${pkg.Name}`) && (
                  <CardFooter className="flex flex-col items-start border-t border-gray-700 pt-4">
                    <div className="w-full space-y-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-300">Creator</h3>
                        <p className="text-sm text-gray-400">{pkg.Creator || "Not specified"}</p>
                      </div>

                      {pkg.Contributors && pkg.Contributors.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-300">Contributors</h3>
                          <ul className="text-sm text-gray-400">
                            {pkg.Contributors.map((contributor, index) => (
                              <li key={index} className="flex justify-between">
                                <span>{contributor.Name}</span>
                                <span>{contributor.Percentage}%</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {pkg.Imports.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-300">Imports</h3>
                          <ScrollArea className="h-24 w-full mt-1 rounded border border-gray-700 p-2">
                            <div className="flex flex-wrap gap-1">
                              {pkg.Imports.map((imp, index) => (
                                <Badge key={index} variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                                  {imp}
                                </Badge>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}

                      {pkg.Imported.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-300">Imported by</h3>
                          <ScrollArea className="h-24 w-full mt-1 rounded border border-gray-700 p-2">
                            <div className="flex flex-wrap gap-1">
                              {pkg.Imported.map((imp, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs bg-transparent text-gray-300 border-gray-600"
                                >
                                  {imp}
                                </Badge>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  </CardFooter>
                )}
              </Card>
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


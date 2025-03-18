"use client"

import { useState, useEffect, useRef } from "react"
import type { Package } from "@/types/Package"
import { getPackages } from "./api/package-api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, PackageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function PackageList() {
  const [packages, setPackages] = useState<Package[]>([])
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null)
  const fetchedRef = useRef(false)

  const [filterP, setFilterP] = useState<boolean>(true)
  const [filterR, setFilterR] = useState<boolean>(true)
  const [importCount, setImportCount] = useState<number>(0)
  const [importedCount, setImportedCount] = useState<number>(0)
  const [maxImports, setMaxImports] = useState<number>(0)
  const [maxImported, setMaxImported] = useState<number>(0)

  useEffect(() => {
    if (fetchedRef.current) return

    const fetchPackages = async () => {
      try {
        fetchedRef.current = true
        const fetchedPackages = await getPackages()
        setPackages(fetchedPackages)

        const maxImportsValue = Math.max(...fetchedPackages.map((pkg) => pkg.Imports.length))
        const maxImportedValue = Math.max(...fetchedPackages.map((pkg) => pkg.Imported.length))

        setMaxImports(maxImportsValue)
        setMaxImported(maxImportedValue)

        setImportCount(0)
        setImportedCount(0)
      } catch (error) {
        setError("Failed to fetch packages: " + error)
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  useEffect(() => {
    if (packages.length === 0) return

    const filtered = packages.filter((pkg) => {
      const dirFilter = (filterP && pkg.Dir.startsWith("/p")) || (filterR && pkg.Dir.startsWith("/r"))

      const importsFilter = pkg.Imports.length >= importCount
      const importedFilter = pkg.Imported.length >= importedCount

      return dirFilter && importsFilter && importedFilter
    })

    setFilteredPackages(filtered)
  }, [packages, filterP, filterR, importCount, importedCount])

  const toggleExpand = (dir: string) => {
    if (expandedPackage === dir) {
      setExpandedPackage(null)
    } else {
      setExpandedPackage(dir)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading packages...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Package List</h1>

      {/* Filters */}
      <div className="bg-card border rounded-lg p-4 mb-6">
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
            <Card key={pkg.Dir} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <PackageIcon className="h-5 w-5" />
                      {pkg.Name}
                    </CardTitle>
                    <CardDescription className="truncate mt-1">{pkg.Dir}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleExpand(pkg.Dir)} className="h-8 w-8 p-0">
                    {expandedPackage === pkg.Dir ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pb-2">
                <div className="flex gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    Imports: {pkg.Imports.length}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Imported by: {pkg.Imported.length}
                  </Badge>
                  {pkg.Draft && (
                    <Badge variant="secondary" className="text-xs">
                      Draft
                    </Badge>
                  )}
                </div>
              </CardContent>

              {expandedPackage === pkg.Dir && (
                <CardFooter className="flex flex-col items-start border-t pt-4">
                  <div className="w-full space-y-3">
                    <div>
                      <h3 className="text-sm font-medium">Creator</h3>
                      <p className="text-sm text-muted-foreground">{pkg.Creator || "Not specified"}</p>
                    </div>

                    {pkg.Contributors && pkg.Contributors.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium">Contributors</h3>
                        <ul className="text-sm text-muted-foreground">
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
                        <h3 className="text-sm font-medium">Imports</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {pkg.Imports.map((imp, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {imp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {pkg.Imported.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium">Imported by</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {pkg.Imported.map((imp, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {imp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardFooter>
              )}
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">No packages match the current filters</div>
        )}
      </div>
    </div>
  )
}


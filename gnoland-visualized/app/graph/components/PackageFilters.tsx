"use client"

import { useState, useEffect, useCallback } from "react"
import { usePackage, usePackages } from "@/contexts/PackageContext"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PackageButton } from "./PackageButton"
import { PackageButtonSkeleton } from "./PackageButtonSkeleton"
import { X, ChevronLeft, User, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { motion, AnimatePresence } from "framer-motion"
import { getFilteredPackages } from "../api/package-api"
import type { Package, Contributor } from "@/types/Package"

export function PackageFilters() {
  const { setSelectedPackage } = usePackage()
  const packages = usePackages()
  const [isOpen, setIsOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([])
  const [displayedPackages, setDisplayedPackages] = useState<Package[]>([])
  const [typeFilters, setTypeFilters] = useState({ r: true, p: true })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedContributor, setSelectedContributor] = useState<Contributor | null>(null)
  const [contributorPackages, setContributorPackages] = useState<Package[]>([])
  const [contributorMap, setContributorMap] = useState<Record<string, Package[]>>({})
  const [useClientSideFiltering, setUseClientSideFiltering] = useState(false)

  useEffect(() => {
    const newContributorMap: Record<string, Package[]> = {}
    packages.forEach((pkg) => {
      pkg.Contributors.forEach((contributor) => {
        if (!newContributorMap[contributor.Name]) {
          newContributorMap[contributor.Name] = []
        }
        newContributorMap[contributor.Name].push(pkg)
      })
    })
    setContributorMap(newContributorMap)
  }, [packages])

  // Check if API is available on component mount
  useEffect(() => {
    const checkApiAvailability = async () => {
      try {
        // Try to fetch a small amount of data to test the API
        await getFilteredPackages("r")
        setUseClientSideFiltering(false)
      } catch (error) {
        console.warn("API unavailable, falling back to client-side filtering", error)
        setUseClientSideFiltering(true)
      }
    }

    checkApiAvailability()
  }, [])

  const onClose = () => {
    setIsOpen(false)
  }

  const handleTypeFilterChange = (type: "r" | "p") => {
    setTypeFilters((prev) => {
      const newFilters = { ...prev, [type]: !prev[type] }
      return newFilters
    })
  }

  const handlePackageClick = (packageDir: string) => {
    const newPackage = packages.find((pkg) => pkg.Dir === packageDir)
    if (newPackage) {
      setSelectedPackage(newPackage)
      window.dispatchEvent(new CustomEvent("packageSelect", { detail: packageDir }))
    }
  }

  const clearContributorSelection = () => {
    setSelectedContributor(null)
    setContributorPackages([])
    window.dispatchEvent(
      new CustomEvent("contributorSelect", {
        detail: { contributorName: null },
      }),
    )
  }

  // Helper function for client-side filtering
  const filterPackagesByType = useCallback(
    (pkgs: Package[]) => {
      return pkgs.filter((pkg) => {
        // Determine if it's a realm or package based on directory prefix
        const isRealm = pkg.Dir.startsWith("r/")
        const isPackage = pkg.Dir.startsWith("p/")

        // Apply filters
        if (typeFilters.r && isRealm) return true
        if (typeFilters.p && isPackage) return true

        // If neither filter is active, include all packages that don't match either pattern
        if (!typeFilters.r && !typeFilters.p) return false

        // If only one filter is active but the package doesn't match either pattern,
        // include it only if it doesn't match the inactive filter
        if (!typeFilters.r && !isRealm) return true
        if (!typeFilters.p && !isPackage) return true

        return false
      })
    },
    [typeFilters],
  )

  const fetchFilteredPackages = useCallback(async () => {
    if (selectedContributor) return

    setIsLoading(true)
    try {
      if (typeFilters.r && typeFilters.p) {
        setFilteredPackages(packages)
      } else if (!typeFilters.r && !typeFilters.p) {
        setFilteredPackages([])
      } else if (useClientSideFiltering) {
        const filtered = filterPackagesByType(packages)
        setFilteredPackages(filtered)
      } else {
        try {
          let filteredResults: Package[] = []

          if (typeFilters.r) {
            const rPackages = await getFilteredPackages("r")
            filteredResults = [...filteredResults, ...rPackages]
          }

          if (typeFilters.p) {
            const pPackages = await getFilteredPackages("p")
            filteredResults = [...filteredResults, ...pPackages]
          }

          setFilteredPackages(filteredResults)
        } catch (apiError) {
          console.error("API fetch failed, switching to client-side filtering permanently", apiError)
          setUseClientSideFiltering(true)

          const filtered = filterPackagesByType(packages)
          setFilteredPackages(filtered)
        }
      }
    } catch (error) {
      console.error("Error in fetchFilteredPackages:", error)
      setFilteredPackages(typeFilters.r || typeFilters.p ? packages : [])
    } finally {
      setIsLoading(false)
    }
  }, [typeFilters, packages, selectedContributor, useClientSideFiltering, filterPackagesByType])

  useEffect(() => {
    fetchFilteredPackages()
  }, [fetchFilteredPackages])

  useEffect(() => {
    if (selectedContributor) {
      setDisplayedPackages(contributorPackages)
    } else {
      const filtered = filteredPackages.filter(
        (pkg) =>
          pkg.Dir.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.Creator.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setDisplayedPackages(filtered)
    }
  }, [searchTerm, filteredPackages, selectedContributor, contributorPackages])

  useEffect(() => {
    const handleContributorSelectEvent = (event: CustomEvent) => {
      const contributorName = event.detail.contributorName

      if (!contributorName) {
        clearContributorSelection()
        return
      }

      const packagesWorkedOn: Package[] = []
      let contributor: Contributor | null = null

      packages.forEach((pkg) => {
        const foundContributor = pkg.Contributors.find((c) => c.Name === contributorName)
        if (foundContributor) {
          packagesWorkedOn.push(pkg)
          if (!contributor) {
            contributor = foundContributor
          }
        }
      })

      setSelectedContributor(contributor)
      setContributorPackages(packagesWorkedOn)
      setIsOpen(true)
    }

    window.addEventListener("contributorSelect", handleContributorSelectEvent as EventListener)

    return () => {
      window.removeEventListener("contributorSelect", handleContributorSelectEvent as EventListener)
    }
  }, [packages])

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 z-50"
          >
            <Card className="h-full overflow-hidden flex flex-col bg-[#18181a] text-gray-300 border-[#18181a] shadow-lg">
              <CardHeader className="flex-shrink-0 py-3 px-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-100 truncate">Package Filters</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-100 hover:bg-[#28282B]"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>

              <div className="flex-shrink-0 px-4 pb-2">
                <div className="flex w-full max-w-sm items-center space-x-2 mb-2">
                  <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex space-x-4 justify-center">
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={typeFilters.r} onCheckedChange={() => handleTypeFilterChange("r")} />
                    <span>Realms</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={typeFilters.p} onCheckedChange={() => handleTypeFilterChange("p")} />
                    <span>Packages</span>
                  </label>
                </div>
              </div>

              <CardContent className="flex-grow overflow-hidden flex flex-col px-4 py-2">
                <div className="mb-4">
                  <h3 className="text-md font-semibold mb-2 text-gray-200">
                    {selectedContributor
                      ? `Packages by ${selectedContributor.Name} (${contributorPackages.length})`
                      : `All Packages (${displayedPackages.length})`}
                  </h3>
                  <div className="w-full h-0.5 bg-[#9c59b6] mb-2"></div>

                  <ScrollArea className="h-[40vh]">
                    <div className="grid grid-cols-1 gap-2 pr-2">
                      {isLoading && !selectedContributor ? (
                        Array.from({ length: 5 }).map((_, index) => <PackageButtonSkeleton key={index} />)
                      ) : displayedPackages.length > 0 ? (
                        displayedPackages.map((pkg, index) => (
                          <PackageButton
                            key={index}
                            name={pkg.Name}
                            dir={pkg.Dir}
                            onClick={() => handlePackageClick(pkg.Dir)}
                          />
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-full py-4">
                          <p className="text-gray-400">
                            {selectedContributor
                              ? "This contributor hasn't worked on any packages yet."
                              : "No packages found. Try adjusting your search or filters."}
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-md font-semibold text-gray-200">Contributors</h3>
                    {selectedContributor && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-400 hover:bg-[#28282B] hover:text-gray-100 h-8 px-2"
                        onClick={clearContributorSelection}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear filter
                      </Button>
                    )}
                  </div>
                  <div className="w-full h-0.5 bg-[#9c59b6] mb-2"></div>

                  <ScrollArea className="h-[30vh]">
                    <div className="grid grid-cols-1 gap-2 pr-2">
                      {Object.entries(contributorMap).map(([contributor, packages]) => {
                        const isSelected = selectedContributor?.Name === contributor
                        return (
                          <Button
                            key={contributor}
                            variant="ghost"
                            className={`w-full justify-between text-left py-2 px-3 ${
                              isSelected
                                ? "bg-[#3a3a3d] text-white"
                                : "bg-[#28282B] text-white hover:bg-[#3a3a3d] hover:text-white"
                            } flex items-center`}
                            onClick={() => {
                              if (isSelected) {
                                clearContributorSelection()
                              } else {
                                const foundContributor = packages[0]?.Contributors.find((c) => c.Name === contributor)
                                setSelectedContributor(foundContributor || null)
                                setContributorPackages(packages)
                                window.dispatchEvent(
                                  new CustomEvent("contributorSelect", {
                                    detail: { contributorName: contributor },
                                  }),
                                )
                              }
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <User className={`h-4 w-4 ${isSelected ? "text-white" : "text-[#9c59b6]"}`} />
                              <span className="font-medium truncate">{contributor}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-400">{packages.length}</span>
                              {isSelected ? (
                                <Check className="h-3 w-3 text-[#9c59b6]" />
                              ) : (
                                <ArrowRight className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                          </Button>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      {!isOpen && (
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50 bg-[#18181a] text-gray-400 hover:text-gray-100 hover:bg-[#28282B] px-2 py-8 rounded-l-lg shadow-lg"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}
    </>
  )
}


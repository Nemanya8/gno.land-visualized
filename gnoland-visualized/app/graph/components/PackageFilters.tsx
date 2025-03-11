"use client"

import { useState, useEffect, useCallback } from "react"
import { usePackage, usePackages } from "@/contexts/PackageContext"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PackageButton } from "./PackageButton"
import { PackageButtonSkeleton } from "./PackageButtonSkeleton"
import { X, ChevronLeft, User, ArrowLeft } from 'lucide-react'
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

  const onClose = () => { setIsOpen(false) }

  const handleTypeFilterChange = (type: "r" | "p") => {
    setTypeFilters((prev) => ({ ...prev, [type]: !prev[type] }))
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
    window.dispatchEvent(new CustomEvent("contributorSelect", { 
      detail: { contributorName: null }
    }))
  }

  const fetchFilteredPackages = useCallback(async () => {
    if (selectedContributor) return;
    
    setIsLoading(true)
    try {
      let rPackages: Package[] = []
      let pPackages: Package[] = []

      if (typeFilters.r && typeFilters.p) {
        setFilteredPackages(packages)
      } else {
        if (typeFilters.r) rPackages = await getFilteredPackages("r")
        if (typeFilters.p) pPackages = await getFilteredPackages("p")
        setFilteredPackages([...rPackages, ...pPackages])
      }
    } catch (error) {
      console.error("Error fetching packages:", error)
    } finally {
      setIsLoading(false)
    }
  }, [typeFilters, packages, selectedContributor])

  useEffect(() => {
    fetchFilteredPackages()
  }, [fetchFilteredPackages])

  useEffect(() => {
    if (selectedContributor) {
      // If a contributor is selected, we show their packages
      setDisplayedPackages(contributorPackages)
    } else {
      // Otherwise, apply normal filtering
      const filtered = filteredPackages.filter(
        (pkg) =>
        pkg.Dir.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.Creator.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setDisplayedPackages(filtered)
    }
  }, [searchTerm, filteredPackages, selectedContributor, contributorPackages])

  // Listen for contributor select events
  useEffect(() => {
    const handleContributorSelectEvent = (event: CustomEvent) => {
      const contributorName = event.detail.contributorName;
      
      if (!contributorName) {
        clearContributorSelection();
        return;
      }
      
      // Find all packages this contributor has worked on
      const packagesWorkedOn: Package[] = [];
      let contributor: Contributor | null = null;
      
      packages.forEach(pkg => {
        const foundContributor = pkg.Contributors.find(c => c.Name === contributorName);
        if (foundContributor) {
          packagesWorkedOn.push(pkg);
          if (!contributor) {
            contributor = foundContributor;
          }
        }
      });
      
      setSelectedContributor(contributor);
      setContributorPackages(packagesWorkedOn);
      setIsOpen(true); // Make sure the filter panel is open
    };

    window.addEventListener("contributorSelect", handleContributorSelectEvent as EventListener);

    return () => {
      window.removeEventListener("contributorSelect", handleContributorSelectEvent as EventListener);
    };
  }, [packages]);

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
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-100 truncate">
                    {selectedContributor ? "Contributor Packages" : "Package Filters"}
                  </h2>
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
              
              {selectedContributor ? (
                <>
                  <div className="flex-shrink-0 px-4 pb-4">
                    <Button 
                      variant="ghost" 
                      className="mb-2 text-gray-400 hover:bg-[#28282B] hover:text-gray-100"
                      onClick={clearContributorSelection}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to all packages
                    </Button>
                    
                    <div className="flex items-center bg-[#28282B] p-4 rounded-lg">
                        <User className="h-6 w-6 mr-2 text-[#9c59b6]" />
                        <h3 className="text-lg font-bold text-gray-100">{selectedContributor.Name}</h3>
                    </div>
                  </div>
                  
                  <div className="px-4 pb-2">
                    <h3 className="text-md font-semibold mb-2 text-gray-200">
                      Packages ({contributorPackages.length})
                    </h3>
                    <div className="w-full h-0.5 bg-[#9c59b6] mb-2"></div>
                  </div>
                </>
              ) : (
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
              )}
              
              <CardContent className="flex-grow overflow-hidden flex flex-col px-4 py-2">
                <ScrollArea className="h-full">
                  <div className="pr-4 space-y-2">
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
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">
                          {selectedContributor 
                            ? "This contributor hasn't worked on any packages yet." 
                            : "No packages found. Try adjusting your search or filters."}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
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

"use client"

import { usePackage } from "@/contexts/PackageContext"
import { ScrollArea } from "@/components/ui/scroll-area"

export function PackageInfo() {
  const { selectedPackage, setSelectedPackage } = usePackage()

  const onClose = () => setSelectedPackage(null)

  return (
    <div
      className={`fixed left-0 top-0 h-full w-80 bg-white shadow-lg p-4 transform transition-transform duration-300 ease-in-out z-10 ${
        selectedPackage ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {selectedPackage && (
        <>
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
            &times;
          </button>
          <h2 className="text-2xl font-bold text-center mb-2">{selectedPackage.Name}</h2>
          <p className="text-center text-sm text-gray-600 mb-4">
            Directory: {selectedPackage.Dir}
            <br />
            Creator: {selectedPackage.Creator}
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Imports</h3>
              <ScrollArea className="h-40 border rounded">
                <ul className="p-2">
                  {selectedPackage.Imports.map((imp, index) => (
                    <li key={index} className="text-sm">
                      {imp}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Imported By</h3>
              <ScrollArea className="h-40 border rounded">
                <ul className="p-2">
                  {selectedPackage.Imported.map((imp, index) => (
                    <li key={index} className="text-sm">
                      {imp}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          </div>
        </>
      )}
    </div>
  )
}


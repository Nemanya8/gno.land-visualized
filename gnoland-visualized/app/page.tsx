import type { Package } from "@/types/Package"
import DependencyGraph from "@/components/DependencyGraph"
import { PackageProvider } from "@/contexts/PackageContext"
import { PackageInfo } from "@/components/PackageInfo"

async function getPackages(): Promise<Package[]> {
  const res = await fetch("http://localhost:8080/getAllPackages")
  if (!res.ok) {
    throw new Error("Failed to fetch packages")
  }
  return res.json()
}

export default async function Home() {
  const packages = await getPackages()

  return (
    <PackageProvider initialPackages={packages}>
      <main className="flex h-screen w-screen overflow-hidden">
        <PackageInfo />
        <div className="h-full w-full">
          <DependencyGraph packages={packages} />
        </div>
      </main>
    </PackageProvider>
  )
}


import type { Package } from "@/types/Package"
import DependencyGraph from "@/components/DependencyGraph"
import PackageInfo from "@/components/PackageInfo"

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
    <main className="flex h-screen w-screen overflow-hidden">
    <div className="w-1/4 p-4 border-r overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Package Info</h1>
        <PackageInfo packages={packages} />
    </div>
    <div className="w-3/4 p-4 h-full">
        <h1 className="text-2xl font-bold mb-4">Package Dependency Graph</h1>
        <div className="h-full w-full">
            <DependencyGraph packages={packages} />
        </div>
    </div>
    </main>
  )
}


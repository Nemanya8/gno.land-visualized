import { Package } from "@/types/Package"

export async function getPackages(): Promise<Package[]> {
    const res = await fetch("http://localhost:8080/getAllPackages")
    if (!res.ok) {
      throw new Error("Failed to fetch packages")
    }
    return res.json()
  }
"use client"

import { useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"
import type { Package } from "@/types/Package"
import { usePackage } from "@/contexts/PackageContext"

const ForceGraph3D = dynamic(() => import("react-force-graph").then((mod) => mod.ForceGraph3D), { ssr: false })

interface DependencyGraphProps {
  packages: Package[]
}

interface GraphData {
  nodes: { id: string; dir: string; name: string; val: number; color?: string; draft: boolean; creator: string }[]
  links: { source: string; target: string; color?: string; type: "import" | "imported" }[]
}

export default function DependencyGraph({ packages }: DependencyGraphProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] })
  const [highlightLinks, setHighlightLinks] = useState(new Set())
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [importedNodes, setImportedNodes] = useState(new Set())
  const [importingNodes, setImportingNodes] = useState(new Set())
  const { setSelectedPackage } = usePackage()

  useEffect(() => {
    const importCounts: { [key: string]: number } = {}

    packages.forEach((pkg) => {
      pkg.Imports.forEach((imp) => {
        if (!importCounts[imp]) {
          importCounts[imp] = 0
        }
        importCounts[imp] += 1
      })
    })

    const nodes = packages.map((pkg) => ({
      id: pkg.Dir,
      dir: pkg.Dir,
      name: pkg.Name,
      val: (importCounts[pkg.Dir] || 0) + (pkg.Imported.length || 0) + 1,
      draft: pkg.Draft,
      creator: pkg.Creator,
    }))

    const links = packages.flatMap((pkg) => [
      ...pkg.Imports.map((imp) => ({
        source: pkg.Dir,
        target: imp,
        type: "import" as const,
      })),
      ...pkg.Imported.map((imp) => ({
        source: imp,
        target: pkg.Dir,
        type: "imported" as const,
      })),
    ])

    setGraphData({ nodes, links })
  }, [packages])

  const updateSelectedNode = useCallback(
    (nodeId: string) => {
      if (selectedNode === nodeId) {
        // If clicking the same node, reset highlights
        setHighlightLinks(new Set())
        setImportedNodes(new Set())
        setImportingNodes(new Set())
        setSelectedNode(null)
        setSelectedPackage(null)
      } else {
        // Highlight the clicked node and its direct connections
        const connectedNodes = new Set([nodeId])
        const connectedLinks = new Set()
        const importedNodes = new Set()
        const importingNodes = new Set()
        graphData.links.forEach((link: any) => {
          if (link.source.id === nodeId) {
            connectedNodes.add(link.target.id)
            connectedLinks.add(link)
            if (link.type === "import") importedNodes.add(link.target.id)
            else importingNodes.add(link.target.id)
          }
          if (link.target.id === nodeId) {
            connectedNodes.add(link.source.id)
            connectedLinks.add(link)
            if (link.type === "import") importingNodes.add(link.source.id)
            else importedNodes.add(link.source.id)
          }
        })
        setHighlightLinks(connectedLinks)
        setImportedNodes(importedNodes)
        setImportingNodes(importingNodes)
        setSelectedNode(nodeId)
        setSelectedPackage(packages.find((pkg) => pkg.Dir === nodeId) || null)
      }
    },
    [graphData.links, selectedNode, packages, setSelectedPackage],
  )

  const handleNodeClick = useCallback(
    (node: any) => {
      updateSelectedNode(node.id)
    },
    [updateSelectedNode],
  )

  useEffect(() => {
    const handlePackageSelect = (event: CustomEvent) => {
      updateSelectedNode(event.detail)
    }

    window.addEventListener("packageSelect", handlePackageSelect as EventListener)

    return () => {
      window.removeEventListener("packageSelect", handlePackageSelect as EventListener)
    }
  }, [updateSelectedNode])

  const updateNodeColor = useCallback(
    (node: any) => {
      if (node.id === selectedNode) return "#ff0000"
      if (importedNodes.has(node.id)) return "#00ff00"
      if (importingNodes.has(node.id)) return "#ffff00"
      return node.draft ? "#999999" : "#2B65EC"
    },
    [selectedNode, importedNodes, importingNodes],
  )

  const updateLinkColor = useCallback(
    (link: any) => {
      if (highlightLinks.has(link)) return link.type === "import" ? "#ff0000" : "#00ff00"
      return "#999999"
    },
    [highlightLinks],
  )

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {graphData.nodes.length > 0 && (
        <ForceGraph3D
          graphData={graphData}
          nodeLabel={(node: any) => `${node.name} - ${node.creator}`}
          nodeColor={updateNodeColor}
          linkColor={updateLinkColor}
          linkWidth={(link) => (highlightLinks.has(link) ? 2 : 1)}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={(link) => (highlightLinks.has(link) ? 2 : 0)}
          onNodeClick={handleNodeClick}
          backgroundColor="#28282B"
        />
      )}
    </div>
  )
}


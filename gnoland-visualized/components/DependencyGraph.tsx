"use client"

import { useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"
import type { Package } from "@/types/Package"

const ForceGraph3D = dynamic(() => import("react-force-graph").then((mod) => mod.ForceGraph3D), { ssr: false })

interface DependencyGraphProps {
  packages: Package[]
}

interface GraphData {
  nodes: { id: string; dir: string; val: number; color?: string }[]
  links: { source: string; target: string; color?: string }[]
}

export default function DependencyGraph({ packages }: DependencyGraphProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] })
  const [highlightLinks, setHighlightLinks] = useState(new Set())
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [importedNodes, setImportedNodes] = useState(new Set())
  const [importingNodes, setImportingNodes] = useState(new Set())

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
      val: importCounts[pkg.Dir] ? importCounts[pkg.Dir] + 1 : 1,
    }))

    const links = packages.flatMap((pkg) =>
      pkg.Imports.map((imp) => ({
        source: pkg.Dir,
        target: imp,
      })),
    )

    setGraphData({ nodes, links })
  }, [packages])

  const handleNodeClick = useCallback(
    (node: any) => {
      if (selectedNode === node.id) {
        // If clicking the same node, reset highlights
        setHighlightLinks(new Set())
        setImportedNodes(new Set())
        setImportingNodes(new Set())
        setSelectedNode(null)
      } else {
        // Highlight the clicked node and its direct connections
        const connectedNodes = new Set([node.id])
        const connectedLinks = new Set()
        const importedNodes = new Set()
        const importingNodes = new Set()
        graphData.links.forEach((link: any) => {
          if ((link.source as any).id === node.id) {
            connectedNodes.add((link.target as any).id)
            connectedLinks.add(link)
            importedNodes.add((link.target as any).id)
          }
          if ((link.target as any).id === node.id) {
            connectedNodes.add((link.source as any).id)
            connectedLinks.add(link)
            importingNodes.add((link.source as any).id)
          }
        })
        setHighlightLinks(connectedLinks)
        setImportedNodes(importedNodes)
        setImportingNodes(importingNodes)
        setSelectedNode(node.id)
      }
      window.dispatchEvent(new CustomEvent("packageSelect", { detail: node.id }))
    },
    [graphData.links, selectedNode],
  )

  const updateNodeColor = useCallback(
    (node: any) => {
      if (node.id === selectedNode) return "#ff0000"
      if (importedNodes.has(node.id)) return "#00ff00"
      if (importingNodes.has(node.id)) return "#ffff00"
      return "#2B65EC"
    },
    [ selectedNode, importedNodes, importingNodes],
  )

  const updateLinkColor = useCallback(
    (link: any) => {
      return highlightLinks.has(link) ? "#ff0000" : "#999999"
    },
    [highlightLinks],
  )

  return (
    <div>
      {graphData.nodes.length > 0 && (
      <ForceGraph3D
        graphData={graphData}
        nodeLabel="name"
        nodeColor={updateNodeColor}
        linkColor={updateLinkColor}
        linkWidth={(link) => (highlightLinks.has(link) ? 2 : 1)}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={(link) => (highlightLinks.has(link) ? 2 : 0)}
        onNodeClick={handleNodeClick}
        width={1350}
        height={800}
      />
      )}
    </div>
  )
}

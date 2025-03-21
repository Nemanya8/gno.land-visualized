"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import type { Package } from "@/types/Package"
import { usePackage } from "@/contexts/PackageContext"

const ForceGraph3D = dynamic(() => import("react-force-graph").then((mod) => mod.ForceGraph3D), { ssr: false })

interface DependencyGraphProps {
  packages: Package[]
}

interface GraphData {
  nodes: { id: string; dir: string; name: string; val: number; color?: string; draft: boolean; creator: string }[]
  links: { source: string; target: string; color?: string }[]
}

export default function DependencyGraph({ packages }: DependencyGraphProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] })
  const [highlightLinks, setHighlightLinks] = useState(new Set())
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [importedNodes, setImportedNodes] = useState(new Set())
  const [importingNodes, setImportingNodes] = useState(new Set())
  const [contributorNodes, setContributorNodes] = useState(new Set())
  const [selectedContributor, setSelectedContributor] = useState<string | null>(null)
  const { setSelectedPackage } = usePackage()
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const importCounts: { [key: string]: number } = {}

    console.log(packages)

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

    const links = packages.flatMap((pkg) =>
      pkg.Imports.map((imp: string) => ({
        source: pkg.Dir,
        target: imp,
      })),
    ).filter(link => 
      nodes.some(node => node.id === link.target)
    )

    const uniqueNodes = Array.from(new Map(nodes.map((node) => [node.id, node])).values())

    setGraphData({ nodes: uniqueNodes, links })
  }, [packages])

  const updateSelectedNode = useCallback(
    (nodeId: string) => {
      setSelectedContributor(null)
      setContributorNodes(new Set())

      if (selectedNode === nodeId) {
        setHighlightLinks(new Set())
        setImportedNodes(new Set())
        setImportingNodes(new Set())
        setSelectedNode(null)
        setSelectedPackage(null)
      } else {
        const connectedNodes = new Set([nodeId])
        const connectedLinks = new Set()
        const importedNodes = new Set()
        const importingNodes = new Set()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        graphData.links.forEach((link: any) => {
          if (link.source.id === nodeId) {
            connectedNodes.add(link.target.id)
            connectedLinks.add(link)

            importedNodes.add(link.target.id)
          } else if (link.target.id === nodeId) {
            connectedNodes.add(link.source.id)
            connectedLinks.add(link)
            importingNodes.add(link.source.id)
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

  const handleContributorSelect = useCallback(
    (contributorName: string) => {
      setHighlightLinks(new Set())
      setImportedNodes(new Set())
      setImportingNodes(new Set())
      setSelectedNode(null)

      if (selectedContributor === contributorName) {
        setContributorNodes(new Set())
        setSelectedContributor(null)
        setSelectedPackage(null)
      } else {
        const contributorPackages = new Set<string>()

        packages.forEach((pkg) => {
          const hasContributed = pkg.Contributors.some((contributor) => contributor.Name === contributorName)

          if (hasContributed) {
            contributorPackages.add(pkg.Dir)
          }
        })

        setContributorNodes(contributorPackages)
        setSelectedContributor(contributorName)

        setSelectedPackage(null)
      }
    },
    [packages, selectedContributor, setSelectedPackage],
  )

  const handleNodeClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  useEffect(() => {
    const handleContributorSelectEvent = (event: CustomEvent) => {
      handleContributorSelect(event.detail.contributorName)
    }

    window.addEventListener("contributorSelect", handleContributorSelectEvent as EventListener)

    return () => {
      window.removeEventListener("contributorSelect", handleContributorSelectEvent as EventListener)
    }
  }, [handleContributorSelect])

  const updateNodeColor = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any) => {
      if (selectedContributor && contributorNodes.has(node.id)) return "#9c59b6" // Purple for contributor nodes
      if (node.id === selectedNode) return "#ff6b6b"
      if (importedNodes.has(node.id)) return "#c96934"
      if (importingNodes.has(node.id)) return "#4ecdc4"
      return node.draft ? "#c7c7c7" : "#f7f7f7"
    },
    [selectedNode, importedNodes, importingNodes, selectedContributor, contributorNodes],
  )

  const updateLinkColor = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (link: any) => {
      if (highlightLinks.has(link)) {
        if (link.source.id === selectedNode) {
          return "#c96934"
        } else if (link.target.id === selectedNode) {
          return "#4ecdc4"
        }
      }

      if (selectedContributor && contributorNodes.has(link.source.id) && contributorNodes.has(link.target.id)) {
        return "#9c59b6"
      }

      return "#a5a5a5"
    },
    [highlightLinks, selectedNode, selectedContributor, contributorNodes],
  )

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => {
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  return (
    <div ref={containerRef} className="w-full h-screen">
      {graphData.nodes.length > 0 && (
        <ForceGraph3D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          nodeLabel={(node: any) => `${node.name} - ${node.creator}`}
          nodeColor={updateNodeColor}
          linkColor={updateLinkColor}
          linkWidth={(link) => {
            if (highlightLinks.has(link)) return 2
            return 1
          }}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={(link) => {
            if (highlightLinks.has(link)) return 2
            return 0
          }}
          onNodeClick={handleNodeClick}
          backgroundColor="#1a1a1a"
          nodeResolution={16}
        />
      )}
    </div>
  )
}


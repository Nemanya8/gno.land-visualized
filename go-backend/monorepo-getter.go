package main

import (
	"log"

	"github.com/gnolang/gno/gnovm/pkg/gnomod"
)

type ExtendedPkg struct {
	gnomod.Pkg
	Creator string
}

func getMonorepoPackages() []ExtendedPkg {
	path := "../gno/examples/gno.land"

	pkgs, err := gnomod.ListPkgs(path)
	if err != nil {
		log.Fatalf("Error listing packages: %v", err)
	}

	extendedPkgs := make([]ExtendedPkg, len(pkgs))
	for i, pkg := range pkgs {
		extendedPkgs[i] = ExtendedPkg{
			Pkg:     pkg,
			Creator: "monorepo",
		}
	}

	return extendedPkgs
}

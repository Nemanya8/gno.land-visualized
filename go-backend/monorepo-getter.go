package main

import (
	"log"
	"strings"

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

		//Maybe also remove examples/
		pkg.Dir = strings.TrimPrefix(pkg.Dir, "../gno/")

		extendedPkgs[i] = ExtendedPkg{
			Pkg:     pkg,
			Creator: "monorepo",
		}
	}

	return extendedPkgs
}

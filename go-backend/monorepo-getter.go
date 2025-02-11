package main

import (
	"fmt"
	"log"
	"strings"

	"github.com/gnolang/gno/gnovm/pkg/gnomod"
)

type ExtendedPkg struct {
	gnomod.Pkg
	Creator  string
	Imported []string
}

func getMonorepoPackages() []ExtendedPkg {
	path := "gno/examples/gno.land"

	pkgs, err := gnomod.ListPkgs(path)
	if err != nil {
		log.Fatalf("Error listing packages: %v", err)
	}

	extendedPkgs := make([]ExtendedPkg, len(pkgs))
	for i, pkg := range pkgs {

		pkg.Dir = strings.TrimPrefix(pkg.Dir, "gno/examples/")

		parts := strings.Split(pkg.Name, "/")
		if len(parts) > 0 {
			pkg.Name = parts[len(parts)-1]
		}

		extendedPkgs[i] = ExtendedPkg{
			Pkg:     pkg,
			Creator: "monorepo",
		}
	}

	fmt.Printf("Monorepo packages retrieved\n")

	return extendedPkgs
}

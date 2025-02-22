package monorepo

import (
	"fmt"
	"go-backend/domain"
	"log"
	"strings"

	"github.com/gnolang/gno/gnovm/pkg/gnomod"
)

func GetMonorepoPackages() []domain.ExtendedPkg {
	path := "gno/examples/gno.land"

	pkgs, err := gnomod.ListPkgs(path)
	if err != nil {
		log.Fatalf("Error listing packages: %v", err)
	}

	extendedPkgs := make([]domain.ExtendedPkg, len(pkgs))
	for i, pkg := range pkgs {
		pkg.Dir = strings.TrimPrefix(pkg.Dir, "gno/examples/")

		parts := strings.Split(pkg.Name, "/")
		if len(parts) > 0 {
			pkg.Name = parts[len(parts)-1]
		}

		extendedPkgs[i] = domain.ExtendedPkg{
			Pkg:          pkg,
			Creator:      "monorepo",
			Contributors: []domain.Contributor{},
		}
	}

	fmt.Printf("Monorepo packages retrieved\n")

	return extendedPkgs
}

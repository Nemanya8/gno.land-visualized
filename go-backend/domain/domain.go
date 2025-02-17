package domain

import "github.com/gnolang/gno/gnovm/pkg/gnomod"

type ExtendedPkg struct {
	gnomod.Pkg
	Creator  string
	Imported []string
}

type PackageData struct {
	Dir     string   `json:"Dir"`
	Name    string   `json:"Name"`
	Imports []string `json:"Imports"`
	Draft   bool     `json:"Draft"`
	Creator string   `json:"Creator"`
}

func ConvertToExtendedPackage(pkg PackageData) ExtendedPkg {
	return ExtendedPkg{
		Pkg: gnomod.Pkg{
			Dir:     pkg.Dir,
			Name:    pkg.Name,
			Imports: pkg.Imports,
			Draft:   pkg.Draft,
		},
		Creator: pkg.Creator,
	}
}

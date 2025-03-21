package domain

import "github.com/gnolang/gno/gnovm/pkg/gnomod"

type ExtendedPkg struct {
	gnomod.Pkg
	Creator      string
	Imported     []string
	Contributors []Contributor
}

type PackageData struct {
	Dir     string   `json:"Dir"`
	Name    string   `json:"Name"`
	Imports []string `json:"Imports"`
	Draft   bool     `json:"Draft"`
	Creator string   `json:"Creator"`
}

type Contributor struct {
	Name       string
	Email      string
	LOC        int
	Percentage float64
}

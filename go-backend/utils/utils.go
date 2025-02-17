package utils

import (
	"go-backend/domain"
	"net/http"

	"github.com/gnolang/gno/gnovm/pkg/gnomod"
)

func EnableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func GetAllImported(packages []domain.ExtendedPkg) []domain.ExtendedPkg {
	for i := 0; i < len(packages); i++ {
		packages[i].Imported = []string{}
		for j := 0; j < len(packages); j++ {
			for k := 0; k < len(packages[j].Imports); k++ {
				if packages[i].Dir == packages[j].Imports[k] {
					packages[i].Imported = append(packages[i].Imported, packages[j].Dir)
				}
			}
		}
	}

	return packages
}

func ConvertToExtendedPackage(pkg domain.PackageData) domain.ExtendedPkg {
	return domain.ExtendedPkg{
		Pkg: gnomod.Pkg{
			Dir:     pkg.Dir,
			Name:    pkg.Name,
			Imports: pkg.Imports,
			Draft:   pkg.Draft,
		},
		Creator: pkg.Creator,
	}
}

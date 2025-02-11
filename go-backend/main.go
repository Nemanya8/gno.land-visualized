package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	packages := getMonorepoPackages()

	var indexerPckgs, err = getIndexerPackages()
	if err != nil {
		fmt.Println(err)
	}

	packages = append(packages, indexerPckgs...)

	getAllImported(packages)
	SetPackagesData(packages)

	http.HandleFunc("/getAllPackages", enableCORS(GetAllPackages))
	fmt.Println("Starting server on :8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func getAllImported(packages []ExtendedPkg) []ExtendedPkg {
	for i := 0; i < len(packages)-1; i++ {
		for j := 0; j < len(packages); j++ {
			for k := 0; k < len(packages[j].Imports); k++ {
				if packages[i].Dir == packages[j].Imports[k] {
					packages[i].Imported = append(packages[i].Imported, packages[j].Dir)
				}
			}
		}
		if packages[i].Imported == nil {
			packages[i].Imported = []string{}
		}

	}

	return packages
}

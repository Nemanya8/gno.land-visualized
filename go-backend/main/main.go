package main

import (
	"fmt"
	"go-backend/indexer"
	"go-backend/monorepo"
	"go-backend/service"
	"go-backend/utils"
	"log"
	"net/http"
)

func main() {
	packages := monorepo.GetMonorepoPackages()

	indexerPckgs, err := indexer.GetIndexerPackages()
	if err != nil {
		fmt.Println(err)
	}

	packages = append(packages, indexerPckgs...)

	packages = utils.GetAllImported(packages)
	packages = utils.SortByName(packages)

	service.SetPackagesData(packages)

	http.HandleFunc("/getAllPackages", utils.EnableCORS(service.GetAllPackages))
	http.HandleFunc("/searchPackages", utils.EnableCORS(service.SearchPackages))
	http.HandleFunc("/filterPackages", utils.EnableCORS(service.FilterPackages))

	fmt.Println("Starting server on :8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

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

	SetPackagesData(packages)

	http.HandleFunc("/getAllPackages", enableCORS(GetAllPackages))
	fmt.Println("Starting server on :8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

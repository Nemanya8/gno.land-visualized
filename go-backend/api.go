package main

import (
	"encoding/json"
	"net/http"
)

var output []ExtendedPkg

func SetPackagesData(data []ExtendedPkg) {
	output = data
}

func GetAllPackages(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	err := json.NewEncoder(w).Encode(output)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

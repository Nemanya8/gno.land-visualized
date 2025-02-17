package service

import (
	"encoding/json"
	"go-backend/domain"
	"net/http"
	"strings"
)

var output []domain.ExtendedPkg

func SetPackagesData(data []domain.ExtendedPkg) {
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

func SearchPackages(w http.ResponseWriter, r *http.Request) {
	searchTerm := r.URL.Query().Get("search")
	if searchTerm == "" {
		http.Error(w, "search term is required", http.StatusBadRequest)
		return
	}

	var results []domain.ExtendedPkg
	for _, pkg := range output {
		if strings.Contains(pkg.Dir, searchTerm) || strings.Contains(pkg.Creator, searchTerm) {
			results = append(results, pkg)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	err := json.NewEncoder(w).Encode(results)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func FilterPackages(w http.ResponseWriter, r *http.Request) {
	param := r.URL.Query().Get("type")
	if param != "p" && param != "r" {
		http.Error(w, "type parameter must be 'p' or 'r'", http.StatusBadRequest)
		return
	}

	var prefix string
	if param == "p" {
		prefix = "gno.land/p/"
	} else {
		prefix = "gno.land/r/"
	}

	var results []domain.ExtendedPkg
	for _, pkg := range output {
		if strings.HasPrefix(pkg.Dir, prefix) {
			results = append(results, pkg)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	err := json.NewEncoder(w).Encode(results)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

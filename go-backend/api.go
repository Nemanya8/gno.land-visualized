package main

import (
	"encoding/json"
	"net/http"
	"strings"
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

func SearchPackages(w http.ResponseWriter, r *http.Request) {
	searchTerm := r.URL.Query().Get("search")
	if searchTerm == "" {
		http.Error(w, "search term is required", http.StatusBadRequest)
		return
	}

	var results []ExtendedPkg
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

	var results []ExtendedPkg
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

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
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

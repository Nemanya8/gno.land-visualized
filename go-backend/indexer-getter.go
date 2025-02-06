package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"regexp"
	"strings"

	"github.com/gnolang/gno/gnovm/pkg/gnomod"
)

type GraphQLQuery struct {
	Query string `json:"query"`
}

type GraphQLResponse struct {
	Data struct {
		Transactions []struct {
			BlockHeight int `json:"block_height"`
			Messages    []struct {
				Value struct {
					TypeName string `json:"__typename"`
					Creator  string `json:"creator"`
					Package  struct {
						Name  string `json:"name"`
						Path  string `json:"path"`
						Files []struct {
							Body string `json:"body"`
						} `json:"files"`
					} `json:"package"`
				} `json:"value"`
			} `json:"messages"`
		} `json:"transactions"`
	} `json:"data"`
}

type PackageData struct {
	Dir     string   `json:"Dir"`
	Name    string   `json:"Name"`
	Imports []string `json:"Imports"`
	Draft   bool     `json:"Draft"`
	Creator string   `json:"Creator"`
}

func convertToExtendedPackage(pkg PackageData) ExtendedPkg {
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

func getIndexerPackages() ([]ExtendedPkg, error) {
	query := `
	{
	transactions(filter: {success: true, message: {vm_param: {add_package: {}}}}) {
		block_height
		messages {
		value {
			__typename
			... on MsgAddPackage {
			creator
			package {
				name
				path
				files {
				body
				}
			}
			}
		}
		}
	}
	}
	`

	requestBody := GraphQLQuery{Query: query}
	requestBodyBytes, err := json.Marshal(requestBody)
	if err != nil {
		fmt.Println("Error marshaling request body:", err)
		return nil, err
	}

	resp, err := http.Post("https://indexer.test5.gno.land/graphql/query", "application/json", bytes.NewBuffer(requestBodyBytes))
	if err != nil {
		fmt.Println("Error sending request:", err)
		return nil, err
	}
	defer resp.Body.Close()

	responseBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return nil, err
	}

	var graphQLResponse GraphQLResponse
	err = json.Unmarshal(responseBody, &graphQLResponse)
	if err != nil {
		fmt.Println("Error unmarshaling response:", err)
		return nil, err
	}

	var output []ExtendedPkg
	importRegex := regexp.MustCompile(`import\s*\(([\s\S]*?)\)`)

	for _, transaction := range graphQLResponse.Data.Transactions {
		for _, message := range transaction.Messages {
			if message.Value.TypeName == "MsgAddPackage" {
				packageData := PackageData{
					Dir:     message.Value.Package.Path,
					Name:    message.Value.Package.Name,
					Draft:   false,
					Creator: message.Value.Creator,
					Imports: []string{}, // Initialize Imports as an empty slice
				}

				uniqueImports := make(map[string]bool)

				// Extract imports from all files in the package
				for _, file := range message.Value.Package.Files {
					matches := importRegex.FindAllStringSubmatch(file.Body, -1)
					for _, match := range matches {
						// Split the import block into individual imports
						imports := regexp.MustCompile(`\s*"[^"]+"\s*`).FindAllString(match[1], -1)
						for _, imp := range imports {
							// Clean up the import string
							imp = strings.TrimSpace(imp)
							imp = strings.Trim(imp, `"`)
							imp = strings.ReplaceAll(imp, "\n", "")
							imp = strings.ReplaceAll(imp, "\t", "")

							// Only save imports that start with "gno.land/"
							if strings.HasPrefix(imp, "gno.land/") && !uniqueImports[imp] {
								uniqueImports[imp] = true
								packageData.Imports = append(packageData.Imports, imp)
							}
						}
					}
				}

				extendedPackage := convertToExtendedPackage(packageData)
				output = append(output, extendedPackage)
			}
		}
	}

	return output, nil
}

package monorepo

import (
	"bufio"
	"fmt"
	"go-backend/domain"
	"os/exec"
	"sort"
	"strconv"
	"strings"
)

func GetContributors(filePath string) ([]domain.Contributor, error) {
	locCounts := make(map[string]domain.Contributor)
	totalLoc := 0

	cmd := exec.Command("git", "log", "--numstat", "--pretty=format:%an <%ae>", "--", ".")
	cmd.Dir = filePath
	output, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("error running git log on %s: %v", filePath, err)
	}

	scanner := bufio.NewScanner(strings.NewReader(string(output)))
	var currentContributor string

	for scanner.Scan() {
		line := scanner.Text()
		if line == "" {
			continue
		}

		parts := strings.Fields(line)

		if strings.Contains(line, "<") && strings.Contains(line, ">") {
			currentContributor = line
		} else if len(parts) == 3 {
			if currentContributor != "" {
				added, err := strconv.Atoi(parts[0])
				if err != nil {
					added = 0
				}
				removed, err := strconv.Atoi(parts[1])
				if err != nil {
					removed = 0
				}

				loc := added + removed
				if _, exists := locCounts[currentContributor]; !exists {
					locCounts[currentContributor] = domain.Contributor{
						Name:  strings.Split(currentContributor, " <")[0],
						Email: strings.Trim(strings.Split(currentContributor, "<")[1], ">"),
						LOC:   0,
					}
				}
				contributor := locCounts[currentContributor]
				contributor.LOC += loc
				locCounts[currentContributor] = contributor
				totalLoc += loc
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return nil, err
	}

	var contributors []domain.Contributor
	for _, contributor := range locCounts {
		if totalLoc > 0 {
			contributor.Percentage = round(float64(contributor.LOC)/float64(totalLoc)*100, 2)
		}
		contributors = append(contributors, contributor)
	}

	sort.Slice(contributors, func(i, j int) bool {
		return contributors[i].Percentage > contributors[j].Percentage
	})
	return contributors, nil
}

func round(num float64, places int) float64 {
	shift := float64(10 ^ places)
	return float64(int(num*shift)) / shift
}

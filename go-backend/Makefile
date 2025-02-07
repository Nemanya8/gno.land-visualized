BINARY_NAME = go-backend

GO_FILES = main.go monorepo-getter.go api.go indexer-getter.go

all: build

build:
	@echo "Building $(BINARY_NAME)..."
	go build -o $(BINARY_NAME) $(GO_FILES)
	@echo "Build complete. Binary: ./$(BINARY_NAME)"

run:
	@echo "Running $(BINARY_NAME)..."
	go run $(GO_FILES)

clean:
	@echo "Cleaning up..."
	rm -f $(BINARY_NAME)
	@echo "Clean complete."

help:
	@echo "Available targets:"
	@echo "  build  - Build the project (output: ./$(BINARY_NAME))"
	@echo "  run    - Run the project using 'go run'"
	@echo "  clean  - Remove the built binary"
	@echo "  help   - Show this help message"

.DEFAULT_GOAL := help
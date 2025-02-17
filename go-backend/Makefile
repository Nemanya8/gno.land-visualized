BINARY_NAME = go-backend

GO_FILES = main/main.go monorepo/monorepo.go indexer/indexer.go service/service.go utils/utils.go domain/domain.go

all: build

build:
	@echo "Building $(BINARY_NAME)..."
	go build -o $(BINARY_NAME) ./main
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

# Use the official Go image based on Debian for compatibility
FROM golang:1.23 AS builder

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy the Go files into the container
COPY . .

# Clone the gno repository
RUN git clone https://github.com/gnolang/gno.git

# Build the Go project
RUN echo "Building the project..." && \
    go build -o go-backend main.go monorepo-getter.go api.go indexer-getter.go && \
    echo "Build complete."

# Use a newer version of Debian with a more recent GLIBC version
FROM debian:bookworm-slim

# Install the necessary dependencies (glibc, git, etc.)
RUN apt-get update && \
    apt-get install -y libc6 git && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory inside the new image
WORKDIR /app

# Copy the binary and the Gno repository from the builder image
COPY --from=builder /app/go-backend /app/go-backend
COPY --from=builder /app/gno /app/gno

# Expose any ports you may need (adjust if necessary)
EXPOSE 8080

# Set the command to run your binary
CMD ["./go-backend"]

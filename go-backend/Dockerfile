FROM golang:1.24 AS builder

WORKDIR /app

COPY . .

RUN if [ ! -d "gno" ]; then git clone https://github.com/gnolang/gno.git; fi

RUN echo "Building the project..." && \
    make build && \
    echo "Build complete."

FROM debian:bookworm-slim

RUN apt-get update && \
    apt-get install -y libc6 git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/go-backend /app/go-backend
COPY --from=builder /app/gno /app/gno

EXPOSE 8080

CMD ["./go-backend"]

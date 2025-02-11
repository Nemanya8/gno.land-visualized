FROM golang:1.20 AS builder

WORKDIR /go/src/app

COPY go.mod go.sum ./
RUN go mod tidy

COPY . .

RUN make build

RUN git clone https://github.com/gnolang/gno.git /go/src/app/gno

FROM golang:1.20-alpine

WORKDIR /app

COPY --from=builder /go/src/app/go-backend/go-backend .

EXPOSE 8080

CMD ["./go-backend"]

# gno.land Visualized

This project visualizes the gno.land ecosystem using a Next.js frontend and a Go backend.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Go (v1.24 or higher)
- Docker (optional, for containerized backend)

## Running the Frontend

1. Navigate to the frontend directory:
    ```sh
    cd gnoland-visualized
    ```

2. Install the dependencies:
    ```sh
    npm install
    # or
    yarn install
    ```

3. Create a `.env.local` file:
    ```sh
    NEXT_PUBLIC_API_URL=http://localhost:8080
    ```

4. Start the development server:
    ```
    npm start
    ```

5. Open your browser and go to `http://localhost:3000` to see the application.

## Running the Backend

1. Navigate to the backend directory:
    ```sh
    cd go-backend
    ```

2. Build the backend:
    ```sh
    go build -o go-backend ./main
    ```

3. Run the backend:
    ```sh
    ./go-backend
    ```

4. The backend server will be running at `http://localhost:8080`.

## Running with Docker (Optional)

1. Navigate to the backend directory:
    ```sh
    cd go-backend
    ```
2. Build the Docker image:
    ```sh
    docker build -t go-backend .
    ```
3. Run the Docker container:
    ```sh
    docker run -p 8080:8080 go-backend
    ```

## Contributions
Contributions are welcome! Please open an issue or submit a pull request.

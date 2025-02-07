# gno.land Visualized

gno.land Visualized is a project that helps users visualize all realms and packages from the gno.land blockchain as an interactive graph. It enables a better understanding of the relationships between realms and packages, and provides an interactive experience where users can follow all imports on-chain. Additionally, it allows filtering of packages by various parameters such as the creator, making it easier to explore and track the package ecosystem.

---

## Features
* Visual representation of all realms and packages in the gno.land ecosystem.
* Interactive graph to explore connections and imports between packages.
* Filtering of packages by parameters like creator.
* Real-time data fetching from the live chain and monorepo.

---

## Technologies Used
* Backend: Go, REST API, GraphQL, [tx-indexer](https://github.com/gnolang/tx-indexer).
* Frontend: Next.js (React).

---

## How to Run
To get the project up and running locally, follow these steps:

1. Clone this repository:

``` bash
git clone https://github.com/Nemanya8/gno.land-visualized.git
cd gno.land-visualized
```
2. Clone the gno.land repository into the root of this project:

```bash
git clone https://github.com/gnolang/gno.git
```

3. Build and run backend

```bash
cd go-backend
make build
./go-backend
```

4. In another terminal build and run frontend

### *Right now build fails, run in dev*

```bash
cd gnoland-visualized
npm install
npm run build
npm run start

// For development
npm run dev
```

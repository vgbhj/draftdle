# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Draftdle is a Dota 2 draft web app. A Go backend (Echo + SQLite) serves a JSON API and the built React frontend as static files from a single binary on port 8080. A separate parser binary populates the SQLite DB from the OpenDota API.

## Repo layout

- `backend/` — Go module `github.com/vgbhj/draftdle` (Go 1.25, CGO + sqlite).
  - `cmd/api/main.go` — HTTP server entrypoint. Opens `./data/dota.db`, starts `server.NewServer(":8080", db)`.
  - `cmd/parser/main.go` — Long-running updater. Calls `parser.InitConfig`, then on a 1h ticker runs `syncNewLeagues` + `refreshRecentLeaguesMatches` against OpenDota.
  - `internal/draft/{repository,usecase,delivery/http}` — Clean-architecture layering for the draft feature. Wired together in `internal/server/handlers.go` under `/api/v1/draft`.
  - `internal/server/handlers.go` — Also mounts `frontend/dist` as static (HTML5 fallback) so the same Echo instance serves the SPA.
  - `pkg/parser/parser.go` — OpenDota client + rate limiter (`golang.org/x/time/rate`). `InitConfig(enableApi, rateEvery, burst)` toggles network calls.
  - `pkg/db/sqlite` — `NewSqliteDB` opener (`modernc.org/sqlite`, no CGO needed at runtime in API; parser uses same driver).
  - `migrations/` — Plain `.up.sql` / `.down.sql` files (golang-migrate naming). Not auto-applied; apply manually against `backend/data/dota.db`.
  - `data/dota.db` — SQLite file, mounted as a volume in Docker.
- `frontend/` — Vite + React 19 + TS + Tailwind v4 SPA. Built output in `frontend/dist` is what the Go server serves.
- `Dockerfile` (root) — Multi-stage: builds frontend (`npm run build`), then backend (`CGO_ENABLED=1`), then alpine runtime image that runs `./backend` and serves `frontend/dist`. Only the API is built into the image — the parser is not.
- `docker-compose.yml` (root) — Production-ish image, mounts `./backend/data` for DB persistence.
- `backend/docker-compose.yaml` — Backend-only variant.

## Common commands

Backend (run from `backend/`):
```
go run ./cmd/api          # API server on :8080, expects ./data/dota.db
go run ./cmd/parser       # Run the OpenDota updater loop
go build ./cmd/api        # Build server binary (needs CGO + sqlite-dev)
go test ./...             # Run tests
go test ./internal/draft/usecase -run TestName   # Single test
```

Frontend (run from `frontend/`):
```
npm install
npm run dev               # Vite dev server
npm run build             # tsc -b && vite build → frontend/dist
npm run lint              # eslint .
```

Full app via Docker (from repo root):
```
docker compose up --build     # Builds frontend+backend, serves both on :8080
```

## Architecture notes

- **Single-binary deployment.** The Go server both exposes `/api/v1/...` and serves the React SPA from `frontend/dist` with HTML5 history fallback. When developing the frontend against a running backend, either run `npm run build` to refresh `dist`, or use Vite dev server and point API calls at `:8080`.
- **Draft feature follows repo→usecase→delivery layering.** New endpoints should be wired in `internal/server/handlers.go` after adding repo/usecase/handler under `internal/<feature>/`.
- **Parser is deliberately decoupled.** The API binary never calls OpenDota; it only reads the SQLite DB the parser writes. To populate data locally, run `cmd/parser` once (and note the rate limit defaults in `parser.InitConfig` — the commented-out lines show higher-throughput configs).
- **Migrations are not run automatically.** Apply `backend/migrations/*.up.sql` manually (e.g. via `golang-migrate`) when schema changes.

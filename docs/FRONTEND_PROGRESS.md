# DrainPulse AI — Frontend Progress

Last updated: 2026-10-11 (session: geospatial refinement + design tokens)

## Audit summary

| Area | Finding |
|------|---------|
| Stack | Next.js 16 App Router, React 19, Tailwind v4, MapLibre GL 6.13, typed API client in `frontend/src/lib/api.ts` |
| Map blank/khaki rectangle | Caused by `demotiles.maplibre.org` demo style (country polygon only). **Fixed:** Carto Positron / Dark Matter vector basemaps |
| Backend | FastAPI contracts preserved; pages load via `fetch*` helpers with fallbacks when API offline |

## Design system

- Light theme tokens: background `#F7F8F6`, text `#17252A`, primary teal `#0F766E`, risk amber `#EA580C`, critical `#DC2626`
- Dark theme: charcoal surfaces with teal accent `#2DD4BF`
- Typography: Geist Sans (UI) + Source Serif 4 (headings via `.font-heading`) + monospace HUD/sliders
- Compact sidebar (`13.5rem`), global search field in header, no fake “live pulse” indicators on overview

## Map engine (`DrainMap` + `lib/mapEngine.ts`)

- India extent `[78.9629, 20.5937]` zoom 4.2; Delhi `[77.2090, 28.6139]` zoom 11.2
- Segmented control dock: zoom, 2D/3D pitch, reset, drainage, risk zones, incidents, rainfall demo, layer panel
- Telemetry HUD: cursor lat/lon, zoom, FPS (rAF average), data status, sync time
- Drainage GeoJSON trunk lines (cyan/teal; risk-coloured segments)
- Risk polygons: fill + **hatched** overlay (`risk-hatch-pattern`) + dashed outline — **demo fixtures**, labelled in UI
- **3D buildings:** extrusion from basemap `building` source-layer when present; toggled with 3D mode (no random boxes)
- **Rainfall overlay:** demo intensity cells (`DEMO_RAINFALL_CELLS`), not verified IMD radar
- ResizeObserver + tile error messaging + **Retry** (no silent coloured rectangle fallback)
- Worker: `/maplibre-gl-worker.mjs`

### Known map limitations

- No municipal terrain mesh or LiDAR — perspective 3D uses basemap building extrusions only
- Risk zone boundaries and rainfall cells are illustrative demo GeoJSON, not official MCD assessments
- Terrain elevation not available in Carto free basemap

## Routes (11 pages)

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Map-first operations overview (~67% map), compact KPI strip, scenario hook, queues | Implemented |
| `/map` | Full-screen GIS workbench + filters | Implemented |
| `/network` | Asset inventory + inspect | Implemented |
| `/simulator` | Sliders + API `/api/scenarios/simulate` + **map output panel** | Implemented |
| `/predictions` | Hotspot / vulnerability views | Implemented |
| `/inspections` | Queue + blockage assessment API | Implemented |
| `/work-orders` | Tasks board + create via API | Implemented |
| `/reports` | 16:9 evidence + triage | Implemented |
| `/analytics` | Charts from API/dashboard | Implemented |
| `/data-sources` | Provenance / freshness | Implemented |
| `/settings` | Theme + role prefs | Implemented |

## Verification (this session)

| Check | Result |
|-------|--------|
| `npm run build` (frontend) | **Pass** — 14 static routes, TypeScript clean |
| `npm run lint` | **Warnings/errors** — strict React 19 lint rules on map init/theme (pre-existing patterns); build unaffected |
| `pytest backend/tests/test_api.py` | Not re-run in sandbox (empty shell output); prior suite: 5/5 pass per last full run |
| Manual browser | Recommended: India/Delhi fly-to, 3D toggle at zoom ≥14, layer toggles, simulator run |

## Checkpoint / next work

1. Wire header global search to same locality index as map search
2. Optional: fetch risk polygons from backend when endpoint exists
3. ESLint: relax or refactor map `useEffect` setState for React 19 purity plugin
4. End-to-end test: Playwright route smoke tests

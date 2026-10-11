# DrainPulse AI — Frontend Redesign Architecture & Implementation Plan

## Executive Summary
DrainPulse AI is transitioning from an incomplete, single-page dark-themed prototype with a placeholder map into a comprehensive, human-designed, multi-page geospatial intelligence platform for urban drainage management in India (starting with Delhi as the flagship municipal showcase).

---

## 1. Audit Findings & Root Cause Analysis

### Map Rendering Failure (Yellow Rectangle)
- **Root Cause**: `mapStyle="https://demotiles.maplibre.org/style.json"` was being loaded. This MapLibre demo style only contains a low-resolution world country polygon styled in khaki/pale yellow (`#EDE3B4`), with no street networks, rivers, building footprints, or regional boundaries for India.
- **Solution**: Switch to high-resolution, CartoDB Positron (`https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`) for the clean GIS light theme, CartoDB Voyager for topographical exploration, and CartoDB Dark Matter for dark theme, backed by public OpenStreetMap raster tiles fallback.

### Visual Architecture Issues
- **Single Page Monolith**: All features were jammed into a single `src/app/page.tsx` file with no deep-linking or dedicated operational workflows.
- **Dark Mode Only**: The previous UI forced dark mode with neon accents and generic AI card rows.
- **Solution**: Light theme by default (warm off-white `#F8F9FA`, clean white surfaces, deep navy `#0F172A` typography, subtle neutral borders, restrained cyan `#0284C7`/`#0891B2` branding), paired with a functional dark mode toggle.

---

## 2. Multi-Page Application Architecture

The application is structured into the following routes:

| Route | Purpose | Key Components & Capabilities |
|---|---|---|
| `/` | **Operational Overview** | Map-first cockpit (65% viewport), quick KPIs, selected drain quick-view, recent incident feed, rainfall scenario quick-selector. |
| `/map` | **Full-Screen GIS Map** | 2D/3D perspective toggle, building extrusions, drain line & outfall layers, rainfall radar simulation layer, India/Delhi bounds selector, layer filters. |
| `/network` | **Drainage Network Explorer** | Comprehensive asset inventory, ward/zone filters, search, silt/blockage/capacity telemetry, GeoJSON network line visualization. |
| `/predictions` | **Waterlogging Predictions** | ML vulnerability index, hotspot ranking, terrain slope and runoff accumulation analysis, risk tier breakdowns. |
| `/simulator` | **Rainfall Scenario Simulator** | Fine-grained simulation controls (intensity mm/hr, storm duration, drainage blockage penalty), before vs. after comparison, emergency crew dispatch recommendations. |
| `/inspections` | **Inspection Management** | Physical inspection queue, AI blockage assessment tool with camera/evidence view, verified findings submission. |
| `/work-orders` | **Maintenance Operations** | Work order dispatch board, SLA countdown timers, crew allocation (North/South/East/Central), task status transitions. |
| `/reports` | **Citizen & Field Incidents** | Incident triage dashboard, geographic pinpointing, severity assessment, citizen report verification workflow. |
| `/analytics` | **Hydrological Analytics** | Ward-level risk trends, siltation vs. rainfall correlation charts, maintenance backlog velocity, exportable reports. |
| `/data-sources` | **Data Provenance & Sensors** | Sensor health, telemetry freshness, municipal GIS layer attribution, synthetic vs. verified data indicators. |
| `/settings` | **System & Preferences** | Theme toggle (Light/Dark), municipal tenant context, simulation baseline parameters, API connection status. |

---

## 3. Geospatial & 3D Digital Twin Architecture

1. **Basemap Providers**:
   - Primary Light GIS: CartoDB Positron Vector Style (OpenStreetMap attribution).
   - Rich Topographical: CartoDB Voyager.
   - Dark Mode: CartoDB Dark Matter.
   - Resilient Fallback: Standard OpenStreetMap raster tile source.
2. **Geographical Navigation**:
   - Initial national extent: Indian Subcontinent (`[78.9629, 20.5937]`, zoom 4.2).
   - Municipal showcase: National Capital Territory of Delhi (`[77.2090, 28.6139]`, zoom 11.2).
   - Localities: Saket, Rohini, Lajpat Nagar, Shahdara, Azadpur, Bawana, Connaught Place, Barapullah Basin.
3. **3D Perspective & Digital Twin**:
   - MapLibre GL camera pitch up to 60°, smooth bearing rotation.
   - 3D building extrusion styling layer with elevation lighting.
   - 3D hydrological flow lines with directional pulses.
   - Reset camera & 2D/3D toggle controls.

---

## 4. Design System Tokens (Light-First GIS Operations)

- **App Background**: `#F8FAFC` (Slate 50)
- **Surface Cards**: `#FFFFFF` with `border: 1px solid #E2E8F0`
- **Primary Typography**: Deep navy `#0F172A`
- **Secondary Typography**: Slate `#64748B`
- **DrainPulse Primary Accent**: `#0284C7` (Sky 600) / `#0891B2` (Cyan 600)
- **Risk Spectrum**:
  - Critical: Crimson `#DC2626` (Bg: `#FEF2F2`, Border: `#FECACA`)
  - High: Orange `#EA580C` (Bg: `#FFF7ED`, Border: `#FFEDD5`)
  - Moderate: Amber `#D97706` (Bg: `#FFFBEB`, Border: `#FEF3C7`)
  - Low / Cleared: Emerald `#16A34A` (Bg: `#F0FDF4`, Border: `#DCFCE7`)
- **Elevation**: Flat with subtle 1px border lines and faint shadows (`0 1px 3px 0 rgb(0 0 0 / 0.05)`).

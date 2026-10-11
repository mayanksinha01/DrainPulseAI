# Known Limitations

- This project uses SQLite instead of PostgreSQL/PostGIS for local execution; it is designed to be migrated to PostGIS later without changing the product model.
- The rainfall simulation uses deterministic heuristics rather than a calibrated hydrology model or external sensor feeds.
- Map visualisation is an interactive local overlay rather than a full city-scale GIS layer with live remote basemaps.
- Image-based blockage assessment is implemented as a structured rule-based scoring flow rather than a remote AI vision API.
- The platform is a production-oriented prototype for local demonstration and developer validation, not a fully deployed municipal production system.

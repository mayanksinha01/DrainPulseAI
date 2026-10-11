"use client";

import React from "react";
import {
  Database,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Server,
  Radio,
  FileCode,
  ExternalLink,
} from "lucide-react";

interface DataSourceItem {
  id: string;
  name: string;
  authority: string;
  type: "vector_gis" | "iot_telemetry" | "meteorological" | "crowdsourced";
  status: "verified_live" | "hourly_batch" | "municipal_import";
  frequency: string;
  coverage: string;
  lastSync: string;
  recordsCount: string;
  notes: string;
}

const DATA_SOURCES: DataSourceItem[] = [
  {
    id: "ds-mcd-gis",
    name: "Delhi Municipal Corporation Arterial GIS Cadastre",
    authority: "Municipal Corporation of Delhi (MCD) / PWD",
    type: "vector_gis",
    status: "verified_live",
    frequency: "Daily Validation",
    coverage: "NCT of Delhi (11 Districts, 250 Wards)",
    lastSync: "Today, 06:00 IST",
    recordsCount: "428 Drain Nodes & Outfalls",
    notes: "Official shapefile layer imported with cross-sectional design discharge capacity.",
  },
  {
    id: "ds-imd-radar",
    name: "India Meteorological Department (IMD) Doppler Radar",
    authority: "Ministry of Earth Sciences, Govt of India",
    type: "meteorological",
    status: "verified_live",
    frequency: "10-Minute Radar Scan",
    coverage: "Delhi-NCR 100km Doppler Radius",
    lastSync: "3 mins ago",
    recordsCount: "Live Precipitation Grids",
    notes: "Nowcasting precipitation rates used to calibrate storm scenario engines.",
  },
  {
    id: "ds-iot-loggers",
    name: "Ultrasonic Water Level Sensors & Telemetry Loggers",
    authority: "Delhi Jal Board (DJB) Monitoring Cell",
    type: "iot_telemetry",
    status: "verified_live",
    frequency: "5-Minute Telemetry Stream",
    coverage: "12 Primary Trunk Canals (Barapullah, Najafgarh, etc.)",
    lastSync: "Just now",
    recordsCount: "24 Logger Feeds",
    notes: "Ultrasonic stage loggers providing real-time channel surcharge elevation.",
  },
  {
    id: "ds-citizen-feed",
    name: "DrainPulse Public Civic Portal & Inspector Patrol App",
    authority: "DrainPulse Municipal Citizen Engagement",
    type: "crowdsourced",
    status: "hourly_batch",
    frequency: "Real-time Event Ingestion",
    coverage: "All Delhi Wards",
    lastSync: "12 mins ago",
    recordsCount: "27 Open Incident Submissions",
    notes: "Crowdsourced smartphone photographs and geo-tagged waterlogging reports.",
  },
  {
    id: "ds-carto-osm",
    name: "OpenStreetMap India & CartoDB Basemap Vector Service",
    authority: "OpenStreetMap Contributors & CartoDB",
    type: "vector_gis",
    status: "verified_live",
    frequency: "Persistent Vector Tile CDN",
    coverage: "Pan-India Subcontinent & Delhi Urban Fabric",
    lastSync: "Live Tile Cache",
    recordsCount: "Global & Indian Street Network",
    notes: "Geographically verified basemap with highway corridors and river basin boundaries.",
  },
];

export default function DataSourcesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <Database className="h-4 w-4" />
            <span>Data Provenance & Assurance</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Data Sources & Sensor Telemetry Provenance
          </h2>
          <p className="text-xs text-slate-500">
            Audit trail, sensor health, municipal GIS layer attribution, and telemetry freshness verification
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>All 5 Feeds Operational</span>
        </div>
      </div>

      {/* Provenance List */}
      <div className="space-y-4">
        {DATA_SOURCES.map((source) => (
          <div
            key={source.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                  {source.authority}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {source.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase">
                  {source.status.replace("_", " ")}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400">Update Frequency</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {source.frequency}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Geographic Coverage</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {source.coverage}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Ingestion Records</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {source.recordsCount}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Last Telemetry Sync</span>
                <div className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {source.lastSync}
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-50 pt-2.5 dark:border-slate-800/60 leading-relaxed">
              {source.notes}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

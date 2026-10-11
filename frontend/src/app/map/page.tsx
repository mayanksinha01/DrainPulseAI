"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Layers,
  Filter,
  Search,
  MapPin,
  Compass,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import DrainMap from "@/components/DrainMap";
import { DrainAsset, IncidentReport, fetchAssets, fetchReports } from "@/lib/api";

export default function FullscreenMapPage() {
  const [assets, setAssets] = useState<DrainAsset[]>([]);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<DrainAsset | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [assetData, reportData] = await Promise.all([
          fetchAssets(),
          fetchReports(),
        ]);
        setAssets(assetData);
        setReports(reportData);
        if (assetData.length > 0) {
          setSelectedAsset(assetData[0]);
        }
      } catch (err) {
        console.error("Failed to load map data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (selectedZone !== "all" && !asset.zone.toLowerCase().includes(selectedZone.toLowerCase())) {
        return false;
      }
      if (selectedRiskFilter === "critical" && (asset.risk ?? 0) < 75) return false;
      if (selectedRiskFilter === "high" && ((asset.risk ?? 0) < 58 || (asset.risk ?? 0) >= 75)) return false;
      if (selectedRiskFilter === "moderate" && (asset.risk ?? 0) >= 58) return false;
      return true;
    });
  }, [assets, selectedZone, selectedRiskFilter]);

  return (
    <div className="relative flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Top Filter and GIS Controls Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-sky-600" />
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Delhi NCT Geospatial Drainage Twin
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            {filteredAssets.length} Active Nodes
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-slate-700 dark:bg-slate-800">
            <span className="text-slate-500">Zone:</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-transparent font-medium text-slate-800 outline-none dark:text-slate-200"
            >
              <option value="all">All Zones</option>
              <option value="South Delhi">South Delhi</option>
              <option value="North West">North West Delhi</option>
              <option value="North Delhi">North Delhi</option>
              <option value="East Delhi">East Delhi</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-slate-700 dark:bg-slate-800">
            <span className="text-slate-500">Risk:</span>
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 outline-none dark:text-slate-200"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical (&ge;75)</option>
              <option value="high">High (58-74)</option>
              <option value="moderate">Moderate (&lt;58)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Map Container (Full remaining viewport height) */}
      <div className="flex-1 w-full relative">
        <DrainMap
          assets={filteredAssets}
          reports={reports}
          selectedAsset={selectedAsset}
          onSelectAsset={setSelectedAsset}
          height="100%"
        />
      </div>
    </div>
  );
}

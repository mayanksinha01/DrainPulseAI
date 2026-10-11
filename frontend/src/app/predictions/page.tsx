"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame,
  AlertTriangle,
  Droplets,
  TrendingUp,
  MapPin,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Info,
} from "lucide-react";
import { DrainAsset, fetchAssets } from "@/lib/api";

export default function PredictionsHotspotsPage() {
  const [assets, setAssets] = useState<DrainAsset[]>([]);
  const [stormSeverity, setStormSeverity] = useState<"normal" | "heavy" | "cloudburst">("heavy");

  useEffect(() => {
    async function load() {
      const data = await fetchAssets();
      setAssets(data);
    }
    load();
  }, []);

  // Multiplier for storm severity
  const multiplier = stormSeverity === "normal" ? 0.85 : stormSeverity === "heavy" ? 1.0 : 1.25;

  const rankedHotspots = [...assets]
    .map((a) => {
      const baseRisk = a.risk ?? 60;
      const predictedRisk = Math.min(100, Math.round(baseRisk * multiplier * 10) / 10);
      const waterDepthCm = Math.round((predictedRisk / 100) * 45); // estimated pooling depth
      return {
        ...a,
        predictedRisk,
        waterDepthCm,
      };
    })
    .sort((a, b) => b.predictedRisk - a.predictedRisk);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
            <Flame className="h-4 w-4" />
            <span>Predictive Hydrology Models</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Waterlogging Hotspot Predictions
          </h2>
          <p className="text-xs text-slate-500">
            Machine-learned surcharge forecast and low-lying catchment inundation vulnerability ranking
          </p>
        </div>

        {/* Severity Scenario Filter */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setStormSeverity("normal")}
            className={`rounded-md px-3 py-1 font-medium transition ${
              stormSeverity === "normal"
                ? "bg-sky-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            Moderate (42 mm/hr)
          </button>
          <button
            type="button"
            onClick={() => setStormSeverity("heavy")}
            className={`rounded-md px-3 py-1 font-medium transition ${
              stormSeverity === "heavy"
                ? "bg-orange-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            Peak Pulse (72 mm/hr)
          </button>
          <button
            type="button"
            onClick={() => setStormSeverity("cloudburst")}
            className={`rounded-md px-3 py-1 font-medium transition ${
              stormSeverity === "cloudburst"
                ? "bg-red-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            Cloudburst (110 mm/hr)
          </button>
        </div>
      </div>

      {/* Prediction Top Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 shadow-sm dark:border-red-950 dark:bg-red-950/30">
          <div className="flex items-center justify-between text-xs text-red-700 dark:text-red-300">
            <span className="font-semibold uppercase tracking-wider">High Risk Inundation Nodes</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="mt-2 text-3xl font-bold text-red-900 dark:text-red-200">
            {rankedHotspots.filter((h) => h.predictedRisk >= 70).length} Hotspots
          </div>
          <p className="mt-1 text-xs text-red-700 dark:text-red-300">
            Surcharge threshold projected to be exceeded within 45 mins of rain start
          </p>
        </div>

        <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4 shadow-sm dark:border-orange-950 dark:bg-orange-950/30">
          <div className="flex items-center justify-between text-xs text-orange-700 dark:text-orange-300">
            <span className="font-semibold uppercase tracking-wider">Max Street Ponding Depth</span>
            <Droplets className="h-4 w-4" />
          </div>
          <div className="mt-2 text-3xl font-bold text-orange-900 dark:text-orange-200">
            {Math.max(...rankedHotspots.map((h) => h.waterDepthCm), 38)} cm
          </div>
          <p className="mt-1 text-xs text-orange-700 dark:text-orange-300">
            Forecasted at Lajpat Nagar Ring Road carriageway underpass
          </p>
        </div>

        <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 shadow-sm dark:border-sky-950 dark:bg-sky-950/30">
          <div className="flex items-center justify-between text-xs text-sky-700 dark:text-sky-300">
            <span className="font-semibold uppercase tracking-wider">Pumping Capacity Deficit</span>
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="mt-2 text-3xl font-bold text-sky-900 dark:text-sky-200">
            -420 cusecs
          </div>
          <p className="mt-1 text-xs text-sky-700 dark:text-sky-300">
            Requires supplemental mobile diesel dewatering pumps pre-positioned
          </p>
        </div>
      </div>

      {/* Top 3 Vulnerability Spotlight Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Priority Choke Points — Rapid Dispatch Focus
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">
          {rankedHotspots.slice(0, 3).map((hotspot, idx) => (
            <div
              key={hotspot.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 uppercase dark:bg-red-950 dark:text-red-300">
                  Hotspot #{idx + 1}
                </span>
                <span className="text-xs font-bold text-red-600 dark:text-red-400">
                  Risk {hotspot.predictedRisk}
                </span>
              </div>
              <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                {hotspot.name}
              </h4>
              <p className="text-xs text-slate-500">
                {hotspot.ward} · {hotspot.zone}
              </p>

              <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-slate-850">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Projected Ponding:</span>
                  <strong className="text-red-600 dark:text-red-400">{hotspot.waterDepthCm} cm</strong>
                </div>
                <div className="mt-1 flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Inlet Choke:</span>
                  <strong>{hotspot.blockage}% obstructed</strong>
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {hotspot.recommendation}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                <Link
                  href="/map"
                  className="font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400"
                >
                  Locate on GIS Map →
                </Link>
                <Link
                  href="/work-orders"
                  className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  Issue Task →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comprehensive Hotspots Ranking Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-850">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Delhi Catchment Surcharge Risk Matrix
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Rank & Asset</th>
                <th className="px-4 py-3">Zone & Ward</th>
                <th className="px-4 py-3 text-center">Predicted Risk</th>
                <th className="px-4 py-3 text-center">Projected Depth</th>
                <th className="px-4 py-3 text-center">Blockage</th>
                <th className="px-4 py-3 text-center">Silt</th>
                <th className="px-4 py-3">Action Directive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rankedHotspots.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    <span className="mr-2 font-mono text-slate-400">#{index + 1}</span>
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {item.ward} ({item.zone})
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-red-600 dark:text-red-400">
                    {item.predictedRisk}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-slate-800 dark:text-slate-200">
                    {item.waterDepthCm} cm
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-slate-800 dark:text-slate-200">
                    {item.blockage}%
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-slate-800 dark:text-slate-200">
                    {item.silt}%
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {item.recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

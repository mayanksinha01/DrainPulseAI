"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  Users,
  Wrench,
  CloudRain,
  MapPin,
  ArrowUpRight,
  TrendingUp,
  Droplets,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import DrainMap from "@/components/DrainMap";
import {
  DrainAsset,
  IncidentReport,
  RainfallScenario,
  DashboardPayload,
  fetchDashboard,
  fetchAssets,
  fetchReports,
  fetchScenarios,
  simulateScenario,
} from "@/lib/api";

export default function OperationalOverviewPage() {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [assets, setAssets] = useState<DrainAsset[]>([]);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [scenarios, setScenarios] = useState<RainfallScenario[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<DrainAsset | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<number>(2);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  // Load initial operational data
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [dashData, assetData, reportData, scenarioData] = await Promise.all([
          fetchDashboard(),
          fetchAssets(),
          fetchReports(),
          fetchScenarios(),
        ]);
        setDashboard(dashData);
        setAssets(assetData);
        setReports(reportData);
        setScenarios(scenarioData);
        if (assetData.length > 0) {
          setSelectedAsset(assetData[0]);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const activeScenario = useMemo(
    () => scenarios.find((s) => s.id === selectedScenarioId) ?? scenarios[0],
    [scenarios, selectedScenarioId]
  );

  // Dynamically simulate scenario when active scenario changes
  const handleScenarioChange = async (scenarioId: number) => {
    setSelectedScenarioId(scenarioId);
    const targetScenario = scenarios.find((s) => s.id === scenarioId);
    if (!targetScenario) return;

    setSimulating(true);
    try {
      const simResult = await simulateScenario(targetScenario.id, targetScenario.intensity_mm);
      setDashboard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          summary: {
            ...prev.summary,
            risk_index: simResult.risk_index,
            critical_assets: simResult.critical_assets,
            high_priority: simResult.high_priority,
          },
        };
      });

      // Update assets with simulated scores
      setAssets((prev) =>
        prev.map((asset) => {
          const match = simResult.top_assets.find((t) => t.id === asset.id);
          if (match) {
            return {
              ...asset,
              risk: match.risk,
              priority: match.priority as any,
              recommendation: match.recommendation,
            };
          }
          return asset;
        })
      );
    } catch (err) {
      console.warn("Simulation call error:", err);
    } finally {
      setSimulating(false);
    }
  };

  const priorityList = useMemo(
    () => [...assets].sort((a, b) => (b.risk ?? 0) - (a.risk ?? 0)).slice(0, 5),
    [assets]
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Operations Header & Context Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <p className="text-xs text-[var(--muted)]">
            City operations · Delhi NCT drainage basin
          </p>
          <h2 className="font-heading mt-0.5 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Observe the network, simulate rainfall, prioritise intervention
          </h2>
        </div>

        {/* Operational Context Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Monsoon Cycle 2026</span>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--muted)]">
            <span className="status-dot resolved" aria-hidden="true" />
            <span>
              Data sync {loading ? "…" : dashboard ? "from API" : "unavailable"}
            </span>
          </div>
        </div>
      </div>

      {/* Compact operational readout strip */}
      <div className="flex flex-wrap divide-x divide-[var(--row-divider)] rounded-md border border-[var(--border)] bg-[var(--surface)] text-xs shadow-sm">
        {[
          { label: "Basin risk index", value: dashboard?.summary.risk_index ?? "—", suffix: "/100", icon: ShieldAlert },
          { label: "Critical drains", value: dashboard?.summary.critical_assets ?? "—", suffix: "≥75", icon: AlertTriangle, tone: "text-red-600" },
          { label: "Open incidents", value: dashboard?.summary.open_reports ?? reports.length, suffix: "queue", icon: Users },
          { label: "Work orders", value: dashboard?.summary.active_tasks ?? "—", suffix: "active", icon: Wrench },
          { label: "Mapped assets", value: dashboard?.summary.total_assets ?? assets.length, suffix: "nodes", icon: Layers },
        ].map(({ label, value, suffix, icon: Icon, tone }) => (
          <div key={label} className="flex min-w-[9rem] flex-1 items-center gap-2 px-4 py-2.5">
            <Icon className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-[var(--muted)]">{label}</div>
              <div className={`font-mono-numbers text-sm font-semibold ${tone ?? "text-[var(--foreground)]"}`}>
                {value} <span className="text-[10px] font-normal text-[var(--muted)]">{suffix}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Operational Area: Map Cockpit (65%) + Context & Scenario Controls (35%) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Interactive GIS Map Workspace (Occupies 8 Cols, ~67% width) */}
        <div className="space-y-3 lg:col-span-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-sky-600" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Drainage Risk Surface & 3D Network Twin
              </h3>
            </div>
            <Link
              href="/map"
              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
            >
              Full Screen GIS Workbench <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <DrainMap
            assets={assets}
            reports={reports}
            selectedAsset={selectedAsset}
            onSelectAsset={setSelectedAsset}
            height="520px"
          />
        </div>

        {/* Right Side Operational Panels (4 Cols) */}
        <div className="space-y-4 lg:col-span-4">
          {/* Active Rainfall Scenario Simulation Selector */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudRain className="h-4 w-4 text-sky-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Monsoon Scenario Engine
                </h4>
              </div>
              {simulating && (
                <span className="flex items-center gap-1 text-[11px] text-sky-600">
                  <RefreshCw className="h-3 w-3 animate-spin" /> Simulating…
                </span>
              )}
            </div>

            <div className="mt-3">
              <label className="text-xs text-slate-500">Active Atmospheric Model</label>
              <select
                value={selectedScenarioId}
                onChange={(e) => handleScenarioChange(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 outline-none transition focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {scenarios.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Scenario Projected Telemetry */}
            <div className="mt-3 rounded-lg border border-sky-100 bg-sky-50/70 p-3 text-xs dark:border-sky-950 dark:bg-sky-950/40">
              <div className="flex items-baseline justify-between">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  Rainfall Intensity
                </span>
                <span className="text-base font-bold text-sky-800 dark:text-sky-300">
                  {activeScenario?.intensity_mm ?? 72} mm/hr
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Duration: {activeScenario?.duration_hours ?? 4} hours</span>
                <span>Period: {activeScenario?.return_period ?? "5-year"}</span>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <strong className="text-slate-800 dark:text-slate-200">Municipal Directive: </strong>
              {activeScenario?.recommendation ?? "Trigger emergency desilting in high-risk zones."}
            </p>

            <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
              <Link
                href="/simulator"
                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400"
              >
                Advanced Scenario Simulator <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Quick Selected Asset Summary */}
          {selectedAsset && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Inspected Node
                </div>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                    selectedAsset.priority === "critical"
                      ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                      : "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                  }`}
                >
                  {selectedAsset.priority}
                </span>
              </div>
              <h4 className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                {selectedAsset.name}
              </h4>
              <p className="text-xs text-slate-500">
                {selectedAsset.ward} · {selectedAsset.zone}
              </p>

              <div className="mt-3 grid grid-cols-3 gap-2 border-y border-slate-100 py-2 text-center text-xs dark:border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-400">Risk Score</div>
                  <div className="text-sm font-bold text-red-600 dark:text-red-400">
                    {selectedAsset.risk ?? 60}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Blockage</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {selectedAsset.blockage}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Silt Surcharge</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {selectedAsset.silt}%
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <Link
                  href="/inspections"
                  className="font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400"
                >
                  Log AI Inspection →
                </Link>
                <Link
                  href="/work-orders"
                  className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  Dispatch Crew →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Operational Area: Priority Action Queue & Citizen Incident Feed */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Priority Maintenance & Inspection Queue (7 Cols) — compact row list */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Municipal Action Queue
              </h3>
              <p className="text-xs text-slate-500">Ranked by hydraulic surcharge vulnerability</p>
            </div>
            <Link
              href="/network"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400"
            >
              View Network ({assets.length}) →
            </Link>
          </div>

          <div className="px-4">
            {priorityList.map((asset, index) => (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`flex cursor-pointer items-center justify-between py-3 transition ${
                  index < priorityList.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""
                } ${
                  selectedAsset?.id === asset.id
                    ? "bg-sky-50/60 -mx-4 px-4 dark:bg-sky-950/20"
                    : "hover:bg-slate-50/80 dark:-mx-0 dark:hover:bg-slate-800/30"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="meta-label">Drain asset</div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {asset.name}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span className="asset-id-badge">DP-DEL-{String(asset.id).padStart(4,"0")}</span>
                      <span>·</span>
                      <span className="truncate">{asset.ward}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <div className="text-right">
                    <span className="block text-xs font-bold font-mono-numbers text-slate-900 dark:text-white">
                      {asset.risk ?? 60}
                    </span>
                    <span className="block text-[10px] text-slate-400">risk</span>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                      asset.priority === "critical"
                        ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                        : asset.priority === "high"
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {asset.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Citizen & Field Incident Feed (5 Cols) — scrollable */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Field Incident Feed
              </h3>
              <p className="text-xs text-slate-500">Citizen submissions and patrol flags</p>
            </div>
            <Link
              href="/reports"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400"
            >
              Triage All ({reports.length}) →
            </Link>
          </div>

          <div className="px-4 py-1 panel-scroll">
            {reports.map((report, index) => (
              <div
                key={report.id}
                className={`py-3 text-xs ${
                  index < reports.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={`status-dot ${
                        report.severity === "critical" ? "critical" :
                        report.severity === "high" ? "high" : "warning"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="meta-label capitalize">{report.reporter_type}</span>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                      report.status === "resolved"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : report.status === "assigned"
                        ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                        : report.status === "in_review"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {report.status.replace("_", " ")}
                  </span>
                </div>
                <div className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{report.title}</div>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {report.description}
                </p>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="capitalize">{report.reporter_type}</span>
                  <span className="asset-id-badge">DP-REP-{String(report.id).padStart(4,"0")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

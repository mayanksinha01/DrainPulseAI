"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  CloudRain,
  Play,
  RotateCcw,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
  Info,
} from "lucide-react";
import {
  ScenarioSimulationResponse,
  fetchScenarios,
  simulateScenario,
  FALLBACK_ASSETS,
  DrainAsset,
  fetchAssets,
} from "@/lib/api";

const DrainMap = dynamic(() => import("@/components/DrainMap"), { ssr: false });

const PRESETS = [
  { name: "Light Shower", intensity: 25, duration: 1, label: "Routine drainage runoff", colorClass: "border-emerald-200 dark:border-emerald-900" },
  { name: "Heavy Downpour", intensity: 55, duration: 2, label: "Arterial load stress", colorClass: "border-amber-200 dark:border-amber-900" },
  { name: "Peak Monsoon Pulse", intensity: 72, duration: 4, label: "5-year municipal return", colorClass: "border-orange-200 dark:border-orange-900" },
  { name: "Cloudburst Stress", intensity: 110, duration: 6, label: "Extreme surcharge test", colorClass: "border-red-200 dark:border-red-900" },
];

function SliderWithInput({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  ticks,
  colorVariant = "sky",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  ticks: Array<{ value: number; label: string }>;
  colorVariant?: "sky" | "amber";
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const sliderClass = `drain-slider${colorVariant === "amber" ? " amber-slider" : ""}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (!isNaN(v) && v >= min && v <= max) onChange(v);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <div className="unit-input-wrap w-28">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleInputChange}
            className="unit-input text-right"
            aria-label={`${label} numeric input`}
          />
          <span className="unit-suffix">{unit}</span>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={sliderClass}
        style={{ "--slider-pct": `${pct}%` } as React.CSSProperties}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />

      <div className="relative mt-1.5 flex justify-between">
        {ticks.map((tick) => {
          const tickPct = ((tick.value - min) / (max - min)) * 100;
          return (
            <span
              key={tick.value}
              className="text-[9px] text-slate-400 absolute -translate-x-1/2"
              style={{ left: `${tickPct}%` }}
            >
              {tick.label}
            </span>
          );
        })}
      </div>
      <div className="h-4" />
    </div>
  );
}

function formatAssetId(id: number): string {
  return `DP-DEL-${String(id).padStart(4, "0")}`;
}

export default function RainfallSimulatorPage() {
  const [intensityMm, setIntensityMm] = useState(72);
  const [durationHours, setDurationHours] = useState(4);
  const [blockageModifier, setBlockageModifier] = useState(10);
  const [targetZone, setTargetZone] = useState("all");
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<ScenarioSimulationResponse | null>(null);
  const [simError, setSimError] = useState<string | null>(null);
  const [baseAssets, setBaseAssets] = useState<DrainAsset[]>(FALLBACK_ASSETS);
  const [selectedMapAsset, setSelectedMapAsset] = useState<DrainAsset | null>(null);

  const mapAssets = useMemo(() => {
    if (!result) return baseAssets;
    return baseAssets.map((asset) => {
      const match = result.top_assets.find((t) => t.id === asset.id);
      if (!match) return asset;
      return {
        ...asset,
        risk: match.risk,
        priority: match.priority as DrainAsset["priority"],
        recommendation: match.recommendation,
      };
    });
  }, [baseAssets, result]);

  const runSim = useCallback(async (overrideIntensity?: number) => {
    setSimulating(true);
    setSimError(null);
    const rain = overrideIntensity ?? intensityMm;
    try {
      const sim = await simulateScenario(2, rain);
      setResult(sim);
    } catch (err) {
      console.warn("Simulation error:", err);
      setSimError("Simulation endpoint unavailable — showing offline estimate.");
      // Offline fallback
      setResult({
        scenario_id: 2,
        rainfall_mm: rain,
        risk_index: Math.min(100, Math.round(50 + rain * 0.28)),
        critical_assets: rain >= 70 ? 3 : 1,
        high_priority: rain >= 50 ? 4 : 2,
        top_assets: FALLBACK_ASSETS.map((a) => ({
          id: a.id,
          name: a.name,
          zone: a.zone,
          ward: a.ward,
          risk: Math.min(100, Math.round((a.risk || 60) + (rain - 40) * 0.25)),
          priority: a.priority,
          recommendation: a.recommendation || "Dispatch desilting patrol.",
          condition_score: a.condition_score,
          status: a.status,
        })),
      });
    } finally {
      setSimulating(false);
    }
  }, [intensityMm]);

  useEffect(() => {
    fetchAssets()
      .then((data) => {
        setBaseAssets(data);
        if (data[0]) setSelectedMapAsset(data[0]);
      })
      .catch(() => setBaseAssets(FALLBACK_ASSETS));
    fetchScenarios().then(() => runSim(72));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setIntensityMm(preset.intensity);
    setDurationHours(preset.duration);
    runSim(preset.intensity);
  };

  const getRiskColor = (risk: number) =>
    risk >= 75 ? "text-red-600 dark:text-red-400" :
    risk >= 58 ? "text-orange-600 dark:text-orange-400" :
    risk >= 45 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400";

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <CloudRain className="h-4 w-4" />
            <span>Hydraulic Stress Testing</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Rainfall Scenario Simulator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulate storm intensity, duration, and blockage modifiers against Delhi municipal drain surcharge limits
          </p>
        </div>
        <Link
          href="/map"
          className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          View on Map <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Preset quick-selectors */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => applyPreset(p)}
            className={`rounded border p-3 text-left transition ${
              intensityMm === p.intensity
                ? `${p.colorClass} bg-slate-50 dark:bg-slate-800`
                : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            }`}
          >
            <div className="text-[11px] font-bold text-sky-700 dark:text-sky-300 font-mono-numbers">
              {p.intensity} mm/hr · {p.duration}h
            </div>
            <div className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-white leading-tight">{p.name}</div>
            <div className="mt-0.5 text-[10px] text-slate-500">{p.label}</div>
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Parameter controls */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Atmospheric &amp; Channel Parameters
            </h3>
          </div>

          <SliderWithInput
            label="Peak Rainfall Intensity"
            value={intensityMm}
            min={10}
            max={150}
            step={5}
            unit="mm/hr"
            onChange={setIntensityMm}
            ticks={[
              { value: 10, label: "10" },
              { value: 50, label: "50" },
              { value: 100, label: "100" },
              { value: 150, label: "150" },
            ]}
            colorVariant="sky"
          />

          <SliderWithInput
            label="Storm Duration"
            value={durationHours}
            min={1}
            max={12}
            step={1}
            unit="hr"
            onChange={setDurationHours}
            ticks={[
              { value: 1, label: "1h" },
              { value: 4, label: "4h" },
              { value: 8, label: "8h" },
              { value: 12, label: "12h" },
            ]}
            colorVariant="sky"
          />

          <SliderWithInput
            label="Catchment Blockage Surcharge"
            value={blockageModifier}
            min={0}
            max={40}
            step={5}
            unit="%"
            onChange={setBlockageModifier}
            ticks={[
              { value: 0, label: "0%" },
              { value: 20, label: "+20%" },
              { value: 40, label: "+40%" },
            ]}
            colorVariant="amber"
          />

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300" htmlFor="zone-filter">
              Catchment Area Filter
            </label>
            <select
              id="zone-filter"
              value={targetZone}
              onChange={(e) => setTargetZone(e.target.value)}
              className="mt-1.5 w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">Entire Delhi NCT Drainage Basin</option>
              <option value="South Delhi">South Delhi — Barapullah Basin</option>
              <option value="North West">North West — Najafgarh Supplementary</option>
              <option value="North Delhi">North Delhi — Wazirabad Corridor</option>
              <option value="East Delhi">East Delhi — Shahdara Trans-Yamuna</option>
            </select>
          </div>

          {/* Current parameters summary */}
          <div className="rounded border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/50">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[9px] text-slate-400 uppercase tracking-wider">Intensity</div>
                <div className="font-bold font-mono-numbers text-sky-700 dark:text-sky-300">{intensityMm} mm/hr</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase tracking-wider">Duration</div>
                <div className="font-bold font-mono-numbers text-slate-800 dark:text-slate-200">{durationHours} hr</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase tracking-wider">Blockage+</div>
                <div className="font-bold font-mono-numbers text-amber-600 dark:text-amber-400">+{blockageModifier}%</div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => runSim()}
            disabled={simulating}
            className="flex w-full items-center justify-center gap-2 rounded bg-sky-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {simulating ? "Running hydraulic simulation…" : "Run Hydraulic Simulation"}
          </button>

          {simError && (
            <div className="flex items-start gap-2 rounded border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
              <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              {simError}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4 lg:col-span-7">
          {result ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="meta-eyebrow">Basin Risk Index</div>
                  <div className="mt-2 text-2xl font-bold font-mono-numbers text-slate-900 dark:text-white">
                    {result.risk_index}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    vs. baseline ~50
                  </div>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50/60 p-4 text-center shadow-sm dark:border-red-950 dark:bg-red-950/20">
                  <div className="meta-eyebrow text-red-600 dark:text-red-400">Critical Drains</div>
                  <div className="mt-2 text-2xl font-bold font-mono-numbers text-red-700 dark:text-red-300">
                    {result.critical_assets}
                  </div>
                  <div className="text-[10px] text-red-600 dark:text-red-400">risk ≥75</div>
                </div>
                <div className="rounded-lg border border-orange-200 bg-orange-50/60 p-4 text-center shadow-sm dark:border-orange-950 dark:bg-orange-950/20">
                  <div className="meta-eyebrow text-orange-600 dark:text-orange-400">High Priority</div>
                  <div className="mt-2 text-2xl font-bold font-mono-numbers text-orange-700 dark:text-orange-300">
                    {result.high_priority}
                  </div>
                  <div className="text-[10px] text-orange-600 dark:text-orange-400">risk 58–74</div>
                </div>
              </div>

              {/* Impact ranking — compact row list */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h4 className="meta-eyebrow mb-3">Simulated Network Impact Ranking</h4>
                <div>
                  {result.top_assets.map((item) => (
                    <div key={item.id} className="row-list-item flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="meta-eyebrow">DRAIN ASSET</div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{item.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span className="asset-id-badge">{formatAssetId(item.id)}</span>
                          <span>·</span>
                          <span>{item.zone}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        <div className="text-right">
                          <div className={`text-sm font-bold font-mono-numbers ${getRiskColor(item.risk)}`}>
                            {item.risk}
                          </div>
                          <div className="text-[9px] text-slate-400">risk</div>
                        </div>
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                          item.priority === "critical"
                            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
                <h4 className="text-xs font-semibold text-[var(--foreground)] mb-2">
                  Scenario footprint on map
                </h4>
                <p className="text-[10px] text-[var(--muted)] mb-2">
                  Marker colours reflect simulated risk from the API run (screening estimate, not validated flood depth).
                </p>
                <DrainMap
                  assets={mapAssets}
                  selectedAsset={selectedMapAsset}
                  onSelectAsset={setSelectedMapAsset}
                  height="320px"
                />
              </div>

              {/* Operations recommendation */}
              <div className="rounded-lg border border-sky-100 bg-sky-50/50 p-4 text-xs dark:border-sky-950 dark:bg-sky-950/20">
                <div className="flex items-center gap-2 font-bold text-sky-800 dark:text-sky-300 mb-2">
                  <ShieldCheck className="h-4 w-4" />
                  Operations Decision Support
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Under <strong>{intensityMm} mm/hr</strong> over <strong>{durationHours} hr</strong>,
                  backwater surcharge from the Yamuna barrier will elevate flood risk along the
                  Barapullah and Shahdara corridors. Pre-position suction machines at Lajpat Nagar
                  and Saket before peak runoff arrives.
                </p>
                <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Estimates are indicative. Calibrated flood depth requires field telemetry.
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Run a simulation to see impact analysis</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

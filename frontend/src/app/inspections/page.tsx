"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  DrainAsset,
  BlockageAssessmentResponse,
  fetchAssets,
  assessBlockage,
} from "@/lib/api";

export default function InspectionsManagementPage() {
  const [assets, setAssets] = useState<DrainAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<number>(1);
  const [visibleWaste, setVisibleWaste] = useState(75);
  const [siltDepth, setSiltDepth] = useState(60);
  const [standingWater, setStandingWater] = useState(45);
  const [flowObstruction, setFlowObstruction] = useState(80);
  const [notes, setNotes] = useState(
    "Plastic packaging, silt deposition, and standing water observed at culvert inlet screen."
  );
  const [assessing, setAssessing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<BlockageAssessmentResponse | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await fetchAssets();
      setAssets(data);
      if (data.length > 0) {
        setSelectedAssetId(data[0].id);
      }
    }
    load();
  }, []);

  const handleRunAssessment = async () => {
    setAssessing(true);
    setSuccessMessage(null);
    try {
      const result = await assessBlockage({
        drain_id: selectedAssetId,
        visible_waste: visibleWaste,
        silt_depth: siltDepth,
        standing_water: standingWater,
        flow_obstruction: flowObstruction,
        description: notes,
      });
      setAssessmentResult(result);
      setSuccessMessage("AI Blockage assessment compiled & verified successfully.");
    } catch (err) {
      console.warn("Assessment error:", err);
    } finally {
      setAssessing(false);
    }
  };

  const activeAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <ClipboardCheck className="h-4 w-4" />
            <span>Field Operations</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Inspection Management & Blockage AI
          </h2>
          <p className="text-xs text-slate-500">
            Physical inspection audit, camera photographic evidence logging, and automated blockage scoring
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Active Patrols: </span>
          <span className="font-semibold text-emerald-600">4 Crews Field-Connected</span>
        </div>
      </div>

      {/* Main Inspection Layout: Queue (5 Cols) + Assessment Studio (7 Cols) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Inspection Queue (5 Cols) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Inspection Target Queue
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {assets.length} Scheduled
            </span>
          </div>

          <div className="space-y-2">
            {assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => setSelectedAssetId(asset.id)}
                className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition ${
                  selectedAssetId === asset.id
                    ? "border-sky-500 bg-sky-50/70 shadow-sm dark:border-sky-500 dark:bg-sky-950/40"
                    : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-850 dark:hover:bg-slate-800"
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {asset.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {asset.ward} · {asset.zone}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                      asset.priority === "critical"
                        ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                        : "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                    }`}
                  >
                    {asset.priority}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-1">
                    Last: {asset.last_inspection}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* AI Blockage Assessment Studio (7 Cols) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                AI Assessment & Photographic Audit
              </h3>
              <p className="text-[11px] text-slate-400">
                Target Node: {activeAsset?.name} ({activeAsset?.zone})
              </p>
            </div>
            <Camera className="h-4 w-4 text-slate-400" />
          </div>

          {/* Evidence Upload & Visual Observation Placeholder */}
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-4 text-center dark:border-slate-700">
            <Camera className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
              Inspection Photographs Attached
            </p>
            <p className="text-[11px] text-slate-400">
              Culvert entry and upstream trash-screen evidence logged from Field Mobile Tablet
            </p>
          </div>

          {/* Physical Metric Sliders */}
          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-700 dark:text-slate-300">Visible Waste</span>
                <span className="font-bold text-sky-600">{visibleWaste}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={visibleWaste}
                onChange={(e) => setVisibleWaste(Number(e.target.value))}
                className="mt-1.5 w-full accent-sky-600"
              />
            </div>

            <div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-700 dark:text-slate-300">Silt Surcharge Depth</span>
                <span className="font-bold text-sky-600">{siltDepth}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={siltDepth}
                onChange={(e) => setSiltDepth(Number(e.target.value))}
                className="mt-1.5 w-full accent-sky-600"
              />
            </div>

            <div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-700 dark:text-slate-300">Standing Water Elevation</span>
                <span className="font-bold text-sky-600">{standingWater}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={standingWater}
                onChange={(e) => setStandingWater(Number(e.target.value))}
                className="mt-1.5 w-full accent-sky-600"
              />
            </div>

            <div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-700 dark:text-slate-300">Flow Path Obstruction</span>
                <span className="font-bold text-sky-600">{flowObstruction}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={flowObstruction}
                onChange={(e) => setFlowObstruction(Number(e.target.value))}
                className="mt-1.5 w-full accent-sky-600"
              />
            </div>
          </div>

          {/* Notes textarea */}
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Inspector Field Observations
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none transition focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleRunAssessment}
            disabled={assessing}
            className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-500 transition disabled:opacity-50"
          >
            {assessing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Analyzing Blockage Severity…</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Submit & Compute AI Assessment</span>
              </>
            )}
          </button>

          {/* Result Banner */}
          {assessmentResult && (
            <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-xs dark:border-sky-950 dark:bg-sky-950/40">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-sky-900 dark:text-sky-200">
                  Assessment Conclusion: {assessmentResult.status}
                </span>
                <span className="text-base font-bold text-sky-700 dark:text-sky-300">
                  Score: {assessmentResult.score} / 100
                </span>
              </div>
              <p className="mt-2 text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong>Recommended Directive: </strong>
                {assessmentResult.recommendation}
              </p>
              <div className="mt-2 text-[11px] text-slate-500">
                Model Confidence: {(assessmentResult.confidence * 100).toFixed(0)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

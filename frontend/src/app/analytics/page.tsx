"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  ShieldCheck,
  Droplets,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { fetchDashboard, DashboardPayload } from "@/lib/api";

const HISTORICAL_TRENDS = [
  { month: "Jun 2026", rainfall_mm: 82, desilted_tons: 420, avg_risk: 54 },
  { month: "Jul 2026", rainfall_mm: 195, desilted_tons: 890, avg_risk: 71 },
  { month: "Aug 2026", rainfall_mm: 240, desilted_tons: 1250, avg_risk: 76 },
  { month: "Sep 2026", rainfall_mm: 145, desilted_tons: 680, avg_risk: 63 },
  { month: "Oct 2026 (Live)", rainfall_mm: 72, desilted_tons: 310, avg_risk: 61 },
];

export default function AnalyticsReportingPage() {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);

  useEffect(() => {
    async function load() {
      const data = await fetchDashboard();
      setDashboard(data);
    }
    load();
  }, []);

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Month,Rainfall_mm,Desilted_Tons,Average_Risk\n" +
      HISTORICAL_TRENDS.map((r) => `${r.month},${r.rainfall_mm},${r.desilted_tons},${r.avg_risk}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "delhi_drainage_analytics_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <BarChart3 className="h-4 w-4" />
            <span>Hydrological Intelligence</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Operational Analytics & Trends
          </h2>
          <p className="text-xs text-slate-500">
            Multi-season silt accumulation velocity, rainfall correlation, and municipal remediation metrics
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Historical Dataset (CSV)</span>
        </button>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 text-xs">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-slate-400">Total Silt Removed</span>
          <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">3,550 MT</div>
          <span className="text-[11px] text-emerald-600">Dredged during 2026 pre-monsoon</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-slate-400">Monsoon Peak Inundation</span>
          <div className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">76.2 Max Risk</div>
          <span className="text-[11px] text-slate-500">Recorded Aug 14 Cloudburst</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-slate-400">Discharge Cleared SLA</span>
          <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">3.4 Hours</div>
          <span className="text-[11px] text-emerald-600">Avg underpass dewatering time</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-slate-400">Sensor Data Uptime</span>
          <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">99.4%</div>
          <span className="text-[11px] text-slate-500">Ultrasonic level loggers</span>
        </div>
      </div>

      {/* Main Charts Grid: Monthly Seasonal Trend (7 Cols) + Ward Risk Distribution (5 Cols) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Monthly Trend Area Chart (7 Cols) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Monsoon Inundation Risk vs Rainfall Trend
              </h3>
              <p className="text-[11px] text-slate-400">
                Monthly precipitation intensity vs. composite basin risk index
              </p>
            </div>
          </div>

          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HISTORICAL_TRENDS}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="avg_risk"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#riskGrad)"
                  name="Basin Risk Index"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ward Distribution Bar Chart (5 Cols) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Zone Infrastructure Density
              </h3>
              <p className="text-[11px] text-slate-400">Mapped arterial drain count by zone</p>
            </div>
          </div>

          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard?.zones || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" fill="#0284c7" radius={[4, 4, 0, 0]} name="Monitored Drains" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

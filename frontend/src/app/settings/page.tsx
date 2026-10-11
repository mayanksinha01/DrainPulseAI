"use client";

import React, { useState } from "react";
import {
  Settings,
  Sun,
  Moon,
  Building2,
  Users,
  MapPin,
  CheckCircle2,
  Server,
  ShieldAlert,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { API_BASE } from "@/lib/api";

export default function SettingsPreferencesPage() {
  const { theme, setTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState("admin");
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSave = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <Settings className="h-4 w-4" />
            <span>Platform Configuration</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            System & Operations Preferences
          </h2>
          <p className="text-xs text-slate-500">
            UI theme mode, municipal tenant context, simulation defaults, and API endpoints
          </p>
        </div>

        {savedNotification && (
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" /> Preferences Updated
          </div>
        )}
      </div>

      {/* Theme Selection */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Interface Appearance & Cartography Theme
        </h3>
        <p className="text-xs text-slate-500">
          Clean light GIS operations theme is recommended for daytime engineering operations.
        </p>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
              theme === "light"
                ? "border-sky-500 bg-sky-50/70 shadow-sm dark:border-sky-500 dark:bg-sky-950/40"
                : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-850"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Light GIS Console (Default)
              </div>
              <div className="text-[11px] text-slate-500">
                Carto Positron high-contrast basemap
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
              theme === "dark"
                ? "border-sky-500 bg-sky-50/70 shadow-sm dark:border-sky-500 dark:bg-sky-950/40"
                : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-850"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-sky-400">
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Dark Operations Theme
              </div>
              <div className="text-[11px] text-slate-500">
                Carto Dark Matter night shift palette
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Role & User Context Switcher */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Demo Operational Role & Permissions
        </h3>
        <p className="text-xs text-slate-500">
          Switch user session context to test role-based access control (RBAC) filtering in Delhi NCT.
        </p>

        <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
          {[
            { role: "admin", label: "Operations Lead (Admin)", desc: "Full dispatch & tenant privileges" },
            { role: "supervisor", label: "Field Supervisor", desc: "Inspection triage & crew tasks" },
            { role: "operator", label: "Drain Inspector", desc: "Field camera audits & status logs" },
          ].map((r) => (
            <button
              key={r.role}
              type="button"
              onClick={() => setSelectedRole(r.role)}
              className={`rounded-lg border p-3 text-left transition ${
                selectedRole === r.role
                  ? "border-sky-500 bg-sky-50 dark:border-sky-500 dark:bg-sky-950"
                  : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-850"
              }`}
            >
              <div className="font-bold text-slate-900 dark:text-white">{r.label}</div>
              <div className="text-[10px] text-slate-500 mt-1">{r.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* API & Backend Diagnostic */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Backend API Connectivity
        </h3>

        <div className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-850 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Connected Service URL:</span>
            <code className="font-mono text-sky-600 dark:text-sky-400">{API_BASE}</code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Database Engine:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              SQLite (Migration-ready for PostGIS)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Cartography Provider:</span>
            <span className="font-semibold text-emerald-600">
              MapLibre GL JS + Carto Positron / OSM
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="mt-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500 transition"
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
}

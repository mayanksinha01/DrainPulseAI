from __future__ import annotations

from app.models import DrainAsset


def risk_level_from_score(score: float) -> str:
    if score >= 75:
        return "critical"
    if score >= 55:
        return "high"
    if score >= 35:
        return "moderate"
    return "low"


def score_drain(asset: DrainAsset, rainfall_mm: float) -> float:
    rain_factor = min(100.0, (rainfall_mm / 100.0) * 85.0)
    capacity_deficit = max(0.0, 100.0 - float(asset.capacity))
    structural_deficit = max(0.0, 100.0 - float(asset.condition_score))

    score = (
        rain_factor * 0.22
        + float(asset.blockage) * 0.28
        + float(asset.silt) * 0.17
        + float(asset.terrain) * 0.16
        + capacity_deficit * 0.12
        + float(asset.maintenance_pressure) * 0.08
        + structural_deficit * 0.06
    )
    return round(min(100.0, max(0.0, score)), 1)


def build_priority_notes(asset: DrainAsset, rainfall_mm: float) -> str:
    risk = score_drain(asset, rainfall_mm)
    if risk >= 75:
        return "Immediate desilting and debris removal with crew dispatch within 4 hours."
    if risk >= 55:
        return "Field inspection and blockage clearance within the next shift."
    if risk >= 35:
        return "Monitor rainfall accumulation and schedule preventive cleaning within 48 hours."
    return "Routine inspection; continue surveillance during the next storm cycle."

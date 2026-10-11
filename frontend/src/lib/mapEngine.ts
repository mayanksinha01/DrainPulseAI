import type { Map as MapLibreMap } from "maplibre-gl";

/** Demo rainfall intensity cells — not verified IMD radar; labelled in UI. */
export const DEMO_RAINFALL_CELLS: GeoJSON.FeatureCollection<GeoJSON.Polygon> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { intensity_mm_h: 45, label: "Demo cell — South Delhi" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.18, 28.52], [77.22, 28.52], [77.24, 28.56], [77.20, 28.58], [77.16, 28.55], [77.18, 28.52],
        ]],
      },
    },
    {
      type: "Feature",
      properties: { intensity_mm_h: 72, label: "Demo cell — East corridor" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.28, 28.62], [77.32, 28.62], [77.33, 28.66], [77.29, 28.67], [77.27, 28.64], [77.28, 28.62],
        ]],
      },
    },
    {
      type: "Feature",
      properties: { intensity_mm_h: 28, label: "Demo cell — Rohini" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [77.05, 28.72], [77.09, 28.72], [77.10, 28.75], [77.06, 28.76], [77.04, 28.74], [77.05, 28.72],
        ]],
      },
    },
  ],
};

export function registerRiskHatchPattern(map: MapLibreMap): void {
  if (map.hasImage("risk-hatch-pattern")) return;

  const size = 12;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = "rgba(220, 38, 38, 0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.lineTo(size, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size / 2, size / 2);
  ctx.lineTo(size / 2, -size / 2);
  ctx.stroke();

  const imageData = ctx.getImageData(0, 0, size, size);
  map.addImage(
    "risk-hatch-pattern",
    { width: size, height: size, data: imageData.data },
    { pixelRatio: 1 }
  );
}

export function setupBuildingExtrusion(map: MapLibreMap, dark: boolean): boolean {
  if (map.getLayer("building-3d-extrusion")) return true;

  const style = map.getStyle();
  if (!style?.layers) return false;

  const buildingFill = style.layers.find(
    (layer) =>
      layer.type === "fill" &&
      ("source-layer" in layer &&
        (layer["source-layer"] === "building" || layer.id.toLowerCase().includes("building")))
  );

  if (!buildingFill || !("source-layer" in buildingFill) || typeof buildingFill.source !== "string") {
    return false;
  }

  try {
    map.addLayer(
      {
        id: "building-3d-extrusion",
        type: "fill-extrusion",
        source: buildingFill.source,
        "source-layer": buildingFill["source-layer"],
        minzoom: 13,
        filter: ["==", ["geometry-type"], "Polygon"],
        paint: {
          "fill-extrusion-color": dark ? "#334155" : "#d4dbe4",
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            13,
            0,
            14,
            ["coalesce", ["get", "render_height"], ["get", "height"], 12],
          ],
          "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], ["get", "min_height"], 0],
          "fill-extrusion-opacity": dark ? 0.65 : 0.72,
        },
        layout: { visibility: "none" },
      },
      buildingFill.id
    );
    return true;
  } catch {
    return false;
  }
}

export function setBuildingExtrusionVisible(map: MapLibreMap, visible: boolean): void {
  if (!map.getLayer("building-3d-extrusion")) return;
  map.setLayoutProperty("building-3d-extrusion", "visibility", visible ? "visible" : "none");
}

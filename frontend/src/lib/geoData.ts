// Geospatial definitions, GeoJSON layers, and location presets for India and Delhi NCT

export interface CityPreset {
  id: string;
  name: string;
  state: string;
  center: [number, number]; // [lon, lat]
  zoom: number;
  pitch?: number;
  bearing?: number;
  coverageStatus: "active_telemetry" | "baseline_mapped" | "planned";
  drainCount: number;
  riskIndex: number;
}

export const SUPPORTED_CITIES: CityPreset[] = [
  {
    id: "delhi",
    name: "Delhi NCT",
    state: "National Capital Territory",
    center: [77.209, 28.6139],
    zoom: 11.2,
    pitch: 45,
    bearing: -15,
    coverageStatus: "active_telemetry",
    drainCount: 428,
    riskIndex: 61.0,
  },
  {
    id: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    center: [72.8777, 19.076],
    zoom: 11.0,
    pitch: 40,
    bearing: 0,
    coverageStatus: "baseline_mapped",
    drainCount: 184,
    riskIndex: 74.2,
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    state: "Karnataka",
    center: [77.5946, 12.9716],
    zoom: 11.0,
    pitch: 35,
    bearing: 10,
    coverageStatus: "baseline_mapped",
    drainCount: 142,
    riskIndex: 58.6,
  },
  {
    id: "chennai",
    name: "Chennai",
    state: "Tamil Nadu",
    center: [80.2707, 13.0827],
    zoom: 11.0,
    pitch: 35,
    bearing: 0,
    coverageStatus: "baseline_mapped",
    drainCount: 165,
    riskIndex: 69.8,
  },
  {
    id: "kolkata",
    name: "Kolkata",
    state: "West Bengal",
    center: [88.3639, 22.5726],
    zoom: 11.0,
    pitch: 30,
    bearing: 0,
    coverageStatus: "planned",
    drainCount: 98,
    riskIndex: 63.4,
  },
];

export const INDIA_NATIONAL_VIEW = {
  center: [78.9629, 22.5937] as [number, number],
  zoom: 4.4,
  pitch: 0,
  bearing: 0,
};

export const DELHI_MUNICIPAL_VIEW = {
  center: [77.209, 28.6139] as [number, number],
  zoom: 11.2,
  pitch: 45,
  bearing: -15,
};

// Delhi Drainage Trunk Channels & Arterial Nullahs GeoJSON FeatureCollection
export const DELHI_DRAINAGE_NETWORK: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "trunk-barapullah",
      properties: {
        id: "trunk-barapullah",
        name: "Barapullah Basin Trunk Nullah",
        type: "primary_arterial",
        length_km: 14.8,
        capacity_cusecs: 4500,
        flow_direction: "South-West to Yamuna River",
        status: "critical",
        risk: 76,
        zone: "South Delhi",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.165, 28.512],
          [77.185, 28.528],
          [77.2064, 28.5203], // Saket
          [77.228, 28.545],
          [77.2434, 28.5665], // Lajpat Nagar
          [77.258, 28.583],
          [77.272, 28.595], // Yamuna Confluence
        ],
      },
    },
    {
      type: "Feature",
      id: "trunk-najafgarh",
      properties: {
        id: "trunk-najafgarh",
        name: "Najafgarh Main Drain (Outfall)",
        type: "major_outfall",
        length_km: 51.0,
        capacity_cusecs: 12000,
        flow_direction: "West to North-East Yamuna",
        status: "high",
        risk: 68,
        zone: "West / North-West Delhi",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [76.965, 28.568],
          [77.025, 28.612],
          [77.0614, 28.7386], // Rohini
          [77.125, 28.718],
          [77.1757, 28.7245], // Azadpur
          [77.218, 28.715],
          [77.235, 28.712], // Wazirabad Barrage
        ],
      },
    },
    {
      type: "Feature",
      id: "trunk-shahdara",
      properties: {
        id: "trunk-shahdara",
        name: "Shahdara Main Arterial Nullah",
        type: "primary_arterial",
        length_km: 18.2,
        capacity_cusecs: 3800,
        flow_direction: "North-East to Okhla Yamuna",
        status: "high",
        risk: 65,
        zone: "East Delhi",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.288, 28.715],
          [77.2963, 28.6706], // Shahdara
          [77.305, 28.635],
          [77.312, 28.598],
          [77.318, 28.565], // Okhla Barrage
        ],
      },
    },
    {
      type: "Feature",
      id: "trunk-bawana",
      properties: {
        id: "trunk-bawana",
        name: "Bawana Industrial Storm Channel",
        type: "industrial_channel",
        length_km: 9.4,
        capacity_cusecs: 1800,
        flow_direction: "North-West to Western Yamuna Canal",
        status: "high",
        risk: 56,
        zone: "North West Delhi",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.035, 28.825],
          [77.0568, 28.7982], // Bawana
          [77.085, 28.775],
          [77.112, 28.752],
        ],
      },
    },
    {
      type: "Feature",
      id: "collector-ring-road",
      properties: {
        id: "collector-ring-road",
        name: "Mahatma Gandhi Ring Road Interceptor",
        type: "roadside_interceptor",
        length_km: 7.6,
        capacity_cusecs: 950,
        flow_direction: "Sub-surface to Barapullah",
        status: "critical",
        risk: 72,
        zone: "South Delhi",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.208, 28.568],
          [77.225, 28.567],
          [77.2434, 28.5665], // Lajpat Nagar
          [77.255, 28.569],
          [77.265, 28.575],
        ],
      },
    },
  ],
};

// Delhi Localities and Landmarks Search Index
export interface LocalityItem {
  id: string;
  name: string;
  zone: string;
  coordinates: [number, number];
  type: "landmark" | "ward" | "subdivision";
}

export const DELHI_LOCALITIES: LocalityItem[] = [
  { id: "saket", name: "Saket", zone: "South Delhi", coordinates: [77.2064, 28.5203], type: "ward" },
  { id: "lajpat-nagar", name: "Lajpat Nagar", zone: "South Delhi", coordinates: [77.2434, 28.5665], type: "ward" },
  { id: "rohini", name: "Rohini Sector 15", zone: "North West Delhi", coordinates: [77.0614, 28.7386], type: "ward" },
  { id: "azadpur", name: "Azadpur Mandi", zone: "North Delhi", coordinates: [77.1757, 28.7245], type: "landmark" },
  { id: "shahdara", name: "Shahdara", zone: "East Delhi", coordinates: [77.2963, 28.6706], type: "ward" },
  { id: "bawana", name: "Bawana Industrial Area", zone: "North West Delhi", coordinates: [77.0568, 28.7982], type: "ward" },
  { id: "connaught-place", name: "Connaught Place", zone: "New Delhi", coordinates: [77.2167, 28.6315], type: "landmark" },
  { id: "aiims", name: "AIIMS / Safdarjung", zone: "South Delhi", coordinates: [77.209, 28.5672], type: "landmark" },
  { id: "dwarka", name: "Dwarka Sub-City", zone: "South West Delhi", coordinates: [77.046, 28.5921], type: "ward" },
  { id: "ito", name: "ITO & Vikas Marg", zone: "Central Delhi", coordinates: [77.241, 28.6289], type: "landmark" },
];

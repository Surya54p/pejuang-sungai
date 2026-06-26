"use client";

import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polygon, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { MousePointer, Hand } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";

import { Point, checkPointStatus } from "@/lib/water-types";

// Kecamatan coordinates boundary mapping for highlighting
export const kecamatanBoundaries: Record<string, [number, number][]> = {
  "Menteng": [
    [-6.188, 106.828],
    [-6.185, 106.834],
    [-6.198, 106.848],
    [-6.210, 106.852],
    [-6.218, 106.848],
    [-6.214, 106.838],
    [-6.204, 106.820],
    [-6.195, 106.824]
  ],
  "Tanah Abang": [
    [-6.188, 106.815],
    [-6.204, 106.820],
    [-6.214, 106.818],
    [-6.225, 106.812],
    [-6.220, 106.795],
    [-6.205, 106.795],
    [-6.192, 106.802]
  ],
  "Senen": [
    [-6.185, 106.834],
    [-6.172, 106.840],
    [-6.178, 106.852],
    [-6.192, 106.855],
    [-6.202, 106.850],
    [-6.198, 106.842]
  ],
  "Gambir": [
    [-6.160, 106.815],
    [-6.160, 106.832],
    [-6.175, 106.835],
    [-6.185, 106.834],
    [-6.188, 106.828],
    [-6.188, 106.815],
    [-6.175, 106.810]
  ],
  "Kemayoran": [
    [-6.145, 106.845],
    [-6.142, 106.862],
    [-6.155, 106.872],
    [-6.175, 106.865],
    [-6.178, 106.852],
    [-6.172, 106.840]
  ],
  "Cempaka Putih": [
    [-6.168, 106.862],
    [-6.170, 106.882],
    [-6.190, 106.880],
    [-6.188, 106.864]
  ],
  "Johar Baru": [
    [-6.180, 106.848],
    [-6.182, 106.864],
    [-6.195, 106.860],
    [-6.192, 106.846]
  ],
  "Sawah Besar": [
    [-6.138, 106.825],
    [-6.140, 106.840],
    [-6.165, 106.842],
    [-6.168, 106.822],
    [-6.155, 106.818]
  ],
  "Penjaringan": [
    [-6.105, 106.755],
    [-6.102, 106.795],
    [-6.110, 106.818],
    [-6.132, 106.812],
    [-6.138, 106.795],
    [-6.132, 106.772],
    [-6.118, 106.758]
  ],
  "Kebayoran Baru": [
    [-6.225, 106.785],
    [-6.223, 106.812],
    [-6.238, 106.822],
    [-6.255, 106.815],
    [-6.262, 106.800],
    [-6.255, 106.788],
    [-6.238, 106.790]
  ],
  "Jatinegara": [
    [-6.210, 106.860],
    [-6.212, 106.885],
    [-6.228, 106.892],
    [-6.242, 106.885],
    [-6.238, 106.862],
    [-6.222, 106.858]
  ]
};

// Custom Marker generation using L.divIcon
const createCustomMarker = (status: "Aman" | "Waspada" | "Bahaya", type: "bersih" | "limbah") => {
  const colorClass =
    status === "Aman"
      ? "bg-emerald-500 border-emerald-300 text-white"
      : status === "Waspada"
        ? "bg-amber-500 border-amber-300 text-white"
        : "bg-rose-500 border-rose-300 text-white";

  const typeText = type === "bersih" ? "B" : "L";
  const labelColor = type === "bersih" ? "bg-blue-600/80" : "bg-zinc-800/80";

  const iconHtml = `
    <div class="relative flex flex-col items-center justify-center w-9 h-9 rounded-full border-2 text-white ${colorClass} transition-all duration-300 hover:scale-110">
      <span class="text-[10px] font-extrabold uppercase leading-none">${typeText}</span>
      <span class="text-[7px] font-bold px-1 py-0.2 rounded-sm mt-0.5 ${labelColor}">${status}</span>
      <div class="absolute -bottom-1 w-2.5 h-2.5 rotate-45 border-r border-b ${colorClass} bg-inherit"></div>
    </div>
  `;

  return new L.DivIcon({
    html: iconHtml,
    className: "custom-leaflet-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

function MapClickHandler({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

// Component to dynamically pan/zoom map to selected marker or selected subdistrict boundary
function MapController({
  selectedPoint,
  selectedKecamatan,
  boundary,
}: {
  selectedPoint: Point | null;
  selectedKecamatan: string;
  boundary: [number, number][] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedPoint) {
      map.setView(selectedPoint.position, 14, { animate: true });
    }
  }, [selectedPoint, map]);

  useEffect(() => {
    if (selectedKecamatan !== "Semua" && boundary && boundary.length > 0) {
      const bounds = L.polygon(boundary).getBounds();
      map.fitBounds(bounds, { animate: true, padding: [50, 50] });
    }
  }, [selectedKecamatan, boundary, map]);

  return null;
}

interface MapProps {
  points: Point[];
  selectedPoint: Point | null;
  onPointSelect: (point: Point | null) => void;
  heatmapMode: "none" | "ph" | "exceedance";
  onAddPoint: (newPoint: Point) => void;
  selectedKecamatan: string;
}

export default function Map({
  points,
  selectedPoint,
  onPointSelect,
  heatmapMode,
  onAddPoint,
  selectedKecamatan,
}: MapProps) {
  const defaultPosition: [number, number] = [-6.2088, 106.8456]; // Jakarta
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [clickedPos, setClickedPos] = useState<L.LatLng | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [dynamicBoundary, setDynamicBoundary] = useState<[number, number][] | null>(null);
  const [mapMode, setMapMode] = useState<"interact" | "pan">("pan");
  const mapModeRef = useRef(mapMode);

  useEffect(() => {
    mapModeRef.current = mapMode;
  }, [mapMode]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=id`);
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const subdistrict = addr.subdistrict || addr.suburb || addr.village || addr.city_district || addr.town || addr.city || "Indonesia";
        // Clean up common prefixes
        const cleanKec = subdistrict.replace(/^(kecamatan|kelurahan|desa|kota|kabupaten)\s+/i, "");
        setFormKecamatan(cleanKec);
        setFormTitle(`Sampel Air di ${cleanKec}`);
      }
    } catch (err) {
      console.error("Gagal melakukan reverse geocoding:", err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Convert Nominatim GeoJSON coordinates to Leaflet [latitude, longitude] array
  const convertNominatimCoords = (geojson: any): [number, number][] => {
    if (!geojson) return [];
    if (geojson.type === "Polygon") {
      return geojson.coordinates[0].map((coord: any) => [coord[1], coord[0]]);
    } else if (geojson.type === "MultiPolygon") {
      let maxLen = 0;
      let targetCoords = geojson.coordinates[0][0];
      for (const poly of geojson.coordinates) {
        if (poly[0] && poly[0].length > maxLen) {
          maxLen = poly[0].length;
          targetCoords = poly[0];
        }
      }
      return targetCoords.map((coord: any) => [coord[1], coord[0]]);
    }
    return [];
  };

  useEffect(() => {
    if (selectedKecamatan === "Semua") {
      setDynamicBoundary(null);
      return;
    }

    const query = selectedKecamatan.includes(",") 
      ? selectedKecamatan 
      : `${selectedKecamatan}, Indonesia`;

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&polygon_geojson=1`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const boundaryItem = data.find((item: any) => item.class === "boundary" || item.type === "administrative") || data[0];
          if (boundaryItem && boundaryItem.geojson) {
            const coords = convertNominatimCoords(boundaryItem.geojson);
            if (coords && coords.length > 0) {
              setDynamicBoundary(coords);
              return;
            }
          }
        }
        setDynamicBoundary(kecamatanBoundaries[selectedKecamatan] || null);
      })
      .catch((err) => {
        console.error("Gagal mengambil data polygon dari OpenStreetMap API:", err);
        setDynamicBoundary(kecamatanBoundaries[selectedKecamatan] || null);
      });
  }, [selectedKecamatan]);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formKecamatan, setFormKecamatan] = useState("");
  const [formType, setFormType] = useState<"bersih" | "limbah">("bersih");
  const [formPh, setFormPh] = useState(7.0);
  const [formPb, setFormPb] = useState(0.01);
  const [formTurbidity, setFormTurbidity] = useState(10);
  const [formCod, setFormCod] = useState(15);
  const [formBod, setFormBod] = useState(3);
  const [formReporter, setFormReporter] = useState("");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userName");
      if (storedName) {
        setFormReporter(storedName);
      }
    }
  }, []);

  const handleMapClick = (latlng: L.LatLng) => {
    if (mapModeRef.current !== "interact") return;
    setClickedPos(latlng);
    setIsConfirmOpen(true);
    setFormTitle("");
    setFormKecamatan("");
    reverseGeocode(latlng.lat, latlng.lng);
  };

  const handleConfirmYes = () => {
    setIsConfirmOpen(false);
    setTimeout(() => setIsFormOpen(true), 100);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clickedPos) return;

    // Build the photo url dynamically depending on clean vs wastewater
    const photoUrl =
      formType === "bersih"
        ? "https://images.unsplash.com/photo-1548811225-b82531d044f3?auto=format&fit=crop&w=300&q=80"
        : "https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&w=300&q=80";

    const newPoint: Point = {
      id: Date.now(),
      title: formTitle || `Titik Sampel Baru ${formKecamatan}`,
      location: formKecamatan,
      reporter: formReporter || "Petugas Lapangan",
      datetime: new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short"
      }),
      type: formType,
      ph: formPh,
      temp: 26.5 + Math.random() * 2,
      turbidity: formTurbidity,
      tds: 100 + Math.floor(Math.random() * 200),
      tss: 10 + Math.floor(Math.random() * 50),
      do_level: formType === "bersih" ? 6.0 + Math.random() : 3.0 + Math.random(),
      bod: formBod,
      cod: formCod,
      ecoli: formType === "bersih" ? 50 + Math.floor(Math.random() * 50) : 400 + Math.floor(Math.random() * 800),
      coliform: formType === "bersih" ? 200 + Math.floor(Math.random() * 100) : 1000 + Math.floor(Math.random() * 1000),
      klorin: 0.1,
      besi: 0.2,
      pb: formPb,
      merkuri: 0.001,
      nitrat: 5.0,
      photo: photoUrl,
      position: [clickedPos.lat, clickedPos.lng],
    };

    onAddPoint(newPoint);
    setIsFormOpen(false);
    setClickedPos(null);

    // Reset Form Fields
    setFormTitle("");
    setFormPh(7.0);
    setFormPb(0.01);
    setFormTurbidity(10);
    setFormCod(15);
    setFormBod(3);
    if (typeof window !== "undefined") {
      setFormReporter(localStorage.getItem("userName") || "");
    } else {
      setFormReporter("");
    }
  };

  const tileUrl =
    mounted && resolvedTheme === "light"
      ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  // Color functions for heatmaps
  const getPhColor = (ph: number) => {
    if (ph < 6.0) return "#ef4444"; // Red (Sangat Asam)
    if (ph < 6.5) return "#f97316"; // Orange (Asam Ringan)
    if (ph >= 6.5 && ph <= 8.5) return "#10b981"; // Emerald Green (Aman)
    if (ph <= 9.0) return "#3b82f6"; // Blue (Basa Ringan)
    return "#8b5cf6"; // Violet (Sangat Basa)
  };

  const getExceedanceColor = (exceedCount: number) => {
    if (exceedCount === 0) return "#10b981"; // Green (Aman)
    if (exceedCount <= 2) return "#f97316"; // Orange (Waspada)
    return "#ef4444"; // Red (Bahaya)
  };

  const getExceedanceRadius = (exceedCount: number) => {
    if (exceedCount === 0) return 15;
    if (exceedCount <= 2) return 30;
    return 45;
  };

  return (
    <>
      {/* SVG hatch patterns definition */}
      <svg style={{ height: 0, width: 0, position: 'absolute', zIndex: -100 }}>
        <defs>
          <pattern id="diagonal-hatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#3b82f6" strokeWidth="2.5" opacity="0.3" />
          </pattern>
        </defs>
      </svg>
      <div style={{ position: "absolute", top: 0, left: 0, height: "100vh", width: "100vw", zIndex: 0 }}>
        <MapContainer
          center={defaultPosition}
          zoom={12}
          scrollWheelZoom={true}
          zoomControl={false}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={tileUrl}
          />
          <MapClickHandler onClick={handleMapClick} />
          <MapController selectedPoint={selectedPoint} selectedKecamatan={selectedKecamatan} boundary={dynamicBoundary} />

          {/* Render selected Kecamatan boundary polygon with arsir fill */}
          {selectedKecamatan !== "Semua" && dynamicBoundary && (
            <Polygon
              positions={dynamicBoundary}
              pathOptions={{
                color: "#3b82f6", // Border color
                weight: 2,
                dashArray: "6, 6", // Dashed border
                fillColor: "url(#diagonal-hatch)", // Diagonal hatch (arsir)
                fillOpacity: 0.85,
              }}
            />
          )}

          {/* Render Heatmap overlays */}
          {heatmapMode !== "none" &&
            points.map((point) => {
              const statusDetails = checkPointStatus(point);
              const exceedCount = statusDetails.exceededParams.length;

              let circleColor = "";
              let circleRadius = 25;

              if (heatmapMode === "ph") {
                circleColor = getPhColor(point.ph);
                circleRadius = 35; // Fixed visual radius for pH heatmap points
              } else if (heatmapMode === "exceedance") {
                circleColor = getExceedanceColor(exceedCount);
                circleRadius = getExceedanceRadius(exceedCount);
              }

              return (
                <CircleMarker
                  key={`heatmap-${point.id}`}
                  center={point.position}
                  radius={circleRadius}
                  pathOptions={{
                    fillColor: circleColor,
                    fillOpacity: 0.35,
                    stroke: true,
                    color: circleColor,
                    weight: 1,
                    opacity: 0.6,
                  }}
                />
              );
            })}

          {/* Render Actual Status-Colored Markers */}
          {points.map((point) => {
            const statusDetails = checkPointStatus(point);
            return (
              <Marker
                key={point.id}
                position={point.position}
                icon={createCustomMarker(statusDetails.status, point.type)}
                eventHandlers={{
                  click: () => {
                    onPointSelect(point);
                  },
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-1 font-sans text-xs text-foreground min-w-[200px]">
                    <div className="font-bold text-sm mb-1 text-slate-800 dark:text-white border-b border-border pb-1">
                      {point.title}
                    </div>
                    <div className="space-y-1 my-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Kecamatan:</span>
                        <span className="font-medium text-right">{point.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tipe:</span>
                        <span className="font-medium uppercase text-right">
                          {point.type === "bersih" ? "Air Bersih" : "Air Limbah"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">pH:</span>
                        <span className="font-semibold text-right" style={{ color: getPhColor(point.ph) }}>
                          {point.ph}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Timbal (Pb):</span>
                        <span className="font-semibold text-right text-rose-500">
                          {point.pb.toFixed(3)} mg/L
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status:</span>
                        <span
                          className={`font-extrabold text-right ${statusDetails.status === "Aman"
                              ? "text-emerald-500"
                              : statusDetails.status === "Waspada"
                                ? "text-amber-500"
                                : "text-rose-500"
                            }`}
                        >
                          {statusDetails.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onPointSelect(point)}
                      className="w-full mt-1.5 py-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-semibold border-none cursor-pointer text-center"
                    >
                      Buka Detail Analisis
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Render Selection Highlights */}
          {selectedPoint && (
            <CircleMarker
              center={selectedPoint.position}
              radius={22}
              pathOptions={{
                fillColor: "#3b82f6",
                fillOpacity: 0.1,
                stroke: true,
                color: "#3b82f6",
                weight: 1.5,
                dashArray: "3 3",
              }}
            />
          )}

          {/* Temporary click marker */}
          {clickedPos && <Marker position={clickedPos} />}
        </MapContainer>
      </div>

      {/* Floating Mode Toggle Panel (NO SHADOWS!) */}
      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-1 p-1 rounded-xl border backdrop-blur-md transition-all pointer-events-auto ${
        resolvedTheme === "dark" ? "bg-slate-900/90 border-slate-800" : "bg-white/90 border-slate-200"
      }`}>
        <button
          onClick={() => setMapMode("interact")}
          className={`p-2 rounded-lg transition-all cursor-pointer border-none flex items-center justify-center ${
            mapMode === "interact"
              ? "bg-blue-600 text-white"
              : resolvedTheme === "dark"
                ? "text-slate-400 hover:text-white hover:bg-slate-800/50 bg-transparent"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-transparent"
          }`}
          title="Mode Tambah Titik / Interaksi"
        >
          <MousePointer size={18} />
        </button>
        <button
          onClick={() => setMapMode("pan")}
          className={`p-2 rounded-lg transition-all cursor-pointer border-none flex items-center justify-center ${
            mapMode === "pan"
              ? "bg-blue-600 text-white"
              : resolvedTheme === "dark"
                ? "text-slate-400 hover:text-white hover:bg-slate-800/50 bg-transparent"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-transparent"
          }`}
          title="Mode Geser Peta / Gulir"
        >
          <Hand size={18} />
        </button>
      </div>

      {/* Dialog Konfirmasi Titik Baru */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="z-[9999] bg-slate-900 border border-slate-800 text-white p-0 gap-0 overflow-hidden sm:max-w-md">
          <DialogHeader className="p-6 border-b border-slate-800 bg-slate-900/50">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              Tambahkan Data Baru?
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-slate-400">
              Apakah Anda ingin menambahkan titik sampel kualitas air di koordinat ini?
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Kecamatan Terdeteksi</span>
                {isGeocoding ? (
                  <span className="text-blue-400 animate-pulse">Menghubungkan satelit...</span>
                ) : (
                  <span className="font-semibold text-emerald-400">{formKecamatan || "Tidak terdeteksi"}</span>
                )}
              </div>
              <div className="flex items-center justify-center gap-6 pt-1">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Latitude</span>
                  <span className="font-mono font-medium text-cyan-400">{clickedPos?.lat.toFixed(5)}</span>
                </div>
                <div className="w-px h-8 bg-slate-800"></div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Longitude</span>
                  <span className="font-mono font-medium text-cyan-400">{clickedPos?.lng.toFixed(5)}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 m-0 border-t border-slate-800 bg-slate-950/50 flex flex-row justify-end gap-2 sm:space-x-0 rounded-b-xl">
            <button
              className="px-4 py-2 border border-slate-800 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              onClick={() => setIsConfirmOpen(false)}
            >
              Batal
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              onClick={handleConfirmYes}
            >
              Ya, Lanjutkan
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Formulir Tambah Data Baru */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="z-[9999] bg-slate-900 border border-slate-800 text-white p-0 gap-0 overflow-y-auto max-h-[90vh] sm:max-w-lg">
          <DialogHeader className="p-6 border-b border-slate-800 bg-slate-900/50">
            <DialogTitle className="text-xl font-bold text-white">Formulir Titik Sampel Baru</DialogTitle>
            <DialogDescription className="mt-1 text-slate-400 font-medium">
              Lengkapi data pemantauan kualitas air untuk lokasi yang Anda pilih.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="flex flex-col">
            <div className="p-6 space-y-4 text-white">
              {/* Nama Titik */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Nama Titik Sampel</label>
                <input
                  type="text"
                  placeholder="Contoh: Got Saluran Ciliwung Raya"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-md focus:border-blue-500 focus:outline-none transition-all text-sm"
                  required
                />
              </div>

              {/* Grid: Kecamatan & Tipe Air */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Kecamatan</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Masukkan nama kecamatan..."
                      value={formKecamatan}
                      onChange={(e) => setFormKecamatan(e.target.value)}
                      className="w-full p-2.5 bg-slate-950/60 border border-slate-800 rounded-md focus:border-blue-500 focus:outline-none transition-all text-sm"
                      required
                    />
                    {isGeocoding && (
                      <span className="absolute right-3 top-3 text-[10px] text-blue-400 animate-pulse">GPS...</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Tipe Sampel Air</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as "bersih" | "limbah")}
                    className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-md focus:border-blue-500 focus:outline-none transition-all text-sm [&>option]:bg-slate-900"
                  >
                    <option value="bersih">Air Bersih</option>
                    <option value="limbah">Air Limbah (Got)</option>
                  </select>
                </div>
              </div>

              {/* Grid: pH & Pb (Timbal) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Derajat Keasaman (pH)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={formPh}
                    onChange={(e) => setFormPh(parseFloat(e.target.value))}
                    className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-md focus:border-blue-500 focus:outline-none transition-all text-sm"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Konsentrasi Timbal (Pb) mg/L</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={formPb}
                    onChange={(e) => setFormPb(parseFloat(e.target.value))}
                    className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-md focus:border-blue-500 focus:outline-none transition-all text-sm"
                    required
                  />
                </div>
              </div>

              {/* Grid: Turbidity & COD / BOD */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kekeruhan (NTU)</label>
                  <input
                    type="number"
                    value={formTurbidity}
                    onChange={(e) => setFormTurbidity(parseInt(e.target.value))}
                    className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-md focus:border-blue-500 focus:outline-none transition-all text-sm"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">COD (mg/L)</label>
                  <input
                    type="number"
                    value={formCod}
                    onChange={(e) => setFormCod(parseInt(e.target.value))}
                    className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-md focus:border-blue-500 focus:outline-none transition-all text-sm"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">BOD (mg/L)</label>
                  <input
                    type="number"
                    value={formBod}
                    onChange={(e) => setFormBod(parseInt(e.target.value))}
                    className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-md focus:border-blue-500 focus:outline-none transition-all text-sm"
                    required
                  />
                </div>
              </div>

              {/* Nama Penguji */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Nama Petugas/Reporter</label>
                <input
                  type="text"
                  placeholder="Contoh: Sarah Wijaya"
                  value={formReporter}
                  onChange={(e) => setFormReporter(e.target.value)}
                  className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-md focus:border-blue-500 focus:outline-none transition-all text-sm"
                  required
                />
              </div>
            </div>

            <DialogFooter className="p-4 m-0 border-t border-slate-800 bg-slate-950/50 flex flex-row justify-end gap-2 sm:space-x-0 rounded-b-xl">
              <button
                type="button"
                className="px-4 py-2 border border-slate-800 rounded-md text-sm font-medium hover:bg-slate-800 text-slate-300 transition-colors"
                onClick={() => setIsFormOpen(false)}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Simpan Sampel
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

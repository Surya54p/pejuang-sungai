"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";

// Fix icon issue with leaflet in React
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = customIcon;

function MapClickHandler({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

export default function Map({ onPointSelect }: { onPointSelect?: (point: any) => void }) {
  const position: [number, number] = [-6.2088, 106.8456]; // Jakarta
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [clickedPos, setClickedPos] = useState<L.LatLng | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleMapClick = (latlng: L.LatLng) => {
    setClickedPos(latlng);
    setIsConfirmOpen(true);
  };

  const handleConfirmYes = () => {
    setIsConfirmOpen(false);
    // Beri jeda sedikit agar animasi tutup dialog pertama selesai sebelum dialog kedua terbuka
    setTimeout(() => setIsFormOpen(true), 100);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormOpen(false);
    setClickedPos(null);
    alert("Data berhasil disimpan secara dummy!");
  };

  const tileUrl = mounted && resolvedTheme === "light" 
    ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  const samplePoints = [
    {
      id: 1,
      title: "Titik Sampel 1 - Manggarai",
      position: [-6.2088, 106.8456] as [number, number],
      ph: 7.2, temp: 26.5, turbidity: 12,
      tds: 150, tss: 25,
      do_level: 6.5, bod: 3.2, cod: 15.0,
      ecoli: 120, coliform: 450,
      klorin: 0.1, besi: 0.3, timbal: 0.01, merkuri: 0.001, nitrat: 5.2
    },
    {
      id: 2,
      title: "Titik Sampel 2 - Karet Tengsin",
      position: [-6.2045, 106.8155] as [number, number],
      ph: 6.8, temp: 27.0, turbidity: 15,
      tds: 180, tss: 35,
      do_level: 5.8, bod: 4.5, cod: 20.0,
      ecoli: 250, coliform: 800,
      klorin: 0.2, besi: 0.5, timbal: 0.02, merkuri: 0.002, nitrat: 8.5
    },
    {
      id: 3,
      title: "Titik Sampel 3 - Kampung Melayu",
      position: [-6.2238, 106.8656] as [number, number],
      ph: 6.5, temp: 27.2, turbidity: 20,
      tds: 220, tss: 50,
      do_level: 4.5, bod: 6.0, cod: 30.0,
      ecoli: 500, coliform: 1200,
      klorin: 0.5, besi: 0.8, timbal: 0.05, merkuri: 0.005, nitrat: 12.0
    },
    {
      id: 4,
      title: "Titik Sampel 4 - Pluit",
      position: [-6.1155, 106.7990] as [number, number],
      ph: 7.5, temp: 28.0, turbidity: 10,
      tds: 120, tss: 15,
      do_level: 7.0, bod: 2.0, cod: 10.0,
      ecoli: 50, coliform: 200,
      klorin: 0.05, besi: 0.1, timbal: 0.005, merkuri: 0.0005, nitrat: 2.5
    }
  ];

  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, height: "100vh", width: "100vw", zIndex: 0 }}>
        <MapContainer
          center={position}
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
          
          {samplePoints.map(point => (
            <Marker 
              key={point.id}
              position={point.position}
              eventHandlers={{
                click: () => {
                  if (onPointSelect) {
                    onPointSelect(point);
                  }
                }
              }}
            />
          ))}
          
          {/* Tampilkan marker sementara jika pengguna mengklik peta */}
          {clickedPos && (
             <Marker position={clickedPos} />
          )}
        </MapContainer>
      </div>

      {/* Dialog Konfirmasi Pertama */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="z-9999 bg-background p-0 gap-0 overflow-hidden sm:max-w-md">
          <DialogHeader className="p-6 border-b bg-muted/10">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              Tambahkan Data Baru?
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-muted-foreground">
              Apakah Anda ingin menambahkan titik sampel kualitas air di koordinat ini?
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6">
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50 flex items-center justify-center gap-6">
               <div className="flex flex-col items-center">
                 <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Latitude</span>
                 <span className="font-mono font-medium text-foreground">{clickedPos?.lat.toFixed(5)}</span>
               </div>
               <div className="w-px h-8 bg-border"></div>
               <div className="flex flex-col items-center">
                 <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Longitude</span>
                 <span className="font-mono font-medium text-foreground">{clickedPos?.lng.toFixed(5)}</span>
               </div>
            </div>
          </div>

          <DialogFooter className="p-4 m-0 border-t bg-muted/20 flex flex-row justify-end gap-2 sm:space-x-0 rounded-b-xl">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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

      {/* Dialog Formulir Dummy */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="z-9999 bg-background p-0 gap-0 overflow-hidden sm:max-w-lg">
          <DialogHeader className="p-6 border-b bg-muted/10">
            <DialogTitle className="text-xl font-bold">Formulir Titik Sampel Baru</DialogTitle>
            <DialogDescription className="mt-1">
              Lengkapi data pemantauan kualitas air untuk lokasi yang Anda pilih.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit} className="flex flex-col">
            <div className="p-6 space-y-5 text-foreground">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Tingkat pH</label>
                <input type="number" step="0.1" placeholder="Misal: 7.2" className="p-2.5 border border-gray-300 rounded-md bg-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" required />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Kualitas Air</label>
                <select className="p-2.5 border border-gray-300 rounded-md bg-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all [&>option]:text-black">
                  <option value="baik">Baik (Aman)</option>
                  <option value="waspada">Waspada (Tercemar Ringan)</option>
                  <option value="bahaya">Bahaya (Tercemar Berat)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Keterangan Tambahan</label>
                <textarea placeholder="Deskripsikan warna air, bau, keberadaan sampah, atau kondisi sekitar..." className="p-2.5 border border-gray-300 rounded-md bg-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none" rows={3} />
              </div>
            </div>

            <DialogFooter className="p-4 m-0 border-t bg-muted/20 flex flex-row justify-end gap-2 sm:space-x-0 rounded-b-xl">
              <button 
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setIsFormOpen(false)}
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Simpan Data
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

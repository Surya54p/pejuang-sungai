"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

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

export default function Map() {
  const position: [number, number] = [-6.2088, 106.8456]; // Jakarta
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const tileUrl = mounted && resolvedTheme === "light" 
    ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <div style={{ position: "absolute", top: 0, left: 0, height: "100vh", width: "100vw", zIndex: 0 }}>
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />
        <Marker position={position}>
          <Popup>
            <div>
              <h3 className="font-bold">Titik Sampel 1</h3>
              <p>Kualitas Air: Baik</p>
              <p>pH: 7.2</p>
              <p>Dilaporkan oleh: John Doe</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

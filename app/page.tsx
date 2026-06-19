"use client";

import dynamic from "next/dynamic";
import { Activity, AlertTriangle, CheckCircle, MapPin, Droplet, User, Clock, Settings, FileText, List, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const MapComponent = dynamic(() => import("../components/Map"), {
  ssr: false,
  loading: () => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>Memuat Peta...</div>,
});

export default function Home() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Peta sebagai Latar Belakang (z-index 0) */}
      <MapComponent />

      {/* Lapisan UI di atas peta (z-index 10) */}
      <main style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '1.5rem' }}>
        
        {/* Bagian Atas: Kiri dan Kanan */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1, gap: '1rem' }}>
          
          {/* Panel Kiri - Ringkasan & Navigasi */}
          <section className="border border-gray-300 rounded" style={{ width: '320px', backgroundColor: 'color-mix(in srgb, var(--background) 75%, transparent)', backdropFilter: 'blur(16px)', pointerEvents: 'auto', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 className="font-raleway" style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Droplet className="text-blue-500" /> Pejuang Sungai
              </h1>
              {mounted && (
                <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} style={{ padding: '0.5rem', borderRadius: '50%', border: '1px solid gray', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              )}
            </div>
            <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', opacity: 0.8 }}>
              Monitoring Kualitas Air
            </p>
            
            <hr style={{ margin: '1.25rem 0', borderColor: 'gray' }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> Total Titik Pantau</span>
                <span style={{ fontWeight: 'bold' }}>124</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} /> Status Aman</span>
                <span style={{ fontWeight: 'bold' }}>90</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#eab308', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={16} /> Status Waspada</span>
                <span style={{ fontWeight: 'bold' }}>24</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={16} /> Status Bahaya</span>
                <span style={{ fontWeight: 'bold' }}>10</span>
              </div>
            </div>

            <hr style={{ margin: '1.25rem 0', borderColor: 'gray' }} />
            
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem', listStyle: 'none', padding: 0, flex: 1 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><MapPin size={16} /> Peta Keseluruhan</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><List size={16} /> Daftar Titik Sampel</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><FileText size={16} /> Laporan Masuk</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><Settings size={16} /> Pengaturan</li>
            </ul>

            <button style={{ padding: '0.75rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <MapPin size={18} /> Laporkan Titik Baru
            </button>
          </section>

          {/* Panel Kanan - Live Feed & Alerts */}
          <section className="border border-gray-300 rounded" style={{ width: '320px', backgroundColor: 'color-mix(in srgb, var(--background) 75%, transparent)', backdropFilter: 'blur(16px)', pointerEvents: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h2 className="font-raleway" style={{ fontSize: '1.125rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} /> Peringatan & Aktivitas
            </h2>
            <hr style={{ margin: '1.25rem 0', borderColor: 'gray' }} />
            
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.875rem', listStyle: 'none', padding: 0, overflowY: 'auto' }}>
              <li style={{ paddingLeft: '10px', borderLeft: '3px solid #ef4444' }}>
                <strong style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={14} /> Peringatan: pH 4.0 (Bahaya)</strong>
                <span style={{ opacity: 0.8, display: 'block', marginTop: '0.25rem' }}>Terdeteksi di Skt. Ciliwung - 2 mnt lalu</span>
              </li>
              <li style={{ paddingLeft: '10px', borderLeft: '3px solid #10b981' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={14} /> Data Diperbarui</strong>
                <span style={{ opacity: 0.8, display: 'block', marginTop: '0.25rem' }}>Oleh: Budi - Titik 4 - 15 mnt lalu</span>
              </li>
              <li style={{ paddingLeft: '10px', borderLeft: '3px solid #3b82f6' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FileText size={14} /> Laporan Baru Masuk</strong>
                <span style={{ opacity: 0.8, display: 'block', marginTop: '0.25rem' }}>Oleh: Relawan01 - Manggarai - 1 jam lalu</span>
              </li>
            </ul>
          </section>

        </div>

        {/* Panel Bawah - Detail Titik Spesifik */}
        <section className="border border-gray-300 rounded" style={{ width: '100%', backgroundColor: 'color-mix(in srgb, var(--background) 75%, transparent)', backdropFilter: 'blur(16px)', pointerEvents: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 className="font-raleway" style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={24} color="#3b82f6" /> Titik Sampel 1 - Manggarai
              </h2>
              <p style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={14} /> Terakhir diupdate: Hari ini, 14:30 WIB | Koordinat: -6.2088, 106.8456
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', border: '1px solid gray', borderRadius: '4px', cursor: 'pointer', color: 'var(--foreground)' }}>Lihat Riwayat</button>
              <button style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Verifikasi Laporan</button>
            </div>
          </div>
          
          <hr style={{ borderColor: 'gray', opacity: 0.5, margin: 0 }} />

          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kualitas Air</p>
              <p style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={18} /> Baik</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tingkat pH</p>
              <p style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>7.2</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suhu Air</p>
              <p style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>26.5 °C</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kekeruhan</p>
              <p style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Rendah (12 NTU)</p>
            </div>
            
            {/* Dummy Mini Chart Container */}
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <p style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tren pH (7 Hari Terakhir)</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '30px', gap: '4px' }}>
                <div style={{ width: '12%', height: '80%', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                <div style={{ width: '12%', height: '85%', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                <div style={{ width: '12%', height: '70%', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                <div style={{ width: '12%', height: '75%', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                <div style={{ width: '12%', height: '90%', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                <div style={{ width: '12%', height: '95%', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                <div style={{ width: '12%', height: '100%', backgroundColor: '#10b981', borderRadius: '2px' }}></div>
              </div>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pelapor</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'black', fontWeight: 'bold' }}>JD</div>
                <p style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>John Doe</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

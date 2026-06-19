"use client";

import dynamic from "next/dynamic";
import { Activity, AlertTriangle, CheckCircle, MapPin, Droplet, User, Clock, Settings, FileText, List, Sun, Moon, ChevronLeft, ChevronRight, X, Eye, Edit, Trash2, Download } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const MapComponent = dynamic(() => import("../../components/Map"), {
  ssr: false,
  loading: () => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>Memuat Peta...</div>,
});

const dummyPoints = Array.from({ length: 45 }).map((_, i) => ({
  id: i + 1,
  title: `Titik Sampel ${i + 1}`,
  location: ['Manggarai', 'Ciliwung', 'Karet', 'Tanah Abang', 'Pluit'][i % 5],
  reporter: ['John Doe', 'Budi', 'Relawan01', 'Siti', 'Andi'][i % 5],
  datetime: `19 Jun 2026, ${10 + (i % 8).toString().padStart(2, '0')}:${((i % 6) * 10).toString().padStart(2, '0')} WIB`,
  ph: (6.5 + (i % 3) * 0.4).toFixed(1),
  temp: (26 + (i % 4) * 0.5).toFixed(1),
  turbidity: 10 + (i % 5) * 5,
  tds: 150 + (i % 10) * 10,
  tss: 20 + (i % 8) * 5,
  do_level: (5.0 + (i % 4) * 0.5).toFixed(1),
  bod: (3.0 + (i % 5) * 0.5).toFixed(1),
  cod: 15 + (i % 5) * 2,
  ecoli: 100 + (i % 10) * 50,
  coliform: 400 + (i % 10) * 100,
  klorin: (0.1 + (i % 3) * 0.1).toFixed(2),
  besi: (0.3 + (i % 4) * 0.1).toFixed(2),
  timbal: (0.01 + (i % 5) * 0.01).toFixed(3),
  merkuri: (0.001 + (i % 2) * 0.002).toFixed(4),
  nitrat: (5.0 + (i % 6)).toFixed(1)
}));

export default function Home() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  const itemsPerPage = 20;
  const totalPages = Math.ceil(dummyPoints.length / itemsPerPage);
  const displayedPoints = dummyPoints.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => setMounted(true), []);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Peta sebagai Latar Belakang (z-index 0) */}
      <MapComponent onPointSelect={setSelectedPoint} />

      {/* Lapisan UI di atas peta (z-index 10) */}
      <main style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '1.5rem' }}>

        {/* Bagian Atas: Kiri dan Kanan */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1, gap: '1rem' }}>

          {/* Panel Kiri - Ringkasan & Navigasi */}
          <section className={`border rounded-2xl flex flex-col p-6 pointer-events-auto h-fit transition-colors shadow-2xl backdrop-blur-xl ${(mounted && resolvedTheme === "dark") ? "bg-slate-900/60 border-slate-700/50 text-white" : "bg-white/70 border-white/60 text-slate-900"}`} style={{ width: '320px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 className="font-raleway" style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Droplet className="text-blue-500" /> Pejuang Sungai
              </h1>
              {mounted && (
                <button
                  onClick={() => setTheme((mounted && resolvedTheme === "dark") ? "light" : "dark")}
                  className={`p-2 rounded-full border transition-colors flex items-center justify-center cursor-pointer ${(mounted && resolvedTheme === "dark")
                    ? "border-slate-600 hover:bg-slate-800 text-yellow-400"
                    : "border-slate-300 hover:bg-slate-100 text-slate-700"
                    }`}
                >
                  {(mounted && resolvedTheme === "dark") ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              )}
            </div>
            <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', opacity: 0.8, marginBottom: '1.25rem' }}>
              Monitoring Kualitas Air
            </p>

            {/* Profile Section */}
            <div className={`flex items-center gap-3 mb-6 p-3 rounded-xl border ${(mounted && resolvedTheme === "dark") ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-100/50"
              }`}>
              <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${(mounted && resolvedTheme === "dark") ? "bg-slate-700 text-slate-300" : "bg-slate-300 text-slate-600"
                }`}>
                <User size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[15px] leading-tight">Budi Santoso</span>
                <span className={`text-[11px] uppercase tracking-wide ${(mounted && resolvedTheme === "dark") ? "text-slate-400" : "text-slate-500"
                  }`}>ID: PJS-2026-001</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-lg  cursor-pointer transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                <MapPin size={18} /> Laporkan Titik Baru
              </button>
              <button className="w-full py-2.5 px-4 bg-background hover:bg-muted text-foreground border border-border rounded-lg font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-sm">
                <FileText size={18} /> Unduh Laporan PDF
              </button>
            </div>
          </section>

          {/* Panel Tengah - Statcards Horizontal */}
          <div className="flex flex-wrap gap-4 items-start justify-center  h-fit  flex-1 pointer-events-none">
            <div className={`rounded-2xl flex flex-wrap gap-2 px-4 py-2 items-center justify-center shadow-2xl backdrop-blur-xl transition-colors pointer-events-auto ${(mounted && resolvedTheme === "dark") ? "bg-slate-900/60 border border-slate-700/50" : "bg-white/70 border border-white/60"}`}>
              {/* Statcard Total */}
              <div className={`flex items-center gap-2 p-2  min-w-[140px] pointer-events-auto `}>
                <div className={`p-2 rounded-lg ${(mounted && resolvedTheme === "dark") ? " text-blue-400" : " text-blue-600"
                  }`}>
                  <MapPin size={22} />
                </div>
                <div>
                  <p className={`text-[10px] uppercase tracking-wider mb-0.5 font-bold ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-500"
                    }`}>Total Titik</p>
                  <p className={`text-xl  ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-500"
                    }`}>124</p>
                </div>
              </div>

              {/* Statcard Aman */}
              <div className={`flex items-center gap-2 p-2 min-w-[140px] pointer-events-auto`}>
                <div className={`p-2 rounded-lg ${(mounted && resolvedTheme === "dark") ? "text-green-400" : "text-green-600"}`}>
                  <CheckCircle size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <p className={`text-[10px] uppercase tracking-wider mb-0.5 font-bold ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-500"}`}>Aman</p>
                  <p className={`text-xl ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-500"}`}>90</p>
                </div>
              </div>

              {/* Statcard Waspada */}
              <div className={`flex items-center gap-2 p-2 min-w-[140px] pointer-events-auto`}>
                <div className={`p-2 rounded-lg ${(mounted && resolvedTheme === "dark") ? "text-yellow-400" : "text-yellow-600"}`}>
                  <Activity size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <p className={`text-[10px] uppercase tracking-wider mb-0.5 font-bold ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-500"}`}>Waspada</p>
                  <p className={`text-xl ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-500"}`}>24</p>
                </div>
              </div>

              {/* Statcard Bahaya */}
              <div className={`flex items-center gap-2 p-2 min-w-[140px] pointer-events-auto`}>
                <div className={`p-2 rounded-lg ${(mounted && resolvedTheme === "dark") ? "text-red-400" : "text-red-600"}`}>
                  <AlertTriangle size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <p className={`text-[10px] uppercase tracking-wider mb-0.5 font-bold ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-500"}`}>Bahaya</p>
                  <p className={`text-xl ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-500"}`}>10</p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Kanan - Daftar Titik / Detail Titik */}
          <section className={`border rounded-2xl flex flex-col p-6 pointer-events-auto transition-colors shadow-2xl backdrop-blur-xl ${(mounted && resolvedTheme === "dark") ? "bg-slate-900/60 border-slate-700/50 text-white" : "bg-white/70 border-white/60 text-slate-900"}`} style={{ width: '380px', height: '100%', maxHeight: 'calc(100vh - 3rem)' }}>
            {selectedPoint ? (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between mb-4 flex-shrink-0 border-b border-border pb-3">
                  <h2 className="font-raleway text-[1.125rem] ">Parameter Kualitas Air</h2>
                  <button onClick={() => setSelectedPoint(null)} className="p-1 hover:bg-muted rounded-full text-muted-foreground transition-colors cursor-pointer">
                    <X size={20} />
                  </button>
                </div>
                <div className="overflow-y-auto custom-scrollbar pr-2 flex-1">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-2 pr-4 font-semibold text-blue-600 dark:text-blue-400 w-1/3">Parameter</th>
                        <th className="pb-2 font-semibold text-blue-600 dark:text-blue-400">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="py-3 pr-4 font-medium align-top">Sifat Fisik</td>
                        <td className={`py-3 leading-relaxed ${(mounted && resolvedTheme === "dark") ? "text-slate-300" : "text-slate-600"}`}>
                          Suhu: <span className={`font-medium ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-900"}`}>{selectedPoint.temp}°C</span>, Kekeruhan: <span className={`font-medium ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-900"}`}>{selectedPoint.turbidity} NTU</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-medium align-top">Derajat Keasaman (pH)</td>
                        <td className={`py-3 leading-relaxed ${(mounted && resolvedTheme === "dark") ? "text-slate-300" : "text-slate-600"}`}>
                          pH: <span className={`font-medium ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-900"}`}>{selectedPoint.ph}</span> (Normal: 6,5 - 8,5)
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-medium align-top">Zat Terlarut & Tersuspensi</td>
                        <td className={`py-3 leading-relaxed ${(mounted && resolvedTheme === "dark") ? "text-slate-300" : "text-slate-600"}`}>
                          TDS: <span className={`font-medium ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-900"}`}>{selectedPoint.tds} mg/L</span>, TSS: <span className={`font-medium ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-900"}`}>{selectedPoint.tss} mg/L</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-medium align-top">Oksigen & Organik</td>
                        <td className={`py-3 leading-relaxed ${(mounted && resolvedTheme === "dark") ? "text-slate-300" : "text-slate-600"}`}>
                          DO: <span className={`font-medium ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-900"}`}>{selectedPoint.do_level} mg/L</span>, BOD: <span className={`font-medium ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-900"}`}>{selectedPoint.bod} mg/L</span>, COD: <span className={`font-medium ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-900"}`}>{selectedPoint.cod} mg/L</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-medium align-top">Mikrobiologi</td>
                        <td className={`py-3 leading-relaxed ${(mounted && resolvedTheme === "dark") ? "text-slate-300" : "text-slate-600"}`}>
                          E. coli: <span className={`font-medium ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-900"}`}>{selectedPoint.ecoli} MPN/100ml</span>, Coliform: <span className={`font-medium ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-900"}`}>{selectedPoint.coliform} MPN/100ml</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 font-medium align-top">Kimia & Logam Berat</td>
                        <td className={`py-3 leading-relaxed ${(mounted && resolvedTheme === "dark") ? "text-slate-300" : "text-slate-600"}`}>
                          Klorin: <span className={`font-medium ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-900"}`}>{selectedPoint.klorin} mg/L</span>, Besi: <span className={`font-medium ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-900"}`}>{selectedPoint.besi} mg/L</span>, Timbal: <span className={`font-medium ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-900"}`}>{selectedPoint.timbal} mg/L</span>, Merkuri: <span className={`font-medium ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-900"}`}>{selectedPoint.merkuri} mg/L</span>, Nitrat: <span className={`font-medium ${(mounted && resolvedTheme === "dark") ? "text-white" : "text-slate-900"}`}>{selectedPoint.nitrat} mg/L</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-raleway" style={{ fontSize: '1.125rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <List size={20} /> Daftar Titik Pantau
                </h2>

                <ul className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', listStyle: 'none', padding: 0, overflowY: 'auto', marginTop: '1rem', flex: 1, paddingRight: '0.5rem' }}>
                  {displayedPoints.map(point => (
                    <li key={point.id} className={`p-3 border border-gray-300 rounded-lg transition-colors shadow-sm ${(mounted && resolvedTheme === "dark") ? "bg-slate-800/50 hover:bg-slate-700/50" : "bg-white/50 hover:bg-slate-100/50"}`}>
                      <div onClick={() => setSelectedPoint(point)} className="cursor-pointer">
                        <div className="font-bold text-[15px] mb-2">{point.title}</div>
                        <div className={`flex flex-col gap-1.5 text-xs ${(mounted && resolvedTheme === "dark") ? "text-slate-300" : "text-slate-600"}`}>
                          <span className="flex items-center gap-2"><MapPin size={14} /> {point.location}</span>
                          <span className="flex items-center gap-2"><User size={14} /> {point.reporter}</span>
                          <span className="flex items-center gap-2"><Clock size={14} /> {point.datetime}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-300">
                        <button onClick={() => setSelectedPoint(point)} className="flex flex-col items-center gap-1 text-[10px] text-blue-500 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none p-1" title="Detail">
                          <Eye size={16} /> Detail
                        </button>
                        <button onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-1 text-[10px] text-yellow-500 hover:text-yellow-600 transition-colors cursor-pointer bg-transparent border-none p-1" title="Edit">
                          <Edit size={16} /> Edit
                        </button>
                        <button onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-1 text-[10px] text-green-500 hover:text-green-600 transition-colors cursor-pointer bg-transparent border-none p-1" title="Eksport">
                          <Download size={16} /> Eksport
                        </button>
                        <button onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-1 text-[10px] text-red-500 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none p-1" title="Hapus">
                          <Trash2 size={16} /> Hapus
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border flex-shrink-0">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`p-1.5 rounded-md border border-border disabled:opacity-50 transition-colors flex items-center justify-center cursor-pointer ${(mounted && resolvedTheme === "dark") ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-white hover:bg-slate-100 text-slate-900"}`}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-semibold">Hal {currentPage} dari {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-1.5 rounded-md border border-border disabled:opacity-50 transition-colors flex items-center justify-center cursor-pointer ${(mounted && resolvedTheme === "dark") ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-white hover:bg-slate-100 text-slate-900"}`}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </>
            )}
          </section>

        </div>



      </main>
    </div>
  );
}

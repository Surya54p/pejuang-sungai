"use client";

import dynamic from "next/dynamic";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Droplet,
  User,
  Clock,
  FileText,
  List,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Filter,
  Layers,
  Info
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import { checkPointStatus, Point } from "@/lib/water-types";

const MapComponent = dynamic(() => import("../../components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-slate-950 text-slate-400">
      <div className="flex flex-col items-center gap-3">
        <Droplet className="animate-bounce text-blue-500 w-10 h-10" />
        <span className="text-sm font-medium">Memuat Peta Pemantauan...</span>
      </div>
    </div>
  ),
});

// Seed data
const initialPoints: Point[] = [];

export default function Home() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);

  // Filters State
  const [filterKecamatan, setFilterKecamatan] = useState<string>("Semua");
  const [filterType, setFilterType] = useState<string>("Semua");
  const [heatmapMode, setHeatmapMode] = useState<"none" | "ph" | "exceedance">("none");

  // Autocomplete Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            searchQuery + ", Indonesia"
          )}&format=json&addressdetails=1&limit=5`
        );
        const data = await res.json();
        if (data) {
          const items = data.map((item: any) => {
            const addr = item.address || {};
            const name = addr.subdistrict || addr.suburb || addr.village || addr.city_district || addr.town || addr.city || item.display_name;
            const cleanName = name.replace(/^(kecamatan|kelurahan|desa|kota|kabupaten)\s+/i, "");
            const context = [addr.city || addr.town || addr.municipality, addr.state].filter(Boolean).join(", ");
            return {
              displayName: `${cleanName}${context ? ` (${context})` : ""}`,
              value: item.display_name,
              shortName: cleanName
            };
          });
          
          // Deduplicate suggestions based on displayName
          const uniqueItems: any[] = [];
          const seen = new Set();
          for (const item of items) {
            if (!seen.has(item.displayName)) {
              seen.add(item.displayName);
              uniqueItems.push(item);
            }
          }
          setSuggestions(uniqueItems);
        }
      } catch (err) {
        console.error("Gagal memuat rekomendasi Kecamatan:", err);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Tabs state for right panel
  const [activeTab, setActiveTab] = useState<"detail" | "analitik">("detail");

  // User info states
  const [userName, setUserName] = useState("Admin Dinas LH");
  const [userRole, setUserRole] = useState("admin");

  // State points
  const [points, setPoints] = useState<Point[]>([]);

  // Fetch data points from the API database on client mount
  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userName");
      const storedRole = localStorage.getItem("userRole");
      if (storedName) setUserName(storedName);
      if (storedRole) setUserRole(storedRole);
    }
    
    const fetchPoints = async () => {
      try {
        const res = await fetch("/api/points");
        if (res.ok) {
          const data = await res.json();
          setPoints(data);
        } else {
          console.error("Gagal mengambil data dari API.");
        }
      } catch (err) {
        console.error("Gagal melakukan fetch data titik sampel:", err);
      }
    };
    
    fetchPoints();
  }, []);

  const handleAddPoint = async (newPoint: Point) => {
    try {
      const role = typeof window !== "undefined" ? (localStorage.getItem("userRole") || "tamu") : "tamu";
      const payload = {
        ...newPoint,
        reporterRole: role,
      };
      
      const res = await fetch("/api/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const savedPoint = await res.json();
        setPoints((prev) => [savedPoint, ...prev]);
        setSelectedPoint(savedPoint);
      } else {
        console.error("Gagal menyimpan data sampel baru ke backend.");
        setPoints((prev) => [newPoint, ...prev]);
        setSelectedPoint(newPoint);
      }
    } catch (err) {
      console.error("Gagal mengirim data sampel baru:", err);
      setPoints((prev) => [newPoint, ...prev]);
      setSelectedPoint(newPoint);
    }
  };

  // List of unique subdistricts (Kecamatan) for filters
  const listKecamatan = useMemo(() => {
    const kecs = new Set(points.map((p) => p.location));
    return ["Semua", ...Array.from(kecs).sort()];
  }, [points]);

  // Filtered Points
  const filteredPoints = useMemo(() => {
    return points.filter((p) => {
      const matchKec =
        filterKecamatan === "Semua" ||
        p.location.toLowerCase().includes(filterKecamatan.split(",")[0].trim().toLowerCase()) ||
        filterKecamatan.toLowerCase().includes(p.location.toLowerCase());
      const matchType = filterType === "Semua" || p.type === filterType;
      return matchKec && matchType;
    });
  }, [points, filterKecamatan, filterType]);

  // Pagination for list view
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredPoints.length / itemsPerPage);
  const displayedPoints = useMemo(() => {
    return filteredPoints.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredPoints, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterKecamatan, filterType]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = filteredPoints.length;
    const bersih = filteredPoints.filter((p) => p.type === "bersih").length;
    const limbah = filteredPoints.filter((p) => p.type === "limbah").length;
    
    // Check exceedances using the helper function
    const exceedances = filteredPoints.filter((p) => checkPointStatus(p).isExceeding).length;
    
    // Toxic Lead (Pb) presence in wastewater (exceeding standard 0.10 mg/L)
    // or bersih exceeding 0.03 mg/L
    const pbExceed = filteredPoints.filter((p) => {
      const isWastewater = p.type === "limbah";
      return isWastewater ? p.pb > 0.10 : p.pb > 0.03;
    }).length;

    return { total, bersih, limbah, exceedances, pbExceed };
  }, [filteredPoints]);

  // SVG Chart 1 Data: Clean vs Waste distribution (Safe vs Exceeding)
  const barChartData = useMemo(() => {
    const cAman = filteredPoints.filter(p => p.type === "bersih" && !checkPointStatus(p).isExceeding).length;
    const cExceed = filteredPoints.filter(p => p.type === "bersih" && checkPointStatus(p).isExceeding).length;
    const lAman = filteredPoints.filter(p => p.type === "limbah" && !checkPointStatus(p).isExceeding).length;
    const lExceed = filteredPoints.filter(p => p.type === "limbah" && checkPointStatus(p).isExceeding).length;
    return { cAman, cExceed, lAman, lExceed };
  }, [filteredPoints]);

  // SVG Chart 2 Data: Lead (Pb) values in Wastewater samples (Top 7)
  const pbChartData = useMemo(() => {
    return filteredPoints
      .filter((p) => p.type === "limbah")
      .slice(0, 7)
      .map((p) => ({
        label: p.title.replace("Sampel Limbah Got - ", "").slice(0, 10),
        value: p.pb,
        isExceeded: p.pb > 0.10
      }));
  }, [filteredPoints]);

  // pH Distribution range analysis
  const phDistribution = useMemo(() => {
    const acid = filteredPoints.filter(p => p.ph < 6.5).length;
    const normal = filteredPoints.filter(p => p.ph >= 6.5 && p.ph <= 8.5).length;
    const alkaline = filteredPoints.filter(p => p.ph > 8.5).length;
    return { acid, normal, alkaline };
  }, [filteredPoints]);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <div className={`min-h-screen relative flex flex-col font-sans transition-colors duration-300 ${
      isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
    }`}>
      
      {/* Background Interactive Map (z-index 0) */}
      <MapComponent 
        points={filteredPoints} 
        selectedPoint={selectedPoint} 
        onPointSelect={(pt) => {
          setSelectedPoint(pt);
          setActiveTab("detail");
        }} 
        heatmapMode={heatmapMode}
        onAddPoint={handleAddPoint}
        selectedKecamatan={filterKecamatan}
      />

      {/* Control overlay & Sidebar - absolute (z-index 10) */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 md:p-6">
        
        {/* Top Header Row & Statcards */}
        <div className="w-full flex flex-col gap-4 pointer-events-auto">
          
          {/* Header Panel */}
          <header className={`w-full border p-4 rounded-xl backdrop-blur-xl transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-4 ${
            isDark ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200"
          }`}>
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Droplet className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-bold font-raleway tracking-tight">Pejuang Sungai</h1>
                <p className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Sistem Informasi Kualitas Air Internal
                </p>
              </div>
            </div>

            {/* Profile & Settings & Theme */}
            <div className="flex items-center gap-4">
              <div className={`hidden sm:flex items-center gap-2 border-l pl-4 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                <User className="w-4 h-4 text-blue-500" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold leading-tight">{userName}</span>
                  <span className={`text-[9px] uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {userRole === "admin" ? "ID: DLH-JKT-2026" : "ID: GUEST-2026"}
                  </span>
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={`p-2 rounded-lg border transition-colors flex items-center justify-center cursor-pointer ${
                  isDark ? "border-slate-800 hover:bg-slate-800 text-yellow-400" : "border-slate-200 hover:bg-slate-100 text-slate-700"
                }`}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </header>

          {/* Statcards Row (No Shadows!) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            
            {/* Total Samples */}
            <div className={`border p-3.5 rounded-xl backdrop-blur-xl transition-all duration-300 ${
              isDark ? "bg-slate-900/80 border-slate-800" : "bg-white/85 border-slate-200"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <List size={18} />
                </div>
                <div>
                  <p className={`text-[9px] uppercase font-bold tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Total Sampel</p>
                  <p className="text-lg font-extrabold leading-none mt-1">{stats.total}</p>
                </div>
              </div>
            </div>

            {/* Clean Water */}
            <div className={`border p-3.5 rounded-xl backdrop-blur-xl transition-all duration-300 ${
              isDark ? "bg-slate-900/80 border-slate-800" : "bg-white/85 border-slate-200"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <CheckCircle size={18} />
                </div>
                <div>
                  <p className={`text-[9px] uppercase font-bold tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Air Bersih</p>
                  <p className="text-lg font-extrabold leading-none mt-1">{stats.bersih}</p>
                </div>
              </div>
            </div>

            {/* Wastewater Got */}
            <div className={`border p-3.5 rounded-xl backdrop-blur-xl transition-all duration-300 ${
              isDark ? "bg-slate-900/80 border-slate-800" : "bg-white/85 border-slate-200"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <Droplet size={18} />
                </div>
                <div>
                  <p className={`text-[9px] uppercase font-bold tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Limbah Got</p>
                  <p className="text-lg font-extrabold leading-none mt-1">{stats.limbah}</p>
                </div>
              </div>
            </div>

            {/* Exceeding Standards */}
            <div className={`border p-3.5 rounded-xl backdrop-blur-xl transition-all duration-300 ${
              isDark ? "bg-slate-900/80 border-slate-800" : "bg-white/85 border-slate-200"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <p className={`text-[9px] uppercase font-bold tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Luar Baku Mutu</p>
                  <p className={`text-lg font-extrabold leading-none mt-1 ${stats.exceedances > 0 ? "text-rose-500 animate-pulse" : ""}`}>
                    {stats.exceedances}
                  </p>
                </div>
              </div>
            </div>

            {/* Pb Lead warning */}
            <div className={`border p-3.5 rounded-xl backdrop-blur-xl transition-all duration-300 col-span-2 md:col-span-1 ${
              isDark ? "bg-slate-900/80 border-slate-800" : "bg-white/85 border-slate-200"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-600/10 text-red-500">
                  <Activity size={18} />
                </div>
                <div>
                  <p className={`text-[9px] uppercase font-bold tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Bahaya Pb</p>
                  <p className={`text-lg font-extrabold leading-none mt-1 ${stats.pbExceed > 0 ? "text-red-500 font-extrabold" : ""}`}>
                    {stats.pbExceed} titik
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Content Area: Split Filters & List (Left) and Detail/Analytics Panel (Right) */}
        <div className="w-full flex-1 flex flex-col md:flex-row justify-between gap-5 items-stretch mt-4 min-h-0 overflow-hidden">
          
          {/* Left Panel: Filter & List (z-index 10) */}
          <div className="w-full md:w-[340px] flex flex-col gap-4 pointer-events-auto h-full">
            
            {/* Filter Card (No Shadows!) */}
            <section className={`relative z-50 border p-5 rounded-2xl backdrop-blur-xl transition-all duration-300 ${
              isDark ? "bg-slate-900/80 border-slate-800 text-white" : "bg-white/85 border-slate-200 text-slate-900"
            }`}>
              <div className="flex items-center gap-2 mb-3.5 border-b pb-2 border-border/50">
                <Filter className="w-4 h-4 text-blue-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider">Penyaringan Data</h2>
              </div>

              <div className="space-y-3.5 text-left">
                {/* Kecamatan Autocomplete */}
                <div className="flex flex-col gap-1 relative">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Kecamatan</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari Kecamatan di Indonesia..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      className={`w-full p-2 pr-8 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
                        isDark 
                          ? "bg-slate-950 border-slate-800 text-white" 
                          : "bg-white border-slate-300 text-slate-900"
                      }`}
                    />
                    {/* Clear/Reset Button */}
                    {(searchQuery || filterKecamatan !== "Semua") && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setFilterKecamatan("Semua");
                          setSuggestions([]);
                          setShowSuggestions(false);
                        }}
                        className={`absolute right-2 top-2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-855 ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                        title="Reset Filter"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Active Filter Indicator */}
                  {filterKecamatan !== "Semua" && (
                    <div className="mt-1 flex items-center justify-between text-[10px] px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md">
                      <span className="truncate max-w-[260px] font-semibold">Aktif: {filterKecamatan.split(",")[0]}</span>
                      <button
                        onClick={() => {
                          setFilterKecamatan("Semua");
                          setSearchQuery("");
                        }}
                        className="text-blue-400 hover:text-blue-300 font-bold ml-1"
                      >
                        Hapus
                      </button>
                    </div>
                  )}

                  {/* Suggestions Dropdown (NO SHADOWS!) */}
                  {showSuggestions && (
                    <>
                      {/* Backdrop for closing suggestions */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowSuggestions(false)}
                      />
                      
                      <div className={`absolute left-0 right-0 top-full mt-1 border rounded-lg z-50 overflow-hidden max-h-60 overflow-y-auto ${
                        isDark 
                          ? "bg-slate-950 border-slate-800 text-white" 
                          : "bg-white border-slate-300 text-slate-900"
                      }`}>
                        
                        {/* Option: Semua Wilayah */}
                        <div
                          onClick={() => {
                            setFilterKecamatan("Semua");
                            setSearchQuery("");
                            setShowSuggestions(false);
                          }}
                          className={`p-2 text-xs font-semibold cursor-pointer border-b border-border/40 ${
                            isDark ? "hover:bg-slate-900 text-slate-300" : "hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          Semua Wilayah (Reset)
                        </div>

                        {/* Local suggestion header */}
                        {searchQuery.length < 3 && (
                          <div className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${
                            isDark ? "bg-slate-900/60 text-slate-500" : "bg-slate-50 text-slate-400"
                          }`}>
                            Kecamatan Aktif
                          </div>
                        )}

                        {/* Local suggestions */}
                        {searchQuery.length < 3 && 
                          listKecamatan
                            .filter(kec => kec !== "Semua")
                            .map((kec) => (
                              <div
                                key={kec}
                                onClick={() => {
                                  setFilterKecamatan(kec);
                                  setSearchQuery(kec);
                                  setShowSuggestions(false);
                                }}
                                className={`p-2 text-xs cursor-pointer ${
                                  isDark ? "hover:bg-slate-900 hover:text-white text-slate-300" : "hover:bg-slate-100 hover:text-slate-950 text-slate-700"
                                }`}
                              >
                                {kec}
                              </div>
                            ))
                        }

                        {/* Search header / loading indicator */}
                        {searchQuery.length >= 3 && (
                          <div className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider flex items-center justify-between ${
                            isDark ? "bg-slate-900/60 text-slate-500" : "bg-slate-50 text-slate-400"
                          }`}>
                            <span>Pencarian Indonesia</span>
                            {isSearching && <span className="animate-pulse text-blue-400">Mencari...</span>}
                          </div>
                        )}

                        {/* Search suggestions */}
                        {searchQuery.length >= 3 && suggestions.map((sug, index) => (
                          <div
                            key={`sug-${index}`}
                            onClick={() => {
                              setFilterKecamatan(sug.value);
                              setSearchQuery(sug.shortName);
                              setShowSuggestions(false);
                            }}
                            className={`p-2 text-xs cursor-pointer border-b last:border-b-0 border-border/20 ${
                              isDark ? "hover:bg-slate-900 hover:text-white text-slate-300" : "hover:bg-slate-100 hover:text-slate-950 text-slate-700"
                            }`}
                          >
                            {sug.displayName}
                          </div>
                        ))}

                        {searchQuery.length >= 3 && !isSearching && suggestions.length === 0 && (
                          <div className="p-3 text-center text-xs text-slate-500 font-medium">
                            Kecamatan tidak ditemukan.
                          </div>
                        )}

                      </div>
                    </>
                  )}
                </div>

                {/* Tipe Air */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tipe Sampel Air</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className={`w-full p-2 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 outline-none ${
                      isDark 
                        ? "bg-slate-950 border-slate-800 text-white [&>option]:bg-slate-950 [&>option]:text-white" 
                        : "bg-white border-slate-300 text-slate-900 [&>option]:bg-white [&>option]:text-slate-900"
                    }`}
                  >
                    <option value="Semua">Semua Sampel</option>
                    <option value="bersih">Air Bersih saja</option>
                    <option value="limbah">Air Limbah (Got) saja</option>
                  </select>
                </div>

                {/* Heatmap selector */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-blue-400" /> Layer Heatmap
                  </label>
                  <select
                    value={heatmapMode}
                    onChange={(e) => setHeatmapMode(e.target.value as "none" | "ph" | "exceedance")}
                    className={`w-full p-2 rounded-lg border text-xs focus:ring-1 focus:ring-blue-500 outline-none font-semibold ${
                      isDark 
                        ? "bg-slate-950 border-slate-800 text-white [&>option]:bg-slate-950 [&>option]:text-white" 
                        : "bg-white border-slate-300 text-slate-900 [&>option]:bg-white [&>option]:text-slate-900"
                    }`}
                  >
                    <option value="none">Heatmap: Nonaktif</option>
                    <option value="ph">Heatmap: Derajat Keasaman (pH)</option>
                    <option value="exceedance">Heatmap: Pelanggaran Baku Mutu</option>
                  </select>
                </div>
              </div>
            </section>

            {/* List View Card (No Shadows!) */}
            <section className={`relative z-10 border p-4 rounded-2xl backdrop-blur-xl flex flex-col flex-1 overflow-hidden transition-all duration-300 ${
              isDark ? "bg-slate-900/80 border-slate-800 text-white" : "bg-white/85 border-slate-200 text-slate-900"
            }`}>
              <div className="flex items-center justify-between mb-2 border-b pb-2 border-border/50">
                <div className="flex items-center gap-2">
                  <List size={14} className="text-blue-500" />
                  <h2 className="text-xs font-bold uppercase tracking-wider">Titik Pantau ({filteredPoints.length})</h2>
                </div>
                <div className="text-[9px] bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded text-blue-400 font-bold uppercase">
                  Instansi
                </div>
              </div>

              {/* Scrollable Points List */}
              <ul className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                {displayedPoints.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-medium">
                    Tidak ada titik sampel yang sesuai filter.
                  </div>
                ) : (
                  displayedPoints.map((point) => {
                    const statusDetails = checkPointStatus(point);
                    const isSelected = selectedPoint?.id === point.id;
                    return (
                      <li
                        key={point.id}
                        onClick={() => setSelectedPoint(point)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all duration-200 text-left ${
                          isSelected
                            ? isDark
                              ? "bg-slate-800 border-blue-500"
                              : "bg-slate-100 border-blue-500"
                            : isDark
                            ? "bg-slate-950/40 border-slate-800/80 hover:bg-slate-950/80"
                            : "bg-white/40 border-slate-200 hover:bg-white/90"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold truncate max-w-[190px]">{point.title}</span>
                          <span className={`text-[8px] font-extrabold px-1 rounded-sm uppercase ${
                            statusDetails.status === "Aman"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : statusDetails.status === "Waspada"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                          }`}>
                            {statusDetails.status}
                          </span>
                        </div>
                        <div className={`grid grid-cols-2 gap-1 text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          <span>Kec. {point.location}</span>
                          <span className="text-right">pH: <strong className={isDark ? "text-slate-300" : "text-slate-800"}>{point.ph}</strong></span>
                          <span className="capitalize">{point.type === "bersih" ? "Air Bersih" : "Air Limbah"}</span>
                          <span className="text-right">Pb: <strong className={isDark ? "text-red-400" : "text-red-600"}>{point.pb.toFixed(3)}</strong></span>
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`p-1 rounded border disabled:opacity-30 cursor-pointer ${
                      isDark ? "border-slate-800 hover:bg-slate-800" : "border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-[10px] font-bold">
                    Hal {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-1 rounded border disabled:opacity-30 cursor-pointer ${
                      isDark ? "border-slate-800 hover:bg-slate-800" : "border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </section>

            {/* Instruction tooltip */}
            <div className={`p-2.5 rounded-xl border flex items-start gap-2 backdrop-blur-md text-[10px] text-left transition-all ${
              isDark ? "bg-slate-900/50 border-slate-800/60 text-slate-400" : "bg-white/60 border-slate-200 text-slate-500"
            }`}>
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
              <span><strong>Panduan Lapangan:</strong> Aktifkan mode <strong>"Tambah Titik"</strong> pada peta, lalu klik lokasi mana saja untuk membuat laporan sampel baru.</span>
            </div>

          </div>

          {/* Right Panel: Tabs for Detail Analysis vs Graphs Analitik (z-index 10) */}
          <section className={`w-full md:w-[480px] border rounded-2xl backdrop-blur-xl pointer-events-auto flex flex-col transition-all duration-300 h-full overflow-hidden ${
            isDark ? "bg-slate-900/80 border-slate-800 text-white" : "bg-white/85 border-slate-200 text-slate-900"
          }`}>
            
            {/* Tabs Selector Header */}
            <div className={`flex border-b ${isDark ? "border-slate-850" : "border-slate-200"}`}>
              <button
                onClick={() => setActiveTab("detail")}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === "detail"
                    ? "border-blue-500 text-blue-500 bg-blue-500/5"
                    : `border-transparent ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`
                }`}
              >
                Detail & Foto Sampel
              </button>
              <button
                onClick={() => setActiveTab("analitik")}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === "analitik"
                    ? "border-blue-500 text-blue-500 bg-blue-500/5"
                    : `border-transparent ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`
                }`}
              >
                Grafik & Baku Mutu
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar text-left">
              
              {activeTab === "detail" ? (
                selectedPoint ? (
                  <div className="space-y-4">
                    
                    {/* Header */}
                    <div className={`flex justify-between items-start border-b pb-2.5 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                      <div>
                        <h3 className={`font-bold text-sm leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>{selectedPoint.title}</h3>
                        <div className={`flex items-center gap-1.5 text-[10px] mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          <MapPin size={11} />
                          <span>Kecamatan {selectedPoint.location}</span>
                          <span className="mx-1">•</span>
                          <Clock size={11} />
                          <span>{selectedPoint.datetime}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedPoint(null)}
                        className={`p-1 rounded-full transition-colors cursor-pointer ${
                          isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-200 text-slate-500"
                        }`}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Image & Status Tag */}
                    <div className={`relative rounded-xl overflow-hidden border ${
                      isDark ? "border-slate-800 bg-slate-950/80" : "border-slate-200 bg-slate-100"
                    }`}>
                      <img
                        src={selectedPoint.photo}
                        alt={selectedPoint.title}
                        className="w-full h-32 object-cover opacity-80"
                      />
                      
                      {/* Floating status flag */}
                      <div className="absolute top-3 right-3">
                        {(() => {
                          const statusDetails = checkPointStatus(selectedPoint);
                          return (
                            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded border ${
                              statusDetails.status === "Aman"
                                ? "bg-emerald-950/80 text-emerald-400 border-emerald-800"
                                : statusDetails.status === "Waspada"
                                ? "bg-amber-950/80 text-amber-400 border-amber-800"
                                : "bg-rose-950/80 text-rose-400 border-rose-800"
                            }`}>
                              Status: {statusDetails.status}
                            </span>
                          );
                        })()}
                      </div>

                      {/* Type flag */}
                      <div className="absolute bottom-3 left-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded text-white ${
                          selectedPoint.type === "bersih" ? "bg-blue-600/90" : "bg-zinc-800/90 border border-zinc-700"
                        }`}>
                          {selectedPoint.type === "bersih" ? "SAMPEL AIR BERSIH" : "SAMPEL LIMBAH GOT"}
                        </span>
                      </div>
                    </div>

                    {/* Parameters Table comparison to Baku Mutu */}
                    <div>
                      <h4 className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}>
                        Parameter Analisis Laboratorium (vs Baku Mutu)
                      </h4>
                      
                      <div className={`border rounded-lg overflow-hidden ${
                        isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-200 bg-slate-50"
                      }`}>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className={`border-b text-[10px] ${
                              isDark ? "bg-slate-950/80 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"
                            }`}>
                              <th className="py-2 px-3 text-left">Parameter</th>
                              <th className="py-2 px-3 text-right">Hasil Ukur</th>
                              <th className="py-2 px-3 text-right">Ambang Batas</th>
                              <th className="py-2 px-3 text-center">Hasil</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isDark ? "divide-slate-800/60" : "divide-slate-200"}`}>
                            {/* pH Row */}
                            {(() => {
                              const standard = selectedPoint.type === "bersih" ? "6.5 - 8.5" : "6.0 - 9.0";
                              const isExceed = selectedPoint.type === "bersih" 
                                ? (selectedPoint.ph < 6.5 || selectedPoint.ph > 8.5)
                                : (selectedPoint.ph < 6.0 || selectedPoint.ph > 9.0);
                              return (
                                <tr>
                                  <td className={`py-2 px-3 font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Derajat Keasaman (pH)</td>
                                  <td className={`py-2 px-3 text-right font-mono font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{selectedPoint.ph}</td>
                                  <td className={`py-2 px-3 text-right font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>{standard}</td>
                                  <td className="py-2 px-3 text-center">
                                    <span className={`inline-block w-2 h-2 rounded-full ${isExceed ? "bg-red-500" : "bg-emerald-500"}`}></span>
                                  </td>
                                </tr>
                              );
                            })()}

                            {/* Pb Row */}
                            {(() => {
                              const standard = selectedPoint.type === "bersih" ? "0.03 mg/L" : "0.10 mg/L";
                              const limitVal = selectedPoint.type === "bersih" ? 0.03 : 0.10;
                              const isExceed = selectedPoint.pb > limitVal;
                              return (
                                <tr>
                                  <td className={`py-2 px-3 font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Timbal (Pb)</td>
                                  <td className={`py-2 px-3 text-right font-mono font-bold ${isExceed ? "text-rose-500" : isDark ? "text-white" : "text-slate-900"}`}>{selectedPoint.pb.toFixed(3)} mg/L</td>
                                  <td className={`py-2 px-3 text-right font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>{standard}</td>
                                  <td className="py-2 px-3 text-center">
                                    <span className={`inline-block w-2 h-2 rounded-full ${isExceed ? "bg-red-500" : "bg-emerald-500"}`}></span>
                                  </td>
                                </tr>
                              );
                            })()}

                            {/* Kekeruhan Row */}
                            {(() => {
                              const limitVal = selectedPoint.type === "bersih" ? 25 : 50;
                              const isExceed = selectedPoint.turbidity > limitVal;
                              return (
                                <tr>
                                  <td className={`py-2 px-3 font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Kekeruhan</td>
                                  <td className={`py-2 px-3 text-right font-mono ${isDark ? "text-white" : "text-slate-900"}`}>{selectedPoint.turbidity} NTU</td>
                                  <td className={`py-2 px-3 text-right font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>≤ {limitVal} NTU</td>
                                  <td className="py-2 px-3 text-center">
                                    <span className={`inline-block w-2 h-2 rounded-full ${isExceed ? "bg-red-500" : "bg-emerald-500"}`}></span>
                                  </td>
                                </tr>
                              );
                            })()}

                            {/* BOD Row */}
                            {(() => {
                              const limitVal = selectedPoint.type === "bersih" ? 3 : 30;
                              const isExceed = selectedPoint.bod > limitVal;
                              return (
                                <tr>
                                  <td className={`py-2 px-3 font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>BOD</td>
                                  <td className={`py-2 px-3 text-right font-mono ${isDark ? "text-white" : "text-slate-900"}`}>{selectedPoint.bod} mg/L</td>
                                  <td className={`py-2 px-3 text-right font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>≤ {limitVal} mg/L</td>
                                  <td className="py-2 px-3 text-center">
                                    <span className={`inline-block w-2 h-2 rounded-full ${isExceed ? "bg-red-500" : "bg-emerald-500"}`}></span>
                                  </td>
                                </tr>
                              );
                            })()}

                            {/* COD Row */}
                            {(() => {
                              const limitVal = selectedPoint.type === "bersih" ? 10 : 100;
                              const isExceed = selectedPoint.cod > limitVal;
                              return (
                                <tr>
                                  <td className={`py-2 px-3 font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>COD</td>
                                  <td className={`py-2 px-3 text-right font-mono ${isDark ? "text-white" : "text-slate-900"}`}>{selectedPoint.cod} mg/L</td>
                                  <td className={`py-2 px-3 text-right font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>≤ {limitVal} mg/L</td>
                                  <td className="py-2 px-3 text-center">
                                    <span className={`inline-block w-2 h-2 rounded-full ${isExceed ? "bg-red-500" : "bg-emerald-500"}`}></span>
                                  </td>
                                </tr>
                              );
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Exceeded alert if any */}
                    {(() => {
                      const statusDetails = checkPointStatus(selectedPoint);
                      if (!statusDetails.isExceeding) return null;
                      return (
                        <div className={`p-3 border rounded-xl text-left ${
                          isDark ? "bg-red-950/30 border-red-900/40 text-red-300" : "bg-red-50 border-red-200 text-red-800"
                        }`}>
                          <span className={`text-[10px] font-bold block mb-1 uppercase tracking-wide ${
                            isDark ? "text-red-400" : "text-red-600"
                          }`}>
                            ⚠️ PARAMETER MELEBIHI BAKU MUTU
                          </span>
                          <p className="text-[11px] leading-normal">
                            Sampel air ini melebihi standar kelayakan pada parameter: <strong>{statusDetails.exceededParams.join(", ")}</strong>. Rekomendasi tindakan: Lakukan isolasi kawasan drainase got dan verifikasi residu zat kimia.
                          </p>
                        </div>
                      );
                    })()}

                    {/* Reporter details footer */}
                    <div className={`flex justify-between items-center text-[10px] pt-1 border-t ${
                      isDark ? "text-slate-500 border-slate-800/50" : "text-slate-500 border-slate-200"
                    }`}>
                      <span>Diuji oleh: <strong>{selectedPoint.reporter}</strong></span>
                      <span>Suhu Sampel: {selectedPoint.temp}°C</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <MapPin className="w-10 h-10 text-blue-500/25 mb-3" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Pilih Titik Sampel
                    </h3>
                    <p className="text-[11px] max-w-[280px]">
                      Silakan pilih salah satu marker pada peta atau klik baris di daftar titik pantau untuk memunculkan detail data di sini.
                    </p>
                  </div>
                )
              ) : (
                /* Tab Analitik & Grafik (SVG Premium) */
                <div className="space-y-6">
                  
                  {/* Summary analytics card */}
                  <div className={`p-4 rounded-xl border ${
                    isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}>
                    <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                      Kepatuhan Baku Mutu (Air Bersih vs Limbah)
                    </h3>
                    <div className="flex justify-around items-center text-center my-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Air Bersih</span>
                        <div className="flex gap-2.5 mt-1 items-baseline">
                          <span className="text-base font-bold text-emerald-400">{barChartData.cAman} <span className="text-[9px] text-slate-500">Aman</span></span>
                          <span className="text-base font-bold text-rose-500">{barChartData.cExceed} <span className="text-[9px] text-slate-500">Luar</span></span>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-slate-800"></div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Limbah Got</span>
                        <div className="flex gap-2.5 mt-1 items-baseline">
                          <span className="text-base font-bold text-emerald-400">{barChartData.lAman} <span className="text-[9px] text-slate-500">Aman</span></span>
                          <span className="text-base font-bold text-rose-500">{barChartData.lExceed} <span className="text-[9px] text-slate-500">Luar</span></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SVG Bar Chart 1 - Baku Mutu Compliance */}
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 text-left">
                      GRAFIK 1: PERBANDINGAN STATUS KELAYAKAN PARAMETER
                    </h4>
                    
                    <div className={`w-full flex justify-center p-4 border rounded-xl ${
                      isDark ? "bg-slate-950/50 border-slate-800/80" : "bg-white border-slate-200"
                    }`}>
                      <svg width="340" height="150" viewBox="0 0 340 150" className="overflow-visible font-mono text-[9px]">
                        {/* Horizontal guide lines */}
                        <line x1="40" y1="20" x2="320" y2="20" stroke={isDark ? "#1e293b" : "#e2e8f0"} strokeWidth="1" strokeDasharray="2 2" />
                        <line x1="40" y1="60" x2="320" y2="60" stroke={isDark ? "#1e293b" : "#e2e8f0"} strokeWidth="1" strokeDasharray="2 2" />
                        <line x1="40" y1="100" x2="320" y2="100" stroke={isDark ? "#1e293b" : "#e2e8f0"} strokeWidth="1" strokeDasharray="2 2" />
                        
                        {/* Axis */}
                        <line x1="40" y1="110" x2="320" y2="110" stroke={isDark ? "#475569" : "#cbd5e1"} strokeWidth="1" />
                        <line x1="40" y1="10" x2="40" y2="110" stroke={isDark ? "#475569" : "#cbd5e1"} strokeWidth="1" />
                        
                        {/* Left Y Labels */}
                        <text x="32" y="23" fill={isDark ? "#64748b" : "#475569"} textAnchor="end">Banyak</text>
                        <text x="32" y="63" fill={isDark ? "#64748b" : "#475569"} textAnchor="end">Sedang</text>
                        <text x="32" y="103" fill={isDark ? "#64748b" : "#475569"} textAnchor="end">Sedikit</text>
 
                        {/* Bars for Air Bersih */}
                        {/* Safe Bar */}
                        {(() => {
                          const h = Math.min(80, barChartData.cAman * 6);
                          const y = 110 - h;
                          return (
                            <rect x="75" y={y} width="22" height={h} rx="2" fill="#10b981" />
                          );
                        })()}
                        {/* Exceed Bar */}
                        {(() => {
                          const h = Math.min(80, barChartData.cExceed * 6);
                          const y = 110 - h;
                          return (
                            <rect x="105" y={y} width="22" height={h} rx="2" fill="#f43f5e" />
                          );
                        })()}
 
                        {/* Bars for Air Limbah */}
                        {/* Safe Bar */}
                        {(() => {
                          const h = Math.min(80, barChartData.lAman * 6);
                          const y = 110 - h;
                          return (
                            <rect x="200" y={y} width="22" height={h} rx="2" fill="#059669" />
                          );
                        })()}
                        {/* Exceed Bar */}
                        {(() => {
                          const h = Math.min(80, barChartData.lExceed * 6);
                          const y = 110 - h;
                          return (
                            <rect x="230" y={y} width="22" height={h} rx="2" fill="#e11d48" />
                          );
                        })()}
 
                        {/* Legend under chart */}
                        <text x="100" y="125" fill={isDark ? "#94a3b8" : "#475569"} textAnchor="middle" className="font-bold">Air Bersih</text>
                        <text x="226" y="125" fill={isDark ? "#94a3b8" : "#475569"} textAnchor="middle" className="font-bold">Limbah Got</text>
 
                        {/* Legend colors */}
                        <rect x="70" y="136" width="8" height="8" rx="1" fill="#10b981" />
                        <text x="83" y="143" fill={isDark ? "#64748b" : "#475569"}>Aman</text>
                        
                        <rect x="180" y="136" width="8" height="8" rx="1" fill="#f43f5e" />
                        <text x="193" y="143" fill={isDark ? "#64748b" : "#475569"}>Luar Baku Mutu</text>
                      </svg>
                    </div>
                  </div>
 
                  {/* SVG Chart 2 - Pb Lead Concentration (Got Wastewater) */}
                  {pbChartData.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 text-left">
                        GRAFIK 2: KONSENTRASI TIMBAL (PB) LIMBAH GOT
                      </h4>
                      <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">
                        Grafik di bawah memetakan sampel got terbaru. Garis merah putus-putus menunjukkan batas kelayakan bahaya Timbal (0.10 mg/L).
                      </p>
 
                      <div className={`w-full flex justify-center p-4 border rounded-xl ${
                        isDark ? "bg-slate-950/50 border-slate-800/80" : "bg-white border-slate-200"
                      }`}>
                        <svg width="340" height="150" viewBox="0 0 340 150" className="overflow-visible font-mono text-[9px]">
                          {/* Y guide lines */}
                          <line x1="40" y1="20" x2="320" y2="20" stroke={isDark ? "#1e293b" : "#e2e8f0"} strokeWidth="1" />
                          <line x1="40" y1="70" x2="320" y2="70" stroke={isDark ? "#1e293b" : "#e2e8f0"} strokeWidth="1" />
                          <line x1="40" y1="120" x2="320" y2="120" stroke={isDark ? "#1e293b" : "#e2e8f0"} strokeWidth="1" />
 
                          {/* Red Dashed Limit line for Pb (0.10 mg/L corresponds to y=70) */}
                          <line x1="40" y1="70" x2="320" y2="70" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
                          <text x="325" y="73" fill="#ef4444" className="font-bold">Limit Pb (0.10)</text>
 
                          {/* Left Y Labels */}
                          <text x="32" y="23" fill={isDark ? "#64748b" : "#475569"} textAnchor="end">0.20 mg/L</text>
                          <text x="32" y="73" fill={isDark ? "#64748b" : "#475569"} textAnchor="end">0.10 mg/L</text>
                          <text x="32" y="123" fill={isDark ? "#64748b" : "#475569"} textAnchor="end">0.00</text>
 
                          {/* Polyline path for values */}
                          {(() => {
                            const stepX = 260 / (pbChartData.length - 1 || 1);
                            const pointsStr = pbChartData
                              .map((d, index) => {
                                const posX = 40 + index * stepX;
                                // 0.20 Pb -> y=20, 0.00 Pb -> y=120
                                const posY = 120 - (d.value / 0.20) * 100;
                                return `${posX},${posY}`;
                              })
                              .join(" ");
                            return (
                              <>
                                <polyline
                                  fill="none"
                                  stroke="#3b82f6"
                                  strokeWidth="2"
                                  points={pointsStr}
                                />
                                {/* Value dots overlay */}
                                {pbChartData.map((d, index) => {
                                  const posX = 40 + index * stepX;
                                  const posY = 120 - (d.value / 0.20) * 100;
                                  return (
                                    <g key={`dot-${index}`}>
                                      <circle
                                        cx={posX}
                                        cy={posY}
                                        r="3.5"
                                        fill={d.isExceeded ? "#ef4444" : "#10b981"}
                                      />
                                      <text
                                        x={posX}
                                        y={posY - 7}
                                        fill={isDark ? "#94a3b8" : "#475569"}
                                        textAnchor="middle"
                                        className="text-[8px]"
                                      >
                                        {d.value.toFixed(3)}
                                      </text>
                                    </g>
                                  );
                                })}
                              </>
                            );
                          })()}
                          
                          {/* Bottom X-axis titles */}
                          <line x1="40" y1="120" x2="320" y2="120" stroke={isDark ? "#475569" : "#cbd5e1"} strokeWidth="1" />
                          {pbChartData.map((d, index) => {
                            const stepX = 260 / (pbChartData.length - 1 || 1);
                            const posX = 40 + index * stepX;
                            return (
                              <text
                                key={`label-${index}`}
                                x={posX}
                                y="134"
                                fill={isDark ? "#64748b" : "#475569"}
                                textAnchor="middle"
                                className="text-[8px]"
                              >
                                pt.{index + 1}
                              </text>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  )}
 
                  {/* pH Distribution visual status bars */}
                  <div className={`p-4 rounded-xl border text-xs ${
                    isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                      PETA SEBARAN DERAJAT KEASAMAN (pH)
                    </h4>
                    
                    <div className="space-y-2.5">
                      {/* Asam bar */}
                      <div className="flex items-center text-[11px]">
                        <span className="text-slate-400 w-28 flex-shrink-0 text-left">Asam (&lt; 6.5)</span>
                        <div className={`flex-1 rounded-full h-2 overflow-hidden border mx-2 ${
                          isDark ? "bg-slate-950 border-slate-800" : "bg-slate-200 border-slate-300"
                        }`}>
                          <div 
                            className="bg-amber-500 h-full rounded-full" 
                            style={{ width: `${(phDistribution.acid / (stats.total || 1)) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-bold w-12 text-right flex-shrink-0">{phDistribution.acid} titik</span>
                      </div>
 
                      {/* Normal bar */}
                      <div className="flex items-center text-[11px]">
                        <span className="text-slate-400 w-28 flex-shrink-0 text-left">Normal (6.5 - 8.5)</span>
                        <div className={`flex-1 rounded-full h-2 overflow-hidden border mx-2 ${
                          isDark ? "bg-slate-950 border-slate-800" : "bg-slate-200 border-slate-300"
                        }`}>
                          <div 
                            className="bg-emerald-500 h-full rounded-full" 
                            style={{ width: `${(phDistribution.normal / (stats.total || 1)) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-bold w-12 text-right flex-shrink-0">{phDistribution.normal} titik</span>
                      </div>
 
                      {/* Basa bar */}
                      <div className="flex items-center text-[11px]">
                        <span className="text-slate-400 w-28 flex-shrink-0 text-left">Basa (&gt; 8.5)</span>
                        <div className={`flex-1 rounded-full h-2 overflow-hidden border mx-2 ${
                          isDark ? "bg-slate-950 border-slate-800" : "bg-slate-200 border-slate-300"
                        }`}>
                          <div 
                            className="bg-violet-500 h-full rounded-full" 
                            style={{ width: `${(phDistribution.alkaline / (stats.total || 1)) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-bold w-12 text-right flex-shrink-0">{phDistribution.alkaline} titik</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </section>

        </div>

      </div>

    </div>
  );
}

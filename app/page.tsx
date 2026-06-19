"use client";

import Link from "next/link";
import { Droplet, ArrowRight, Activity, ShieldCheck, BarChart3 } from "lucide-react";
import HeroWave from "@/components/ui/dynamic-wave-canvas-background";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 relative bg-slate-950">

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        {/* Logo */}
        <div className="flex items-center gap-2 font-raleway font-bold text-xl text-white">
          <Droplet className="text-blue-500" /> Pejuang Sungai
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#fitur" className="hover:text-white transition-colors">Fitur</Link>
          <Link href="#tentang" className="hover:text-white transition-colors">Tentang Kami</Link>
          <Link href="#kontak" className="hover:text-white transition-colors">Kontak</Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="px-5 py-2 text-sm font-semibold text-white border border-slate-600 hover:bg-slate-800 rounded-sm transition-colors shadow-sm">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">

        <div className="z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Kiri: Teks dan CTA */}
          <div className="space-y-2 text-left">


            <h1 className="text-4xl md:text-6xl lg:text-6xl font-extrabold text-white tracking-tight font-raleway leading-tight">
              Jaga Kualitas Air <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Untuk Masa Depan</span>
            </h1>

            <p className="md:text-  lg text-slate-400 max-w-xl leading-relaxed">
              Pejuang Sungai adalah platform pemantauan kualitas air real-time. Laporkan titik pencemaran, analisis data, dan berkontribusi untuk pelestarian lingkungan perairan kita.
            </p>

            <div className="pt-8 flex flex-col sm:flex-row items-center sm:justify-start gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-4   border border-white text-white rounded-sm  text-md transition-transform  flex items-center justify-center gap-2  hover:shadow-blue-500/25"
              >
                Buka Dashboard <ArrowRight size={20} />
              </Link>
            </div>
          </div>

          {/* Kanan: Gambar Hero */}
          <div className="relative z-10 hidden lg:block perspective-1000">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 transform transition-transform hover:scale-[1.02] hover:rotate-y-2 duration-500">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent mix-blend-overlay z-10 pointer-events-none"></div>
              <img
                src="/hero-picture.png"
                alt="Platform Pejuang Sungai"
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Decorative Glow */}
            <div className="absolute -inset-4 bg-blue-500/20 blur-3xl -z-10 rounded-full"></div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl z-10 text-left">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-1">
            <div className="bg-blue-900/50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-blue-400">
              <Activity size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Real-time Monitoring</h3>
            <p className="text-slate-400">Pantau data kualitas air seperti pH, suhu, dan kekeruhan secara langsung dari berbagai titik sampel.</p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-1">
            <div className="bg-green-900/50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-green-400">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Validasi Data</h3>
            <p className="text-slate-400">Setiap laporan diverifikasi untuk memastikan akurasi data sebelum dipublikasikan ke publik.</p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-1">
            <div className="bg-purple-900/50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-purple-400">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Laporan & Analitik</h3>
            <p className="text-slate-400">Unduh laporan lengkap dalam format PDF dan lihat tren kualitas air dari waktu ke waktu.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

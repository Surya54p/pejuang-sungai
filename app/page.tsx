"use client";
 
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplet, Lock, Mail, AlertCircle, ArrowRight, User as UserIcon } from "lucide-react";
 
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@pejuangsungai.go.id");
  const [password, setPassword] = useState("admin123");
  const [name, setName] = useState("");
  const [isGuest, setIsGuest] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
 
    if (isGuest) {
      if (!name.trim()) {
        setError("Nama tidak boleh kosong.");
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/guests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: name.trim() }),
        });
        if (!res.ok) {
          setError("Gagal mendaftarkan tamu ke database.");
          setIsLoading(false);
          return;
        }
        localStorage.setItem("userName", name.trim());
        localStorage.setItem("userRole", "tamu");
        router.push("/dashboard");
      } catch (err) {
        setError("Gagal terhubung ke server.");
        setIsLoading(false);
      }
    } else {
      setTimeout(() => {
        if (email === "admin@pejuangsungai.go.id" && password === "admin123") {
          localStorage.setItem("userName", "Admin Dinas LH");
          localStorage.setItem("userRole", "admin");
          router.push("/dashboard");
        } else {
          setError("Email atau password yang Anda masukkan salah.");
          setIsLoading(false);
        }
      }, 800);
    }
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center font-sans relative bg-slate-950 text-white overflow-hidden">
      {/* Indonesia Map SVG Background */}
      <div className="absolute inset-0 z-0 opacity-[0.08] flex items-center justify-center pointer-events-none select-none p-4">
        <img 
          src="/indonesiaHigh.svg" 
          alt="Peta Indonesia" 
          className="w-full max-h-[85vh] object-contain"
        />
      </div>
 
      {/* Decorative colored glow overlays (no shadows) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
 
      {/* Main Container - Card Login */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 flex flex-col items-center">
          {/* Logo & Header */}
          <div className="flex items-center gap-2.5 font-raleway font-bold text-2xl mb-2 text-white">
            <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30">
              <Droplet className="text-blue-400 w-6 h-6" />
            </div>
            <span>Pejuang Sungai</span>
          </div>
          <p className="text-slate-400 text-sm text-center mb-8 font-medium">
            Portal Monitoring Kualitas Air Khusus Instansi Lingkungan Hidup
          </p>
 
          <form onSubmit={handleLogin} className="w-full space-y-5">
            {error && (
              <div className="p-3.5 bg-red-950/40 border border-red-800/50 rounded-lg flex items-start gap-2.5 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
 
            {isGuest ? (
              /* Guest Name Input Field */
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Nama Lengkap Tamu
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <UserIcon className="w-4.5 h-4.5" />
                  </span>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all"
                    placeholder="Masukkan nama Anda..."
                  />
                </div>
              </div>
            ) : (
              /* Admin credentials fields */
              <>
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Email Instansi
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <Mail className="w-4.5 h-4.5" />
                    </span>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all"
                      placeholder="admin@pejuangsungai.go.id"
                    />
                  </div>
                </div>
 
                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <Lock className="w-4.5 h-4.5" />
                    </span>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </>
            )}
 
            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer transition-all border border-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? "Memvalidasi..." : (
                <>
                  {isGuest ? "Masuk sebagai Tamu" : "Masuk sebagai Admin"} <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>
 
          {/* Quick Toggle to Admin/Guest Login */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 w-full text-center flex flex-col items-center justify-center gap-2.5">
            {isGuest ? (
              <>
                <span className="text-[11px] text-slate-500">INGIN MASUK SEBAGAI ADMIN INSTANSI?</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsGuest(false);
                    setError("");
                  }}
                  className="px-4 py-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors border border-slate-800 hover:border-slate-700 bg-slate-950/30 hover:bg-slate-950/60 rounded-lg cursor-pointer"
                >
                  Masuk sebagai Admin
                </button>
              </>
            ) : (
              <>
                <span className="text-[11px] text-slate-500">INGIN MASUK SEBAGAI GUEST/TAMU?</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsGuest(true);
                    setError("");
                  }}
                  className="px-4 py-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors border border-slate-800 hover:border-slate-700 bg-slate-950/30 hover:bg-slate-950/60 rounded-lg cursor-pointer"
                >
                  Masuk sebagai Tamu
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

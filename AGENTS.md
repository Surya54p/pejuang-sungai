<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Context
Proyek ini adalah platform pembuat form dinamis bergaya SaaS. Pengguna dapat membuat form kustom, mempublikasikannya di halaman profil publik mereka, dan mengelola hasil input melalui dasbor respons.

# Tech Stack Utama
- Framework: Next.js (App Router)
- Runtime & Package Manager: Bun 
- Frontend: React TSX
- Styling: Tailwind CSS

# AI Agent Rules (CRITICAL INSTRUCTIONS)
Setiap kali melakukan analisis, modifikasi, atau pembuatan kode baru, patuhi aturan berikut:

Hanya gunakan perintah `bun` (seperti `bun install`, `bun add`, `bun run dev`). Jangan pernah menggunakan atau menyarankan perintah `npm`, `yarn`, atau `pnpm` karena repositori ini menggunakan `bun.lock`.

Selalu tulis dan format komponen antarmuka menggunakan React TSX murni. Prioritaskan pembuatan komponen fungsional dengan ekstensi `.tsx` dan hindari penggunaan TypeScript/TSX untuk logika UI kecuali diinstruksikan lain.

Pisahkan logika aplikasi yang kompleks (seperti fitur *dynamic form builder*) dari komponen antarmuka visual. Gunakan penamaan fungsi dan variabel yang deskriptif.

Berikan solusi yang paling sederhana dan langsung menjawab masalah. Tulis kode yang bersih, efisien, dan siap dirender dengan cepat.

aturan styling frontend:
dilarang selalu untuk menggunakan: shadow

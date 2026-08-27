# Project Tracker — PT Bening Khatulistiwa

Dashboard web yang sinkron dua arah dengan spreadsheet **"Project Tracker_PT Bening Khatulistiwa"**.
Isi/edit lewat web → langsung masuk ke sheet. Edit langsung di sheet → langsung kebaca web
(karena keduanya baca-tulis ke sheet yang sama secara real-time, bukan database terpisah).

100% gratis: Google Apps Script (backend) + Next.js di Vercel (frontend).

---

## Bagian 1 — Deploy backend (Google Apps Script)

1. Buka spreadsheet **Project Tracker_PT Bening Khatulistiwa** di Google Sheets.
2. Klik menu **Extensions > Apps Script**.
3. Hapus kode default di `Code.gs`, lalu copy-paste seluruh isi file `apps-script/Code.gs`
   dari folder ini ke sana.
4. Klik **Save** (ikon disket).
5. Klik **Deploy > New deployment**.
   - Klik ikon gear di samping "Select type" → pilih **Web app**.
   - **Execute as**: Me (akun kamu)
   - **Who has access**: Anyone
   - Klik **Deploy**.
6. Google akan minta izin akses ke spreadsheet kamu — klik **Authorize**, pilih akun kamu,
   lalu klik **Advanced > Go to (nama project) (unsafe)** kalau muncul warning (ini normal
   untuk script buatan sendiri), lalu **Allow**.
7. Copy **Web app URL** yang muncul (bentuknya `https://script.google.com/macros/s/.../exec`).
   Simpan URL ini — akan dipakai di Bagian 2.

> Catatan: setiap kali kamu **mengubah isi Code.gs**, kamu harus buat deployment baru lagi
> (Deploy > Manage deployments > edit/New deployment) supaya perubahan ke-apply.

---

## Bagian 2 — Jalankan frontend di komputer kamu (opsional, untuk coba dulu)

Butuh [Node.js](https://nodejs.org) terinstall.

```bash
cd project-tracker-web
npm install
cp .env.local.example .env.local
```

Buka `.env.local`, isi:
```
NEXT_PUBLIC_API_URL=https://script.google.com/macros/s/XXXXX/exec
```
(pakai URL dari Bagian 1)

Jalankan:
```bash
npm run dev
```
Buka `http://localhost:3000` — dashboard kamu sudah bisa dites lokal.

---

## Bagian 3 — Deploy gratis ke internet (Vercel)

1. Buat akun gratis di [github.com](https://github.com) kalau belum punya.
2. Buat repository baru (misal `project-tracker-web`), lalu push folder ini:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/project-tracker-web.git
   git push -u origin main
   ```
3. Buat akun gratis di [vercel.com](https://vercel.com) — bisa langsung login pakai akun GitHub.
4. Klik **Add New > Project**, pilih repository `project-tracker-web` yang barusan kamu push.
5. Sebelum klik Deploy, buka bagian **Environment Variables**, tambahkan:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: URL Web App dari Bagian 1
6. Klik **Deploy**. Tunggu 1-2 menit — Vercel akan kasih kamu URL publik gratis
   (misal `project-tracker-web.vercel.app`) yang bisa diakses siapa saja/tim kamu.
7. Setiap kali kamu `git push` update kode, Vercel otomatis deploy ulang — gratis, tanpa batas.

---

## Struktur & cara kerja

- **`apps-script/Code.gs`** — API yang baca/tulis langsung ke sheet "Project Tracker" dan
  "Engineering Deliverables Checklist". Progress stage dihitung otomatis dari "Current Stage"
  memakai tabel bobot yang sama seperti di spreadsheet kamu (PO 5% ... Hand Over 100%).
- **Progress checklist teknik** (BOM, P&ID, EWD, GAD, dll) dihitung dari rata-rata status
  tiap item (Not Started=0%, Drafting=30%, Under Review=70%, Completed=100%), lalu otomatis
  ditulis balik ke kolom "Engineering Doc Progress (%)" di Project Tracker. Kalau perhitungan
  ini beda dari rumus asli kamu, tinggal ubah angka di `CHECKLIST_WEIGHTS` dalam `Code.gs`.
- **Menambah project baru** lewat web otomatis menambah baris di kedua sheet sekaligus
  (Project Tracker + Engineering Deliverables Checklist) dengan PO Number yang sama, supaya
  keduanya tetap nyambung.
- Halaman **`/`** = dashboard ringkasan, **`/projects`** = daftar semua project (bisa dicari),
  **`/projects/new`** = tambah project, **`/projects/[po]`** = detail + update stage & checklist.

## Kalau nama sheet kamu berubah
Buka `apps-script/Code.gs`, ubah dua baris di paling atas:
```js
const SHEET_PROJECTS = 'Project Tracker';
const SHEET_CHECKLIST = 'Engineering Deliverables Checklist';
```
supaya sesuai nama tab persis di spreadsheet kamu, lalu deploy ulang.

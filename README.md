# 🏭 Sistem Informasi Lemburan - PT PERTAMINA SHOREBASE TANJUNG BATU

[![React](https://img.shields.io/badge/React-19.2.0-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7.3.1-purple?logo=vite)](https://vite.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com)

Sistem informasi berbasis web untuk mengelola lemburan karyawan, absensi, dan pelaporan di PT Pertamina Shorebase Tanjung Batu. Dibangun dengan metode **Agile Development** dalam 1 sprint (1 minggu).

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi Stack](#-teknologi-stack)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Instalasi & Setup](#-instalasi--setup)
- [Struktur Database](#-struktur-database)
- [Panduan Penggunaan](#-panduan-penggunaan)
- [API Documentation](#-api-documentation)
- [Struktur Folder](#-struktur-folder)
- [Development](#-development)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Changelog](#-changelog)
- [Lisensi](#-lisensi)

---

## ✨ Fitur Utama

### 🔐 Authentication & Security
- Login authentication dengan Supabase Auth
- Row Level Security (RLS) pada semua tabel
- Protected routes untuk halaman sensitif
- Session management dengan Zustand store

### 👥 Master Data Management
- **Karyawan CRUD** - Kelola data karyawan (NIK, nama, jabatan, departemen, no HP, status aktif)
- **Shift Management** - Konfigurasi shift kerja (DS/Day Shift, NS/Night Shift, OFF)
- **Jadwal Shift** - Assign periode shift ke karyawan per tanggal

### 📅 Attendance Management
- **Presensi Harian** - Input dan monitoring absensi harian dengan status:
  - DS (Day Shift)
  - NS (Night Shift)
  - OFF (Libur)
  - S (Sakit)
  - I (Izin)
  - A (Alpha)
- **Auto-Generate Absensi** - PostgreSQL function untuk generate absensi otomatis berdasarkan jadwal shift
- **Kalender Absensi** - View absensi dalam format kalender bulanan
- **Notification System** - Notifikasi "X karyawan belum diubah" untuk tracking

### 📝 Overtime Request (SKPL)
- **Multi-Karyawan SKPL** - Buat 1 SKPL untuk multiple karyawan sekaligus
- **Form SKPL** - Input permohonan lemburan dengan detail:
  - Tanggal & jam lembur
  - Total jam (auto-calculated)
  - Aktivitas/pekerjaan
  - Lokasi & keterangan
- **Approval Workflow** - Admin dapat approve/reject SKPL
- **Print Template** - Generate SKPL sesuai format resmi Pertamina dengan logo
- **60 Jam Limit** - Business rule: maksimal 60 jam lembur per bulan per karyawan

### 📊 Dashboard & Reporting
- **Dashboard** - KPI dan summary:
  - Total karyawan aktif
  - Kehadiran hari ini
  - SKPL pending approval
  - Chart statistik
- **Laporan Bulanan** - Rekapitulasi lemburan per karyawan
- **Export Excel** - Download laporan dalam format XLSX
- **Filter & Search** - Advanced filtering by date range, karyawan, status

---

## 🛠️ Teknologi Stack

| Kategori | Teknologi | Versi |
|----------|-----------|-------|
| **Frontend Framework** | React | 19.2.0 |
| **Language** | TypeScript | 5.9.3 |
| **Build Tool** | Vite | 7.3.1 |
| **Database** | PostgreSQL (Supabase) | Latest |
| **State Management** | Zustand | 5.0.11 |
| **Routing** | React Router DOM | 7.13.0 |
| **UI Icons** | Lucide React | 0.574.0 |
| **Charts** | Recharts | 3.7.0 |
| **Date Utils** | date-fns | 4.1.0 |
| **Table** | TanStack Table | 8.21.3 |
| **Excel Export** | XLSX | 0.18.5 |
| **Linting** | ESLint + typescript-eslint | 9.39.1 |

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React 19 + TypeScript + Vite                        │   │
│  │  - Components (UI, Layout, Pages)                    │   │
│  │  - Zustand Store (State Management)                  │   │
│  │  - React Router (Navigation)                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Supabase Backend-as-a-Service                       │   │
│  │  - PostgreSQL Database                               │   │
│  │  - Row Level Security (RLS)                          │   │
│  │  - REST API + Real-time                              │   │
│  │  - Authentication & Authorization                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Karyawan │ │  Shift   │ │ Absensi  │ │ SKPL + SK    │   │
│  │  Table   │ │  Table   │ │  Table   │ │ Tables       │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│                                                             │
│  ┌──────────────────┐ ┌─────────────────────────────────┐   │
│  │ Karyawan_Shift   │ │ Auto-generate Function (PL/pg)  │   │
│  │ Junction Table   │ │ - Generate absensi otomatis     │   │
│  └──────────────────┘ └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Entity Relationship Diagram

```
┌─────────────────┐
│    KARYAWAN     │
├─────────────────┤
│ id (PK, UUID)   │
│ nik (UNIQUE)    │
│ nama            │
│ jabatan         │
│ departemen      │
│ no_hp           │
│ status_aktif    │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │ (1)
         │
      (M)├─────────────────────┬──────────────────┐
         │                     │                  │
         ▼                     ▼                  ▼
    ┌────────────┐      ┌────────────┐      ┌──────────────┐
    │  ABSENSI   │      │ SKPL_      │      │  KARYAWAN_   │
    ├────────────┤      │ KARYAWAN   │      │   SHIFT      │
    │ id (PK)    │      ├────────────┤      ├──────────────┤
    │ id_kar (FK)│      │ id_skpl(FK)│      │ id (PK)      │
    │ tanggal    │      │ id_kar (FK)│      │ id_kar (FK)  │
    │ status     │      │ created_at │      │ id_shift (FK)│
    │ jam_in     │      └────────────┘      │ tgl_mulai    │
    │ jam_out    │            │             │ tgl_selesai  │
    │ created_at │            │             └──────────────┘
    │ updated_at │            ▼
    └────────────┘      ┌────────────┐
                        │    SKPL    │
                        ├────────────┤
                        │ id (PK)    │
                        │ tanggal    │
                        │ jam_mulai  │
                        │ jam_selesai│
                        │ total_jam  │
                        │ aktivitas  │
                        │ lokasi     │
                        │ keterangan │
                        │ status_app │
                        │ created_at │
                        │ updated_at │
                        └────────────┘
```

---

## 📦 Instalasi & Setup

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Supabase Account** (free tier available)

### 1. Clone Repository

```bash
cd E:\IPMS\KP\App-Absen
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

File `.env` sudah tersedia dengan konfigurasi Supabase:

```env
VITE_SUPABASE_URL=https://lqaxmialsblsqdrwecxm.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_HAbHa-Pid8DijcGxv4P5Hw_84GbWlRx
DATABASE_URL=postgresql://postgres:!P3rt4M1n4@@db.uftxasjmopgcierevmga.supabase.co:5432/postgres
```

> ⚠️ **Security Note:** Jangan commit file `.env` ke repository. File ini sudah ada di `.gitignore`.

### 4. Setup Database

Jalankan SQL script di **Supabase SQL Editor**:

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Navigasi ke **SQL Editor**
4. Copy-paste isi file `database/schema.sql`
5. Klik **Run** untuk execute

Script ini akan membuat:
- ✅ 6 tabel (karyawan, shift, karyawan_shift, absensi, skpl, skpl_karyawan)
- ✅ Indexes untuk performa
- ✅ Row Level Security (RLS) policies
- ✅ Foreign key constraints
- ✅ Auto-generate function untuk absensi
- ✅ Sample data (3 karyawan, 3 shift)

### 5. Run Development Server

```bash
npm run dev
```

Server akan berjalan di: **http://localhost:5173**

### 6. Build untuk Production

```bash
npm run build
```

Output akan tersimpan di folder `dist/`.

---

## 🗄️ Struktur Database

### Tabel: `karyawan`

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | UUID | PRIMARY KEY | Auto-generated |
| nik | VARCHAR(20) | UNIQUE, NOT NULL | Nomor Induk Karyawan |
| nama | VARCHAR(100) | NOT NULL | Nama lengkap |
| jabatan | VARCHAR(50) | NOT NULL | Posisi/jabatan |
| departemen | VARCHAR(50) | NOT NULL | Departemen/divisi |
| no_hp | VARCHAR(15) | - | Nomor WhatsApp/HP |
| status_aktif | BOOLEAN | DEFAULT true | Status keaktifan |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Audit trail |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Audit trail |

### Tabel: `shift`

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | UUID | PRIMARY KEY | Auto-generated |
| nama | VARCHAR(50) | UNIQUE, NOT NULL | Nama shift (DS, NS, OFF) |
| jam_mulai | VARCHAR(5) | NOT NULL | Format HH:MM |
| jam_selesai | VARCHAR(5) | NOT NULL | Format HH:MM |
| durasi_jam | INTEGER | NOT NULL | Durasi dalam jam |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Audit trail |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Audit trail |

### Tabel: `karyawan_shift`

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | UUID | PRIMARY KEY | Auto-generated |
| id_karyawan | UUID | FOREIGN KEY → karyawan | Reference ke karyawan |
| id_shift | UUID | FOREIGN KEY → shift | Reference ke shift |
| tanggal_mulai | DATE | NOT NULL | Mulai periode |
| tanggal_selesai | DATE | NOT NULL | Akhir periode |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Audit trail |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Audit trail |

**Constraint:** `tanggal_mulai <= tanggal_selesai`

### Tabel: `absensi`

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | UUID | PRIMARY KEY | Auto-generated |
| id_karyawan | UUID | FOREIGN KEY → karyawan | Reference ke karyawan |
| tanggal | DATE | NOT NULL | Tanggal absensi |
| status | VARCHAR(20) | NOT NULL | DS/NS/OFF/S/I/A |
| jam_in | VARCHAR(5) | - | Jam masuk (HH:MM) |
| jam_out | VARCHAR(5) | - | Jam pulang (HH:MM) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Audit trail |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Audit trail |

**Unique Constraint:** `(id_karyawan, tanggal)` - 1 karyawan hanya 1 absensi per hari

### Tabel: `skpl` (Surat Permohonan Kerja Lemburan)

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | UUID | PRIMARY KEY | Auto-generated |
| tanggal | DATE | NOT NULL | Tanggal lembur |
| jam_mulai | VARCHAR(5) | NOT NULL | Format HH:MM |
| jam_selesai | VARCHAR(5) | NOT NULL | Format HH:MM |
| total_jam | FLOAT | NOT NULL | Total durasi |
| aktivitas | TEXT | NOT NULL | Deskripsi pekerjaan |
| lokasi | VARCHAR(255) | - | Lokasi lembur |
| keterangan | TEXT | - | Keterangan tambahan |
| status_approval | VARCHAR(20) | DEFAULT 'pending' | pending/approved/rejected |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Audit trail |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Audit trail |

### Tabel: `skpl_karyawan` (Junction Table)

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | UUID | PRIMARY KEY | Auto-generated |
| id_skpl | UUID | FOREIGN KEY → skpl | Reference ke SKPL |
| id_karyawan | UUID | FOREIGN KEY → karyawan | Reference ke karyawan |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Audit trail |

**Unique Constraint:** `(id_skpl, id_karyawan)` - Prevent duplicate entries

### PostgreSQL Function: `generate_absensi_otomatis()`

Function ini generate absensi otomatis berdasarkan jadwal shift karyawan.

```sql
-- Usage
SELECT generate_absensi_otomatis('2026-03-10');

-- Default: generate untuk besok
SELECT generate_absensi_otomatis();
```

**Logic:**
1. Query semua karyawan aktif dengan shift period yang valid untuk tanggal target
2. Map shift name ke status code (Shift Pagi → DS, Shift Malam → NS, OFF → OFF)
3. Insert ke tabel `absensi` dengan `ON CONFLICT DO NOTHING`
4. Return JSON dengan summary hasil generate

---

## 📖 Panduan Penggunaan

### 1. Login

- URL: `http://localhost:5173/login`
- Sistem menggunakan Supabase authentication
- Session disimpan di Zustand store

### 2. Dashboard

Menu utama menampilkan:
- **Total Karyawan Aktif** - Jumlah karyawan dengan status_aktif = true
- **Kehadiran Hari Ini** - Count absensi dengan status != OFF
- **SKPL Pending** - Count SKPL dengan status_approval = pending
- **Chart** - Grafik kehadiran & lemburan bulanan

### 3. Master Data

#### Karyawan
- **Path:** `/master-data/karyawan`
- **Fitur:**
  - ✅ Create karyawan baru dengan validasi NIK unique
  - ✅ Read (list & search)
  - ✅ Update data karyawan
  - ✅ Delete karyawan (soft delete dengan update status_aktif)
  - ✅ Filter by status aktif/non-aktif

#### Shift
- **Path:** `/master-data/shift`
- **Fitur:**
  - ✅ Create shift (DS, NS, OFF, atau custom)
  - ✅ Validasi: jam_selesai > jam_mulai
  - ✅ Update shift
  - ✅ Delete shift

#### Jadwal Shift
- **Path:** `/master-data/jadwal-shift`
- **Fitur:**
  - ✅ Assign shift ke karyawan untuk periode tanggal
  - ✅ Bulk select karyawan
  - ✅ Date range picker
  - ✅ Preview sebelum save
  - ✅ Delete by date range

### 4. Presensi

#### Presensi Harian
- **Path:** `/presensi/harian`
- **Fitur:**
  - 📅 Date picker untuk pilih tanggal
  - 👥 List karyawan dengan scheduled shift hari itu
  - 🔘 Status buttons (DS/NS/OFF/S/I/A)
  - 💾 Auto-save ke database
  - 🔔 Notification: "X karyawan belum diubah"
  - 📝 LocalStorage persistence untuk track save state
  - 🔄 Optimistic update pattern

**Flow:**
1. User pilih tanggal
2. System fetch jadwal shift untuk tanggal tersebut
3. System generate/tampilkan absensi
4. User klik status button
5. UI update immediately, save to DB di background
6. Notification update otomatis

#### Kalender Absensi
- **Path:** `/presensi/kalender`
- **Fitur:**
  - 📆 Calendar view bulanan
  - 🎨 Color-coded status per hari
  - 👤 Filter per karyawan
  - 📊 Summary per bulan

### 5. SKPL (Surat Permohonan Kerja Lemburan)

#### Daftar SKPL
- **Path:** `/skpl`
- **Fitur:**
  - 📋 List semua SKPL dengan status
  - 🔍 Filter by status (pending/approved/rejected)
  - 🖨️ Print SKPL dengan template resmi Pertamina
  - ✅ Approve/Reject SKPL
  - 🗑️ Delete SKPL
  - 👥 Display "N Karyawan" untuk multi-karyawan SKPL

#### Buat SKPL Multi-Karyawan
- **Path:** `/skpl/baru-multi`
- **Fitur:**
  - 🔽 Searchable dropdown karyawan
  - 🏷️ Tag-based selection (add/remove)
  - 📝 Form input:
    - Tanggal lembur
    - Jam mulai & selesai (auto-calculate total jam)
    - Aktivitas/pekerjaan
    - Lokasi
    - Keterangan
  - ✅ Validasi minimal 1 karyawan
  - 🖨️ Print preview dengan multiple rows
  - 💾 Auto-generate PDF-ready template

**Print Template Features:**
- Logo Pertamina (fetch via Fetch API → data URL)
- Header: "SURAT PERMINTAAN KERJA LEMBURAN (SKPL)"
- Table dengan multiple rows untuk setiap karyawan
- Format sesuai template resmi Pertamina
- Print-friendly CSS (@media print)

### 6. Laporan

#### Laporan Bulanan
- **Path:** `/laporan/bulanan`
- **Fitur:**
  - 📊 Rekapitulasi lemburan per karyawan
  - 📅 Filter by bulan & tahun
  - 📈 Total jam lembur per karyawan
  - ✅ Filter hanya SKPL approved
  - 💰 Kalkulasi overtime (jika ada rate)

#### Export Excel
- **Path:** `/laporan/export`
- **Fitur:**
  - 📥 Download laporan dalam format .xlsx
  - 📊 Sheet terpisah untuk summary & detail
  - 🎨 Formatted cells (borders, headers, dates)
  - 📈 Auto-calculated totals
  - 🔢 NIK, nama, jabatan, total jam

---

## 📡 API Documentation

### Base URL
```
https://uftxasjmopgcierevmga.supabase.co/rest/v1
```

### Authentication Headers
```json
{
  "apikey": "sb_publishable_HAbHa-Pid8DijcGxv4P5Hw_84GbWlRx",
  "Content-Type": "application/json"
}
```

### Endpoints Summary

| Resource | GET | POST | PATCH | DELETE |
|----------|-----|------|-------|--------|
| `/karyawan` | Get all | Create | Update by ID | Delete by ID |
| `/shift` | Get all | Create | Update by ID | Delete by ID |
| `/karyawan_shift` | Get all | Create | Update by ID | Delete by ID |
| `/absensi` | Get all | Create | Update by ID | Delete by ID |
| `/skpl` | Get all | Create | Update by ID | Delete by ID |
| `/skpl_karyawan` | Get all | Create | - | - |

### Query Operators

| Operator | Contoh | Keterangan |
|----------|--------|------------|
| `eq` | `status=eq.approved` | Equal |
| `neq` | `status=neq.rejected` | Not Equal |
| `gt` | `total_jam=gt.4` | Greater Than |
| `gte` | `total_jam=gte.8` | Greater or Equal |
| `lt` | `total_jam=lt.10` | Less Than |
| `lte` | `total_jam=lte.60` | Less or Equal |
| `in` | `status=in.(pending,approved)` | In List |
| `like` | `nama=like.%Budi%` | Pattern Match |

### Example: Using Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://uftxasjmopgcierevmga.supabase.co',
  'sb_publishable_HAbHa-Pid8DijcGxv4P5Hw_84GbWlRx'
)

// Get all karyawan
const { data: karyawan } = await supabase
  .from('karyawan')
  .select('*')
  .eq('status_aktif', true)
  .order('nama')

// Create SKPL with multiple karyawan
const { data: skpl } = await supabase
  .from('skpl')
  .insert({
    tanggal: '2026-03-15',
    jam_mulai: '14:00',
    jam_selesai: '22:00',
    total_jam: 8.0,
    aktivitas: 'Maintenance sistem',
    lokasi: 'Engine Room',
    keterangan: 'Urgent repair',
    status_approval: 'pending'
  })

// Update SKPL status
const { data } = await supabase
  .from('skpl')
  .update({ status_approval: 'approved' })
  .eq('id', skplId)
```

📄 **Lihat dokumentasi lengkap:** [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)

---

## 📁 Struktur Folder

```
App-Absen/
├── database/
│   └── schema.sql              # Database schema & migration
├── public/
│   ├── logo.png                # Pertamina logo (untuk SKPL print)
│   └── favicon.ico
├── src/
│   ├── assets/                 # Static assets (images, fonts)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx      # Top navigation bar
│   │   │   ├── Sidebar.tsx     # Side navigation menu
│   │   │   └── Layout.tsx      # Main layout wrapper
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Card.tsx
│   │   ├── ErrorBoundary.tsx   # React error boundary
│   │   └── ProtectedRoute.tsx  # Auth guard component
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useDebounce.ts
│   ├── pages/
│   │   ├── Login.tsx           # Login page
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── master-data/
│   │   │   ├── Karyawan.tsx    # Karyawan CRUD page
│   │   │   ├── Shift.tsx       # Shift management page
│   │   │   └── JadwalShift.tsx # Shift scheduling page
│   │   ├── presensi/
│   │   │   ├── Harian.tsx      # Daily attendance page
│   │   │   └── Kalender.tsx    # Calendar view page
│   │   ├── skpl/
│   │   │   ├── DaftarSKPL.tsx  # SKPL list & print
│   │   │   └── FormSKPLMulti.tsx # Multi-karyawan SKPL form
│   │   └── laporan/
│   │       ├── Bulanan.tsx     # Monthly report page
│   │       └── Export.tsx      # Excel export page
│   ├── services/
│   │   ├── api.ts              # API service layer
│   │   └── supabaseClient.ts   # Supabase client config
│   ├── store/
│   │   ├── absensiStore.ts     # Absensi state (Zustand)
│   │   ├── authStore.ts        # Auth state (Zustand)
│   │   ├── karyawanStore.ts    # Karyawan state (Zustand)
│   │   ├── karyawanShiftStore.ts # Shift period state
│   │   ├── shiftStore.ts       # Shift state (Zustand)
│   │   └── skplStore.ts        # SKPL state (Zustand)
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── App.css                 # Global styles
│   ├── App.tsx                 # Main app component & routing
│   ├── index.css               # Base CSS
│   └── main.tsx                # Entry point
├── .env                        # Environment variables
├── .env.example                # Template .env file
├── .gitignore
├── .eslintrc.cjs
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── README.md                   # This file
├── API_DOCUMENTATION.md        # Detailed API docs
├── AGILE_PLAN.md               # Agile development plan
├── CHANGELOG.md                # Version history
└── SETUP_DATABASE.md           # Database setup guide
```

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server (localhost:5173)

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
npm run lint -- --fix # Auto-fix issues

# Type Checking
npx tsc --noEmit     # Check TypeScript types
```

### Code Style

- **TypeScript:** Strict mode enabled
- **ESLint:** React + TypeScript rules
- **Formatting:** Prettier (if configured)
- **Naming Conventions:**
  - Components: PascalCase (e.g., `FormSKPLMulti`)
  - Files: PascalCase for components, camelCase for utilities
  - Variables/Functions: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Database: snake_case

### State Management (Zustand)

Setiap domain memiliki store sendiri:

```typescript
// Example: karyawanStore.ts
import { create } from 'zustand'
import { karyawanService } from '../services/api'

interface KaryawanState {
  karyawanList: Karyawan[]
  loading: boolean
  error: string | null
  fetchKaryawan: () => Promise<void>
  addKaryawan: (data: Karyawan) => Promise<void>
  updateKaryawan: (id: string, data: Partial<Karyawan>) => Promise<void>
  deleteKaryawan: (id: string) => Promise<void>
}

export const useKaryawanStore = create<KaryawanState>((set) => ({
  karyawanList: [],
  loading: false,
  error: null,
  fetchKaryawan: async () => {
    set({ loading: true })
    try {
      const data = await karyawanService.getAll()
      set({ karyawanList: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  // ... other methods
}))
```

---

## 🚀 Deployment

### Build untuk Production

```bash
npm run build
```

Output:
- Folder `dist/` berisi static files
- Optimized & minified bundles
- Tree-shaking & code splitting

### Deploy ke Static Hosting

#### 1. Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

#### 2. Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### 3. Manual (FTP/cPanel)

1. Build: `npm run build`
2. Upload isi folder `dist/` ke web server
3. Configure rewrite rules untuk SPA routing

### Environment Variables (Production)

Pastikan set environment variables di hosting platform:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🔧 Troubleshooting

### Error: "Could not find column 'keterangan' in skpl"

**Solusi:**
```sql
-- Jalankan di Supabase SQL Editor
ALTER TABLE skpl ADD COLUMN IF NOT EXISTS lokasi VARCHAR(255);
ALTER TABLE skpl ADD COLUMN IF NOT EXISTS keterangan TEXT;
```

### Error: "Property 'id_karyawan' does not exist"

**Penyebab:** Menggunakan camelCase (`idKaryawan`) bukan snake_case (`id_karyawan`)

**Solusi:** Update property reference ke snake_case format.

### Logo tidak muncul saat print

**Solusi:** Sistem sudah menggunakan Fetch API untuk load logo sebagai data URL. Pastikan file `public/logo.png` ada.

### Status button tidak responsive

**Solusi:** Store sudah menggunakan direct DB query. Refresh browser (F5) untuk clear cache.

### Build error: TypeScript type mismatch

**Solusi:**
```bash
npx tsc --noEmit
# Fix errors yang muncul
```

### Port 5173 already in use

**Solusi:** Vite akan auto-switch ke port lain (5174, 5175, dst). Atau kill process:

```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5173 | xargs kill -9
```

---

## 📝 Changelog

### Version 1.0.0 (February 26, 2026)

**Initial Release - All Features Complete**

✅ **Database:**
- Schema design dengan 6 tabel
- Auto-generate function untuk absensi
- RLS policies & indexes

✅ **Features:**
- Master Data (Karyawan, Shift, Jadwal Shift)
- Presensi Harian dengan notification system
- SKPL Multi-Karyawan dengan print template
- Dashboard dengan KPI & charts
- Laporan Bulanan & Export Excel

✅ **UI/UX:**
- Responsive design
- Professional print templates
- Searchable dropdowns
- Tag-based selection

✅ **Documentation:**
- API Documentation
- Agile Plan
- Setup Guide
- Changelog

📄 **Lihat changelog lengkap:** [`CHANGELOG.md`](./CHANGELOG.md)

---

## 📞 Support & Contact

### Project Information

- **Client:** PT PERTAMINA SHOREBASE TANJUNG BATU
- **Project:** Sistem Informasi Lemburan
- **Deadline:** February 26, 2026
- **Status:** ✅ Production Ready

### Documentation Files

| File | Description |
|------|-------------|
| [`README.md`](./README.md) | Main documentation (this file) |
| [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) | Detailed API reference |
| [`AGILE_PLAN.md`](./AGILE_PLAN.md) | Sprint planning & backlog |
| [`CHANGELOG.md`](./CHANGELOG.md) | Version history |
| [`database/schema.sql`](./database/schema.sql) | Database migration script |

### Common Issues

Untuk troubleshooting lebih lanjut, lihat section [Troubleshooting](#-troubleshooting) atau buka [`CHANGELOG.md`](./CHANGELOG.md).

---

## 📄 License

**Proprietary - PT Pertamina Shorebase Tanjung Batu**

© 2026 All Rights Reserved.

---

## 🙏 Acknowledgments

- **React Team** - UI framework
- **Supabase** - Backend-as-a-Service
- **Vite** - Build tooling
- **Zustand** - State management
- **All Contributors** - Development team

---

**Last Updated:** March 9, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

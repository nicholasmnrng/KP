# Use Case Diagram & User Flow - Sistem Informasi Lemburan
## PT PERTAMINA SHOREBASE TANJUNG BATU

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Actors](#actors)
3. [Use Case Diagram](#use-case-diagram)
4. [Use Case Descriptions](#use-case-descriptions)
5. [User Flows](#user-flows)
6. [Activity Diagrams](#activity-diagrams)
7. [Sequence Diagrams](#sequence-diagrams)

---

## System Overview

Sistem Informasi Lemburan adalah aplikasi berbasis web untuk mengelola:
- Master data karyawan dan shift
- Absensi harian karyawan
- Permohonan kerja lemburan (SKPL)
- Laporan dan rekapitulasi lemburan

**Technology Stack:**
- Frontend: React 19 + TypeScript + Vite
- Backend: Supabase (PostgreSQL + REST API)
- State Management: Zustand
- Database: PostgreSQL dengan Row Level Security

---

## Actors

### 1. **Admin** 👤
Primary user yang mengelola seluruh sistem.

**Responsibilities:**
- Manage master data (karyawan, shift, jadwal)
- Record dan update absensi harian
- Approve/reject SKPL
- Generate laporan bulanan
- Export data ke Excel

**Permissions:**
- Full access ke semua fitur
- Read, Create, Update, Delete pada semua entitas
- Approval authority untuk SKPL

### 2. **System** 🖥️
Automated processes yang berjalan di background.

**Responsibilities:**
- Auto-generate absensi berdasarkan jadwal shift
- Session management
- Data validation
- Audit trail logging

---

## Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SISTEM INFORMASI LEMBURAN                              │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                            AUTHENTICATION                                    │ │
│  │  ┌──────────────────┐                                                       │ │
│  │  │   Login          │◄──────────────────────────────────┐                   │ │
│  │  └──────────────────┘                                   │                   │ │
│  └─────────────────────────────────────────────────────────┼───────────────────┘ │
│                                                            │                       │
│  ┌─────────────────────────────────────────────────────────┼───────────────────┐ │
│  │                         MASTER DATA                                         │ │
│  │  ┌──────────────────┐                                   │                   │ │
│  │  │  Kelola Karyawan │◄──────────────────────────────────┤                   │ │
│  │  │  - Create        │                                   │                   │ │
│  │  │  - Read          │                                   │                   │ │
│  │  │  - Update        │                                   │                   │ │
│  │  │  - Delete        │                                   │                   │ │
│  │  └──────────────────┘                                   │                   │ │
│  │  ┌──────────────────┐                                   │                   │ │
│  │  │  Kelola Shift    │◄──────────────────────────────────┤                   │ │
│  │  │  - Create        │                                   │                   │ │
│  │  │  - Read          │                                   │                   │ │
│  │  │  - Update        │                                   │                   │ │
│  │  │  - Delete        │                                   │                   │ │
│  │  └──────────────────┘                                   │                   │ │
│  │  ┌──────────────────┐                                   │                   │ │
│  │  │  Atur Jadwal     │◄──────────────────────────────────┤                   │ │
│  │  │  Shift           │                                   │                   │ │
│  │  │  - Assign shift  │                                   │                   │ │
│  │  │  - Set period    │                                   │                   │ │
│  │  └──────────────────┘                                   │                   │ │
│  └─────────────────────────────────────────────────────────┼───────────────────┘ │
│                                                            │                       │
│  ┌─────────────────────────────────────────────────────────┼───────────────────┐ │
│  │                      ATTENDANCE MANAGEMENT                                  │ │
│  │  ┌──────────────────┐                                   │                   │ │
│  │  │  Input Absensi   │◄──────────────────────────────────┤                   │ │
│  │  │  Harian          │                                   │                   │ │
│  │  │  - Set status    │                                   │                   │ │
│  │  │  - Record time   │                                   │                   │ │
│  │  └──────────────────┘                                   │                   │ │
│  │  ┌──────────────────┐                                   │                   │ │
│  │  │  Lihat Kalender  │◄──────────────────────────────────┤                   │ │
│  │  │  Absensi         │                                   │                   │ │
│  │  └──────────────────┘                                   │                   │ │
│  │  ┌──────────────────┐                                   │                   │ │
│  │  │  Auto-Generate   │◄──────────────────────────────┐   │                   │ │
│  │  │  Absensi         │◄─────────── System ───────────┘   │                   │ │
│  │  └──────────────────┘                                   │                   │ │
│  └─────────────────────────────────────────────────────────┼───────────────────┘ │
│                                                            │                       │
│  ┌─────────────────────────────────────────────────────────┼───────────────────┐ │
│  │                    OVERTIME MANAGEMENT (SKPL)                               │ │
│  │  ┌──────────────────┐                                   │                   │ │
│  │  │  Buat SKPL       │◄──────────────────────────────────┤                   │ │
│  │  │  Multi-Karyawan  │                                   │                   │ │
│  │  │  - Select emp    │                                   │                   │ │
│  │  │  - Set datetime  │                                   │                   │ │
│  │  │  - Set activity  │                                   │                   │ │
│  │  └──────────────────┘                                   │                   │ │
│  │  ┌──────────────────┐                                   │                   │ │
│  │  │  Approve/Reject  │◄──────────────────────────────────┤                   │ │
│  │  │  SKPL            │                                   │                   │ │
│  │  └──────────────────┘                                   │                   │ │
│  │  ┌──────────────────┐                                   │                   │ │
│  │  │  Print SKPL      │◄──────────────────────────────────┤                   │ │
│  │  │  Template        │                                   │                   │ │
│  │  └──────────────────┘                                   │                   │ │
│  └─────────────────────────────────────────────────────────┼───────────────────┘ │
│                                                            │                       │
│  ┌─────────────────────────────────────────────────────────┼───────────────────┐ │
│  │                      REPORTING & EXPORT                                     │ │
│  │  ┌──────────────────┐                                   │                   │ │
│  │  │  Lihat Laporan   │◄──────────────────────────────────┤                   │ │
│  │  │  Bulanan         │                                   │                   │ │
│  │  └──────────────────┘                                   │                   │ │
│  │  ┌──────────────────┐                                   │                   │ │
│  │  │  Export Excel    │◄──────────────────────────────────┤                   │ │
│  │  └──────────────────┘                                   │                   │ │
│  │  ┌──────────────────┐                                   │                   │ │
│  │  │  View Dashboard  │◄──────────────────────────────────┤                   │ │
│  │  │  - KPIs          │                                   │                   │ │
│  │  │  - Charts        │                                   │                   │ │
│  │  └──────────────────┘                                   │                   │ │
│  └─────────────────────────────────────────────────────────┴───────────────────┘ │
│                                                                                   │
│  ┌────────────────┐                                                               │
│  │     Admin      │◄──────────────────────────────────────────────────────────────┘
│  └────────────────┘
│
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Use Case Descriptions

### UC-001: Login

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-001 |
| **Name** | Login |
| **Actor** | Admin |
| **Description** | Admin melakukan autentikasi ke sistem menggunakan Supabase Auth |
| **Precondition** | Admin memiliki akun yang terdaftar di Supabase |
| **Postcondition** | Admin mendapat akses ke sistem dengan session aktif |
| **Main Flow** | 1. Admin membuka halaman login<br>2. Admin memasukkan email dan password<br>3. Sistem memvalidasi credentials<br>4. Sistem membuat session<br>5. Sistem redirect ke dashboard |
| **Alternative Flow** | 3a. Credentials invalid → Sistem tampilkan error message<br>3b. Admin retry login |
| **Exception** | Network error → Tampilkan pesan koneksi |

---

### UC-002: Kelola Data Karyawan

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-002 |
| **Name** | Kelola Data Karyawan |
| **Actor** | Admin |
| **Description** | Admin melakukan CRUD operations pada data karyawan |
| **Precondition** | Admin sudah login |
| **Postcondition** | Data karyawan tersimpan/terupdate di database |
| **Main Flow** | **CREATE:**<br>1. Admin klik "Tambah Karyawan"<br>2. Admin isi form (NIK, nama, jabatan, departemen, no_hp)<br>3. Sistem validasi NIK unique<br>4. Sistem save ke database<br><br>**READ:**<br>1. Admin buka halaman karyawan<br>2. Sistem tampilkan list karyawan<br>3. Admin dapat search/filter<br><br>**UPDATE:**<br>1. Admin klik edit pada karyawan<br>2. Admin update data<br>3. Sistem validasi & save<br><br>**DELETE:**<br>1. Admin klik delete<br>2. Sistem update status_aktif = false |
| **Alternative Flow** | 3a. NIK sudah ada → Sistem tampilkan error duplicate |
| **Business Rules** | - NIK harus unique<br>- Soft delete dengan update status_aktif |

---

### UC-003: Kelola Shift

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-003 |
| **Name** | Kelola Shift |
| **Actor** | Admin |
| **Description** | Admin mengelola master data shift kerja |
| **Precondition** | Admin sudah login |
| **Postcondition** | Data shift tersimpan di database |
| **Main Flow** | 1. Admin buka halaman shift<br>2. Admin klik "Tambah Shift"<br>3. Admin isi form (nama, jam_mulai, jam_selesai, durasi_jam)<br>4. Sistem validasi jam_selesai > jam_mulai<br>5. Sistem save ke database |
| **Alternative Flow** | 4a. Jam invalid → Sistem tampilkan error |
| **Business Rules** | - jam_selesai harus > jam_mulai<br>- Nama shift harus unique |

---

### UC-004: Atur Jadwal Shift

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-004 |
| **Name** | Atur Jadwal Shift |
| **Actor** | Admin |
| **Description** | Admin assign shift ke karyawan untuk periode tertentu |
| **Precondition** | - Data karyawan exists<br>- Data shift exists |
| **Postcondition** | Jadwal shift tersimpan di tabel karyawan_shift |
| **Main Flow** | 1. Admin buka halaman jadwal shift<br>2. Admin pilih karyawan (bulk select supported)<br>3. Admin pilih shift<br>4. Admin set periode (tanggal_mulai, tanggal_selesai)<br>5. Admin preview jadwal<br>6. Sistem save ke database |
| **Alternative Flow** | - |
| **Business Rules** | - tanggal_selesai >= tanggal_mulai<br>- 1 karyawan bisa multiple shift periods |

---

### UC-005: Input Absensi Harian

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-005 |
| **Name** | Input Absensi Harian |
| **Actor** | Admin |
| **Description** | Admin mencatat absensi harian karyawan dengan status |
| **Precondition** | - Jadwal shift sudah di-set<br>- Admin sudah login |
| **Postcondition** | Absensi tersimpan di database |
| **Main Flow** | 1. Admin pilih tanggal<br>2. Sistem fetch jadwal shift untuk tanggal tersebut<br>3. Sistem tampilkan list karyawan dengan scheduled shift<br>4. Admin klik status button (DS/NS/OFF/S/I/A)<br>5. Sistem auto-save ke database<br>6. Sistem tampilkan notifikasi save |
| **Alternative Flow** | 2a. Tidak ada jadwal → Sistem tampilkan empty state<br>5a. Save failed → Sistem retry |
| **Business Rules** | - Status: DS, NS, OFF, S, I, A<br>- 1 karyawan = 1 absensi per hari<br>- Auto-generate berdasarkan shift |

---

### UC-006: Auto-Generate Absensi

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-006 |
| **Name** | Auto-Generate Absensi |
| **Actor** | System |
| **Description** | PostgreSQL function generate absensi otomatis berdasarkan jadwal shift |
| **Precondition** | Ada jadwal shift yang valid untuk tanggal target |
| **Postcondition** | Record absensi dibuat di database |
| **Main Flow** | 1. System trigger function generate_absensi_otomatis()<br>2. Query karyawan aktif dengan shift period valid<br>3. Map shift name ke status code<br>4. Insert ke tabel absensi dengan ON CONFLICT<br>5. Return summary hasil generate |
| **Alternative Flow** | - |
| **Business Rules** | - Shift Pagi → DS<br>- Shift Malam → NS<br>- OFF → OFF |

---

### UC-007: Lihat Kalender Absensi

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-007 |
| **Name** | Lihat Kalender Absensi |
| **Actor** | Admin |
| **Description** | Admin melihat absensi dalam format kalender bulanan |
| **Precondition** | Ada data absensi |
| **Postcondition** | - |
| **Main Flow** | 1. Admin buka halaman kalender<br>2. Admin pilih bulan/tahun<br>3. Admin filter per karyawan (optional)<br>4. Sistem tampilkan kalender dengan color-coded status |
| **Alternative Flow** | - |
| **Business Rules** | Color coding:<br>- DS/NS: Green<br>- OFF: Gray<br>- S/I/A: Red |

---

### UC-008: Buat SKPL Multi-Karyawan

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-008 |
| **Name** | Buat SKPL Multi-Karyawan |
| **Actor** | Admin |
| **Description** | Admin membuat surat permohonan kerja lemburan untuk multiple karyawan |
| **Precondition** | - Data karyawan exists<br>- Admin sudah login |
| **Postcondition** | SKPL dan skpl_karyawan records dibuat |
| **Main Flow** | 1. Admin klik "Buat SKPL Multi"<br>2. Admin pilih karyawan (tag-based selection)<br>3. Admin isi form:<br>   - Tanggal lembur<br>   - Jam mulai & selesai<br>   - Aktivitas/pekerjaan<br>   - Lokasi<br>   - Keterangan<br>4. Sistem auto-calculate total_jam<br>5. Sistem validasi (min 1 karyawan)<br>6. Admin submit<br>7. Sistem save SKPL<br>8. Sistem save skpl_karyawan untuk setiap karyawan<br>9. Sistem set status_approval = pending |
| **Alternative Flow** | 5a. Tidak ada karyawan → Error<br>10a. 60 jam limit exceeded → Warning |
| **Business Rules** | - Minimal 1 karyawan<br>- Max 60 jam lembur/bulan/karyawan<br>- status_approval default: pending |

---

### UC-009: Approve/Reject SKPL

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-009 |
| **Name** | Approve/Reject SKPL |
| **Actor** | Admin |
| **Description** | Admin approve atau reject permohonan lemburan |
| **Precondition** | Ada SKPL dengan status pending |
| **Postcondition** | Status SKPL diupdate |
| **Main Flow** | 1. Admin buka daftar SKPL<br>2. Admin filter status = pending<br>3. Admin klik approve/reject button<br>4. Sistem update status_approval<br>5. Sistem save ke database |
| **Alternative Flow** | - |
| **Business Rules** | Status: pending → approved/rejected |

---

### UC-010: Print SKPL Template

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-010 |
| **Name** | Print SKPL Template |
| **Actor** | Admin |
| **Description** | Admin mencetak SKPL dengan template resmi Pertamina |
| **Precondition** | Ada SKPL yang sudah dibuat |
| **Postcondition** | SKPL tercetak/di-download sebagai PDF |
| **Main Flow** | 1. Admin klik print pada SKPL<br>2. Sistem fetch data SKPL + karyawan<br>3. Sistem load logo Pertamina<br>4. Sistem render template dengan:<br>   - Header "SURAT PERMINTAAN KERJA LEMBURAN"<br>   - Logo Pertamina<br>   - Table dengan multiple rows (per karyawan)<br>5. Admin print/save PDF |
| **Alternative Flow** | - |
| **Business Rules** | Format sesuai template Pertamina |

---

### UC-011: Lihat Laporan Bulanan

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-011 |
| **Name** | Lihat Laporan Bulanan |
| **Actor** | Admin |
| **Description** | Admin melihat rekapitulasi lemburan per karyawan |
| **Precondition** | Ada data SKPL approved |
| **Postcondition** | - |
| **Main Flow** | 1. Admin buka halaman laporan<br>2. Admin pilih bulan & tahun<br>3. Admin filter (optional):<br>   - Karyawan tertentu<br>   - Hanya approved<br>4. Sistem tampilkan rekap:<br>   - NIK, nama, jabatan<br>   - Total jam lembur<br>5. Sistem kalkulasi total |
| **Alternative Flow** | - |
| **Business Rules** | Hanya SKPL approved yang dihitung |

---

### UC-012: Export Excel

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-012 |
| **Name** | Export Excel |
| **Actor** | Admin |
| **Description** | Admin export laporan ke format XLSX |
| **Precondition** | Ada data laporan |
| **Postcondition** | File XLSX di-download |
| **Main Flow** | 1. Admin klik "Export Excel"<br>2. Sistem generate XLSX dengan:<br>   - Sheet terpisah (summary & detail)<br>   - Formatted cells (borders, headers)<br>   - Auto-calculated totals<br>3. Sistem trigger download |
| **Alternative Flow** | - |
| **Business Rules** | Format: .xlsx dengan formatting |

---

### UC-013: View Dashboard

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-013 |
| **Name** | View Dashboard |
| **Actor** | Admin |
| **Description** | Admin melihat KPI dan summary sistem |
| **Precondition** | Admin sudah login |
| **Postcondition** | - |
| **Main Flow** | 1. Admin buka dashboard<br>2. Sistem tampilkan KPIs:<br>   - Total karyawan aktif<br>   - Kehadiran hari ini<br>   - SKPL pending approval<br>3. Sistem tampilkan charts:<br>   - Grafik kehadiran bulanan<br>   - Grafik lemburan |
| **Alternative Flow** | - |
| **Business Rules** | Real-time data dari database |

---

## User Flows

### UF-001: Login Flow

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Open Login Page │
└──────┬──────────┘
       │
       ▼
┌─────────────────────┐
│ Enter Email &       │
│ Password            │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Submit Credentials  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Validate with       │
│ Supabase Auth       │
└──────┬──────────────┘
       │
       ├──────────────┐
       │ Invalid      │
       ▼              │
┌──────────────┐      │
│ Show Error   │◄─────┘
│ Message      │
└──────┬───────┘
       │ Valid
       ▼
┌─────────────────────┐
│ Create Session &    │
│ Store in Zustand    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Redirect to         │
│ Dashboard           │
└──────┬──────────────┘
       │
       ▼
┌─────────────┐
│    END      │
└─────────────┘
```

---

### UF-002: Create Karyawan Flow
       
```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Navigate to         │
│ Karyawan Page       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Click "Tambah       │
│ Karyawan" Button    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Open Modal/Form     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Fill Form:          │
│ - NIK               │
│ - Nama              │
│ - Jabatan           │
│ - Departemen        │
│ - No HP             │
│ - Status Aktif      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Submit Form         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Validate NIK        │
│ (Unique Check)      │
└──────┬──────────────┘
       │
       ├──────────────┐
       │ Duplicate    │
       ▼              │
┌──────────────┐      │
│ Show Error:  │◄─────┘
│ NIK exists   │
└──────┬───────┘
       │ Valid
       ▼
┌─────────────────────┐
│ POST to /karyawan   │
│ (Supabase API)      │
└──────┬──────────────┘
       │
       ├──────────────┐
       │ Error        │
       ▼              │
┌──────────────┐      │
│ Show Error   │◄─────┘
│ Message      │
└──────┬───────┘
       │ Success
       ▼
┌─────────────────────┐
│ Update Zustand      │
│ Store               │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Close Modal &       │
│ Show Success Toast  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Refresh List        │
└──────┬──────────────┘
       │
       ▼
┌─────────────┐
│    END      │
└─────────────┘
```

---

### UF-003: Input Absensi Harian Flow

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Navigate to         │
│ Presensi Harian     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Select Date         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Fetch Jadwal Shift  │
│ for Selected Date   │
└──────┬──────────────┘
       │
       ├──────────────┐
       │ No Schedule  │
       ▼              │
┌──────────────┐      │
│ Show Empty   │◄─────┘
│ State        │
└──────┬───────┘
       │ Has Schedule
       ▼
┌─────────────────────┐
│ Generate/Display    │
│ Attendance List     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Display Employee    │
│ List with Current   │
│ Status              │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ User Clicks Status  │
│ Button (DS/NS/OFF/  │
│ S/I/A)              │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Optimistic UI       │
│ Update              │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ UPSERT to /absensi  │
│ (Background Save)   │
└──────┬──────────────┘
       │
       ├──────────────┐
       │ Error        │
       ▼              │
┌──────────────┐      │
│ Show Notifi- │◄─────┘
│ cation       │
└──────┬───────┘
       │ Success
       ▼
┌─────────────────────┐
│ Update Notification │
│ "X karyawan belum   │
│ diubah"             │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Save to LocalStorage│
│ (Track Save State)  │
└──────┬──────────────┘
       │
       ▼
┌─────────────┐
│    END      │
└─────────────┘
```

---

### UF-004: Create SKPL Multi-Karyawan Flow

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Navigate to         │
│ Buat SKPL Multi     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Search & Select     │
│ Employees           │
│ (Tag-based UI)      │
└──────┬──────────────┘
       │
       ├──────────────┐
       │ < 1 Employee │
       ▼              │
┌──────────────┐      │
│ Disable      │◄─────┘
│ Submit       │
└──────┬───────┘
       │ >= 1 Employee
       ▼
┌─────────────────────┐
│ Fill SKPL Form:     │
│ - Tanggal Lembur    │
│ - Jam Mulai         │
│ - Jam Selesai       │
│ - Aktivitas         │
│ - Lokasi            │
│ - Keterangan        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Auto-Calculate      │
│ Total Jam           │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Check 60 Jam Limit  │
│ (Per Employee)      │
└──────┬──────────────┘
       │
       ├──────────────┐
       │ Exceeded     │
       ▼              │
┌──────────────┐      │
│ Show Warning │◄─────┘
│ Message      │
└──────┬───────┘
       │ Within Limit
       ▼
┌─────────────────────┐
│ Submit Form         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Transaction:        │
│ 1. INSERT to /skpl  │
│ 2. INSERT to        │
│    /skpl_karyawan   │
│    (for each emp)   │
└──────┬──────────────┘
       │
       ├──────────────┐
       │ Error        │
       ▼              │
┌──────────────┐      │
│ Show Error   │◄─────┘
│ & Rollback   │
└──────┬───────┘
       │ Success
       ▼
┌─────────────────────┐
│ Set status_approval │
│ = 'pending'         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Show Success Toast  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Redirect to Daftar  │
│ SKPL                │
└──────┬──────────────┘
       │
       ▼
┌─────────────┐
│    END      │
└─────────────┘
```

---

### UF-005: Approve/Reject SKPL Flow

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Navigate to         │
│ Daftar SKPL         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Filter Status =     │
│ 'pending'           │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Display Pending     │
│ SKPL List           │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ User Clicks         │
│ Approve/Reject      │
│ Button              │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Show Confirmation   │
│ Dialog              │
└──────┬──────────────┘
       │
       ├──────────────┐
       │ Cancel       │
       ▼              │
┌──────────────┐      │
│ Close Dialog │◄─────┘
└──────┬───────┘
       │ Confirm
       ▼
┌─────────────────────┐
│ PATCH /skpl         │
│ Update status_app   │
└──────┬──────────────┘
       │
       ├──────────────┐
       │ Error        │
       ▼              │
┌──────────────┐      │
│ Show Error   │◄─────┘
│ Toast        │
└──────┬───────┘
       │ Success
       ▼
┌─────────────────────┐
│ Update UI &         │
│ Show Success Toast  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Refresh List        │
└──────┬──────────────┘
       │
       ▼
┌─────────────┐
│    END      │
└─────────────┘
```

---

### UF-006: Export Laporan Excel Flow

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Navigate to         │
│ Laporan Bulanan     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Select Bulan &      │
│ Tahun               │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Fetch Approved SKPL │
│ for Selected Period │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Calculate Total Jam │
│ Per Karyawan        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ User Clicks         │
│ "Export Excel"      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Generate XLSX:      │
│ - Sheet 1: Summary  │
│ - Sheet 2: Detail   │
│ - Formatted Cells   │
│ - Auto Totals       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Trigger Download    │
│ (Browser)           │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Show Success Toast  │
└──────┬──────────────┘
       │
       ▼
┌─────────────┐
│    END      │
└─────────────┘
```

---

## Activity Diagrams

### AD-001: Daily Attendance Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    DAILY ATTENDANCE PROCESS                      │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────┐
    │  START   │
    └────┬─────┘
         │
         ▼
    ┌────────────────┐
    │ Admin selects  │
    │ date           │
    └────┬───────────┘
         │
         ▼
    ┌────────────────┐
    │ System fetches │
    │ shift schedule │
    └────┬───────────┘
         │
    ┌────┴─────┐
    │ Has      │
    │ schedule?│
    └────┬─────┘
         │ No
         ▼
    ┌────────────────┐
    │ Show empty     │
    │ state          │
    └────┬───────────┘
         │
         ▼
    ┌────────────────┐
    │  END           │
    └────────────────┘
         │
         │ Yes
         ▼
    ┌────────────────┐
    │ Generate/      │
    │ display        │
    │ attendance     │
    │ list           │
    └────┬───────────┘
         │
         ▼
    ┌────────────────┐
    │ For each       │
    │ employee:      │
    └────┬───────────┘
         │
         ▼
    ┌────────────────┐
    │ Admin clicks   │
    │ status button  │
    └────┬───────────┘
         │
         ▼
    ┌────────────────┐
    │ System updates │
    │ UI immediately │
    │ (Optimistic)   │
    └────┬───────────┘
         │
         ▼
    ┌────────────────┐
    │ System saves   │
    │ to database    │
    └────┬───────────┘
         │
         ▼
    ┌────────────────┐
    │ Update         │
    │ notification   │
    │ counter        │
    └────┬───────────┘
         │
         ▼
    ┌────────────────┐
    │ All employees  │
    │ processed?     │
    └────┬───────────┘
         │ No  ──────┐
         │           │
         ▼           │
    ┌────────────────┘
    │ Yes
    ▼
    ┌────────────────┐
    │ Show success   │
    │ message        │
    └────┬───────────┘
         │
         ▼
    ┌──────────┐
    │   END    │
    └──────────┘
```

---

### AD-002: SKPL Approval Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                      SKPL APPROVAL WORKFLOW                      │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────┐
    │  START   │
    └────┬─────┘
         │
         ▼
    ┌────────────────┐
    │ SKPL created   │
    │ with status:   │
    │ 'pending'      │
    └────┬───────────┘
         │
         ▼
    ┌────────────────┐
    │ Admin views    │
    │ pending SKPL   │
    └────┬───────────┘
         │
         ▼
    ┌────────────────┐
    │ Admin reviews  │
    │ SKPL details   │
    └────┬───────────┘
         │
         ▼
    ┌────────────────┐
    │ Admin clicks   │
    │ Approve/Reject │
    └────┬───────────┘
         │
    ┌────┴─────┐
    │ Decision │
    └────┬─────┘
         │
    ┌────┴──────┐
    │           │
    ▼           ▼
┌─────────┐ ┌──────────┐
│ Approve │ │ Reject   │
└────┬────┘ └────┬─────┘
     │           │
     │           │
     ▼           ▼
┌─────────┐ ┌──────────┐
│ Update  │ │ Update   │
│ status  │ │ status   │
│ =       │ │ =        │
│'approved│ │'rejected'│
└────┬────┘ └────┬─────┘
     │           │
     │           │
     ▼           ▼
┌─────────────────┐
│ Save to         │
│ database        │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Notify          │
│ requester       │
└────┬────────────┘
     │
     ▼
┌──────────┐
│   END    │
└──────────┘
```

---

## Sequence Diagrams

### SD-001: Login Sequence

```
┌──────────┐      ┌──────────┐      ┌───────────┐      ┌──────────┐
│  Admin   │      │   UI     │      │  Zustand  │      │ Supabase │
│          │      │(React)   │      │   Store   │      │   Auth   │
└────┬─────┘      └────┬─────┘      └─────┬─────┘      └────┬─────┘
     │                 │                  │                  │
     │ Open Login Page │                  │                  │
     │────────────────>│                  │                  │
     │                 │                  │                  │
     │ Enter Creds     │                  │                  │
     │────────────────>│                  │                  │
     │                 │                  │                  │
     │                 │ signInWithEmail()│                  │
     │                 │─────────────────>│                  │
     │                 │                  │                  │
     │                 │                  │ signInWithPassword()
     │                 │                  │─────────────────>│
     │                 │                  │                  │
     │                 │                  │     Session      │
     │                 │                  │<─────────────────│
     │                 │                  │                  │
     │                 │     Session      │                  │
     │                 │<─────────────────│                  │
     │                 │                  │                  │
     │                 │ setSession()     │                  │
     │                 │─────────────────>│                  │
     │                 │                  │                  │
     │                 │                  │  Store session   │
     │                 │                  │                  │
     │                 │     Redirect     │                  │
     │                 │─────────────────>│                  │
     │                 │                  │                  │
     │     Dashboard   │                  │                  │
     │<────────────────│                  │                  │
     │                 │                  │                  │
```

---

### SD-002: Create SKPL Multi-Karyawan Sequence

```
┌──────────┐   ┌───────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Admin   │   │ FormSKPL  │   │ Zustand  │   │ Supabase │   │  Supabase│
│          │   │   Multi   │   │  Store   │   │  /skpl   │   │/skpl_kar │
└────┬─────┘   └─────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
     │               │               │              │              │
     │ Select Emps   │               │              │              │
     │──────────────>│               │              │              │
     │               │               │              │              │
     │ Fill Form     │               │              │              │
     │──────────────>│               │              │              │
     │               │               │              │              │
     │ Submit        │               │              │              │
     │──────────────>│               │              │              │
     │               │               │              │              │
     │               │ Validate      │              │              │
     │               │ (min 1 emp)   │              │              │
     │               │               │              │              │
     │               │ INSERT skpl   │              │              │
     │               │──────────────>│              │              │
     │               │               │              │              │
     │               │               │ POST /skpl   │              │
     │               │               │─────────────>│              │
     │               │               │              │              │
     │               │               │   skpl_id    │              │
     │               │               │<─────────────│              │
     │               │               │              │              │
     │               │ skpl_id       │              │              │
     │               │<──────────────│              │              │
     │               │               │              │              │
     │               │ For each emp: │              │              │
     │               │──────────────>│              │              │
     │               │               │              │              │
     │               │               │INSERT skpl_k │              │
     │               │               │─────────────>│              │
     │               │               │              │              │
     │               │               │   Success    │              │
     │               │               │<─────────────│              │
     │               │               │              │              │
     │               │               │              │              │
     │               │ Update Store  │              │              │
     │               │──────────────>│              │              │
     │               │               │              │              │
     │               │ Show Success  │              │              │
     │               │──────────────>│              │              │
     │               │               │              │              │
     │   Success Msg │               │              │              │
     │<──────────────│               │              │              │
     │               │               │              │              │
```

---

### SD-003: Auto-Generate Attendance Sequence

```
┌──────────┐   ┌───────────┐   ┌──────────────┐   ┌──────────┐
│  System  │   │  Trigger  │   │PG Function   │   │ Absensi  │
│          │   │(Scheduled)│   │ generate_    │   │  Table   │
│          │   │           │   │ otomatis()   │   │          │
└────┬─────┘   └─────┬─────┘   └──────┬───────┘   └────┬─────┘
     │               │                │                │
     │ Trigger       │                │                │
     │ Daily         │                │                │
     │──────────────>│                │                │
     │               │                │                │
     │               │ Call Function  │                │
     │               │ for date       │                │
     │               │───────────────>│                │
     │               │                │                │
     │               │                │ Query active   │
     │               │                │ employees with │
     │               │                │ valid shift    │
     │               │                │───────────────>│
     │               │                │                │
     │               │                │ Employee List  │
     │               │                │<───────────────│
     │               │                │                │
     │               │                │ For each emp:  │
     │               │                │ Map shift to   │
     │               │                │ status code    │
     │               │                │                │
     │               │                │ INSERT with    │
     │               │                │ ON CONFLICT    │
     │               │                │───────────────>│
     │               │                │                │
     │               │                │   Success      │
     │               │                │<───────────────│
     │               │                │                │
     │               │ Return Summary │                │
     │               │<───────────────│                │
     │               │                │                │
     │     Result    │                │                │
     │<──────────────│                │                │
     │               │                │                │
```

---

## Database Schema Reference

### Tables Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   KARYAWAN      │     │     SHIFT       │     │  KARYAWAN_SHIFT │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK, UUID)   │     │ id (PK, UUID)   │     │ id (PK, UUID)   │
│ nik (UNIQUE)    │     │ nama (UNIQUE)   │     │ id_karyawan(FK) │
│ nama            │     │ jam_mulai       │     │ id_shift (FK)   │
│ jabatan         │     │ jam_selesai     │     │ tgl_mulai       │
│ departemen      │     │ durasi_jam      │     │ tgl_selesai     │
│ no_hp           │     │ created_at      │     │ created_at      │
│ status_aktif    │     │ updated_at      │     │ updated_at      │
│ created_at      │     └─────────────────┘     └─────────────────┘
│ updated_at      │            │                        │
└────────┬────────┘            │                        │
         │                     │                        │
         │ (1:M)               │                        │
         │                     │                        │
         ▼                     │                        │
┌─────────────────┐            │                        │
│    ABSENSI      │            │                        │
├─────────────────┤            │                        │
│ id (PK, UUID)   │            │                        │
│ id_karyawan(FK) │◄───────────┘                        │
│ tanggal         │                                     │
│ status          │                                     │
│ jam_in          │                                     │
│ jam_out         │                                     │
│ created_at      │                                     │
│ updated_at      │                                     │
└─────────────────┘                                     │
                                                        │
         ┌──────────────────────────────────────────────┘
         │
         │ (1:M)
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│     SKPL        │     │  SKPL_KARYAWAN  │
├─────────────────┤     ├─────────────────┤
│ id (PK, UUID)   │     │ id (PK, UUID)   │
│ tanggal         │     │ id_skpl (FK)    │
│ jam_mulai       │     │ id_karyawan(FK) │
│ jam_selesai     │     │ created_at      │
│ total_jam       │     └─────────────────┘
│ aktivitas       │
│ lokasi          │
│ keterangan      │
│ status_approval │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

---

## Business Rules Summary

| Rule ID | Description |
|---------|-------------|
| BR-001 | NIK karyawan harus unique |
| BR-002 | Soft delete untuk karyawan (update status_aktif) |
| BR-003 | jam_selesai shift harus > jam_mulai |
| BR-004 | 1 karyawan hanya 1 absensi per hari |
| BR-005 | Max 60 jam lembur per bulan per karyawan |
| BR-006 | SKPL status: pending → approved/rejected |
| BR-007 | Minimal 1 karyawan dalam SKPL multi |
| BR-008 | Auto-generate absensi berdasarkan jadwal shift |
| BR-009 | Shift mapping: Pagi=DS, Malam=NS, OFF=OFF |
| BR-010 | Hanya SKPL approved yang masuk laporan |

---

## Appendix

### Status Codes Reference

**Absensi Status:**
- `DS` - Day Shift
- `NS` - Night Shift
- `OFF` - Libur
- `S` - Sakit
- `I` - Izin
- `A` - Alpha

**SKPL Status:**
- `pending` - Menunggu approval
- `approved` - Disetujui
- `rejected` - Ditolak

### API Endpoints Quick Reference

| Resource | Endpoint | Methods |
|----------|----------|---------|
| Karyawan | `/karyawan` | GET, POST |
| Karyawan (by id) | `/karyawan?id=eq.{id}` | PATCH, DELETE |
| Shift | `/shift` | GET, POST |
| Shift (by id) | `/shift?id=eq.{id}` | PATCH, DELETE |
| Absensi | `/absensi` | GET, POST |
| Absensi (by id) | `/absensi?id=eq.{id}` | PATCH, DELETE |
| SKPL | `/skpl` | GET, POST |
| SKPL (by id) | `/skpl?id=eq.{id}` | PATCH, DELETE |
| SKPL Karyawan | `/skpl_karyawan` | GET, POST |

---

**Document Version:** 1.0.0  
**Last Updated:** March 9, 2026  
**Author:** Systems Analyst  
**Project:** Sistem Informasi Lemburan - PT Pertamina Shorebase Tanjung Batu

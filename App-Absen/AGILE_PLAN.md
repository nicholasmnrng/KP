# 🚀 AGILE DEVELOPMENT PLAN
## Sistem Informasi Lemburan PT PERTAMINA SHOREBASE TANJUNG BATU

---

## 📌 Project Overview

- **Judul Proyek:** Rancang Bangun Backend Sistem Informasi Lemburan Berbasis Web Menggunakan Metode Agile
- **Perusahaan:** PT PERTAMINA SHOREBASE TANJUNG BATU
- **Timeline:** 1 Sprint (1 Minggu)
- **Deadline:** February 26, 2026

---

## 🎯 Project Goals

1. ✅ Merancang database schema yang optimal untuk manajemen lemburan
2. ✅ Mengimplementasikan backend API dengan Supabase
3. ✅ Mengintegrasikan dengan frontend React
4. ✅ Melakukan testing dan dokumentasi lengkap
5. ✅ Menjamin data integrity dan security

---

## 📊 Product Backlog & User Stories

### Epic 1: Master Data Management
- [ ] **US001** - Admin dapat mengelola data karyawan (CRUD)
  - AC: Bisa create, read, update, delete karyawan
  - AC: Validasi NIK unique
  - Priority: HIGH
  
- [ ] **US002** - Admin dapat mengelola shift kerja
  - AC: Bisa create, read, update, delete shift
  - AC: Validasi jam_mulai < jam_selesai
  - Priority: HIGH

### Epic 2: Attendance Management
- [ ] **US003** - Admin dapat input absensi karyawan harian
  - AC: Bisa input jam masuk/keluar
  - AC: Status: hadir, lembur, sakit, izin
  - AC: Unique constraint: 1 karyawan per hari
  - Priority: HIGH

### Epic 3: Overtime Request Management
- [ ] **US004** - Karyawan dapat mengajukan permohonan lemburan (SKPL)
  - AC: Bisa submit form dengan tanggal, jam, aktivitas
  - AC: Status default: pending
  - AC: Kalkulasi otomatis total_jam
  - AC: Max 60 jam per bulan
  - Priority: HIGH

- [ ] **US005** - Admin dapat approve/reject SKPL
  - AC: Bisa ubah status menjadi approved/rejected
  - AC: Bisa lihat semua permohonan
  - Priority: HIGH

### Epic 4: Reporting
- [ ] **US006** - Admin dapat melihat laporan lemburan bulanan
  - AC: Bisa filter per karyawan
  - AC: Bisa lihat total jam lemburan
  - AC: Bisa export ke Excel
  - Priority: MEDIUM

---

## 📅 Sprint Breakdown (1 Week)

### DAY 1 (Feb 19) - Planning & Database Setup
- [x] Define requirements & entities
- [x] Design database schema
- [x] Create SQL migration script
- [x] Setup Supabase database
- **Task:** Run SQL script di Supabase dashboard

### DAY 2 (Feb 20) - Backend API Implementation
- [ ] Create Supabase client service
- [ ] Implement API services (karyawan, shift)
- [ ] Implement API services (absensi, skpl)
- [ ] Write TypeScript types
- **Task:** Test semua endpoints dengan Postman/Thunder Client

### DAY 3 (Feb 21) - Frontend Integration (Part 1)
- [ ] Update store (Zustand) dengan Supabase data
- [ ] Create Karyawan CRUD pages
- [ ] Create Shift management pages
- **Task:** Test create/read/update/delete karyawan & shift

### DAY 4 (Feb 22) - Frontend Integration (Part 2)
- [ ] Create Absensi input pages
- [ ] Create SKPL request form
- [ ] Create SKPL approval dashboard
- **Task:** Test absensi & SKPL workflows

### DAY 5 (Feb 23) - Dashboard & Reporting
- [ ] Create dashboard with summaries
- [ ] Create attendance calendar
- [ ] Create monthly report page
- [ ] Implement Excel export
- **Task:** Test dashboard & reporting features

### DAY 6 (Feb 24) - Testing & Documentation
- [ ] Integration testing
- [ ] Bug fixes & edge cases
- [ ] Complete API documentation
- [ ] Write user guide
- **Task:** Final QA & documentation review

### DAY 7 (Feb 25) - Deployment & Handover
- [ ] Final testing
- [ ] Prepare deployment
- [ ] Create presentation materials
- [ ] Handover to client
- **Task:** Demo & knowledge transfer

---

## 📐 Database Design

### ER Diagram

```
┌─────────────────┐
│    KARYAWAN     │
├─────────────────┤
│ id (PK)         │
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
    ┌────────────┐      ┌────────────┐      ┌──────────┐
    │  ABSENSI   │      │   SKPL     │      │  SHIFT   │
    ├────────────┤      ├────────────┤      ├──────────┤
    │ id (PK)    │      │ id (PK)    │      │ id (PK)  │
    │ id_kar (FK)│      │ id_kar (FK)│      │ nama     │
    │ tanggal    │      │ tanggal    │      │ jam_mul  │
    │ status     │      │ jam_mulai  │      │ jam_sel  │
    │ jam_in     │      │ jam_selesai│      │ durasi   │
    │ jam_out    │      │ total_jam  │      │ created  │
    │ created_at │      │ aktivitas  │      │ updated  │
    │ updated_at │      │ status_app │      └──────────┘
    └────────────┘      │ created_at │
                        │ updated_at │
                        └────────────┘
```

### Relationships
- **Karyawan ↔ Absensi** (1:M) - One karyawan has many attendance records
- **Karyawan ↔ SKPL** (1:M) - One karyawan has many overtime requests
- **Shift** (Standalone) - Reference for time periods

---

## 🔑 Key Features Checklist

### Database
- [x] Schema designed
- [x] SQL script created
- [ ] Tables created in Supabase
- [ ] Indexes created
- [ ] Sample data inserted
- [ ] RLS policies set

### Backend API
- [x] API documentation written
- [x] Supabase client configured
- [x] Services implemented (CRUD)
- [ ] Error handling tested
- [ ] Data validation implemented
- [ ] Complex queries working

### Frontend Integration
- [ ] Stores connected to Supabase
- [ ] Karyawan management working
- [ ] Shift management working
- [ ] Attendance recording working
- [ ] SKPL form submission working
- [ ] SKPL approval workflow working

### Features
- [ ] Dashboard with KPIs
- [ ] Attendance calendar
- [ ] Monthly reports
- [ ] Export to Excel
- [ ] Search & filter
- [ ] Pagination

### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] API endpoint tests
- [ ] Data validation tests
- [ ] Edge cases handled

### Documentation
- [ ] API documentation
- [ ] Database schema documentation
- [ ] Setup guide
- [ ] User manual
- [ ] Code comments

---

## 💾 Database Constraints & Rules

### Value Constraints
- **Max Lemburan per Bulan:** 60 jam (business rule)
- **NIK:** Unique, required
- **Status Absensi:** Enum [hadir, lembur, sakit, izin]
- **Status SKPL:** Enum [pending, approved, rejected]
- **Jam Format:** HH:MM (24-hour format)

### Data Integrity
- **Referential Integrity:** Foreign keys enforce parent-child relationships
- **Unique Constraints:** NIK, (id_karyawan + tanggal) for absensi
- **Date Validation:** Tanggal tidak boleh masa depan untuk absensi
- **Time Validation:** jam_selesai > jam_mulai

---

## 🛡️ Security Considerations

1. **Row Level Security (RLS)** - Enabled on all tables
2. **Environment Variables** - Credentials in .env (never commit)
3. **Input Validation** - Server-side validation on all inputs
4. **Error Handling** - No sensitive info in error messages
5. **Audit Trail** - created_at, updated_at on all tables

---

## 📦 Technology Stack

- **Database:** PostgreSQL (Supabase)
- **API:** Supabase REST API + JavaScript SDK
- **Frontend:** React 19 + TypeScript
- **State Management:** Zustand
- **UI Library:** Lucide React, Recharts
- **Data Processing:** date-fns, XLSX
- **Build Tool:** Vite

---

## 🧪 Testing Strategy

| Type | Tool | Coverage |
|------|------|----------|
| API Testing | Thunder Client / Postman | All endpoints |
| Integration | Frontend ↔ Backend | Data flow |
| UI Testing | Manual QA | Forms, workflow |
| Data Validation | Unit tests | Input validation |
| Performance | Load testing | Response times |

---

## 📞 Support & Questions

- Database credentials in `.env`
- API docs in `API_DOCUMENTATION.md`
- Setup guide in `SETUP_DATABASE.md`
- Questions about business logic → confirm with client

---

## 📋 Sign-Off Criteria

- [ ] All US (User Stories) completed
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Zero critical bugs
- [ ] Performance acceptable
- [ ] Client QA passed
- [ ] Ready for production deployment

---

**Status:** ✅ Planning Complete - Ready for Development
**Last Updated:** February 19, 2026

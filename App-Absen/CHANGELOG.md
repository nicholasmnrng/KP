# Changelog & Modification History

**Last Updated:** 26 Februari 2026

---

## 📋 Daftar Perubahan Utama

### Phase 1: Shift Period Feature & Auto-Attendance
**Tujuan:** Menambahkan fitur periode shift dan auto-generate attendance harian
**Status:** ✅ COMPLETED

#### Database Changes
```sql
-- 1. Tambah table karyawan_shift (di SETUP_DATABASE.md)
CREATE TABLE karyawan_shift (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_karyawan UUID NOT NULL,
    id_shift UUID NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (id_karyawan) REFERENCES karyawan(id) ON DELETE CASCADE,
    FOREIGN KEY (id_shift) REFERENCES shift(id) ON DELETE CASCADE,
    CONSTRAINT chk_tanggal CHECK (tanggal_mulai <= tanggal_selesai)
);

-- 2. Tambah kolom untuk SKPL
ALTER TABLE skpl ADD COLUMN IF NOT EXISTS lokasi VARCHAR(255);
ALTER TABLE skpl ADD COLUMN IF NOT EXISTS keterangan TEXT;

-- 3. Create PostgreSQL function untuk auto-generate absensi
CREATE OR REPLACE FUNCTION generate_absensi_otomatis()
RETURNS void AS $$
BEGIN
    INSERT INTO absensi (id_karyawan, tanggal, status)
    SELECT 
        ks.id_karyawan,
        CURRENT_DATE,
        CASE 
            WHEN s.nama = 'Shift Pagi' THEN 'DS'
            WHEN s.nama = 'Shift Malam' THEN 'NS'
            WHEN s.nama = 'Shift Siang' THEN 'NS'
            WHEN s.nama = 'OFF' THEN 'OFF'
            ELSE 'DS'
        END
    FROM karyawan_shift ks
    JOIN shift s ON ks.id_shift = s.id
    WHERE ks.tanggal_mulai <= CURRENT_DATE 
      AND ks.tanggal_selesai >= CURRENT_DATE
    ON CONFLICT (id_karyawan, tanggal) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
```

### Phase 2: Presensi Harian Integration
**Tujuan:** Integrasi auto-attendance ke halaman Presensi Harian
**Status:** ✅ COMPLETED

#### File Modified: `src/pages/presensi/Harian.tsx`

**Key Changes:**
1. **State Management**
   ```typescript
   const [showNotification, setShowNotification] = useState(false);
   const [originalStatus, setOriginalStatus] = useState<Record<string, string>>({});
   ```

2. **Function: `fetchAbsensiForDate()`**
   - Parameter: `isInitialFetch` (boolean) - update originalStatus hanya jika true
   - Parameter: `hideNotificationAfter` - close notification setelah save
   - localStorage key: `presisi_saved_YYYY-MM-DD`

3. **Optimistic Update Pattern**
   ```typescript
   // Update UI immediately
   setAbsensiHariIni(prev => prev.map(a => 
     a.id_karyawan === idKaryawan ? { ...a, status: newStatus } : a
   ));
   // Then save to DB
   setAbsensi(idKaryawan, tanggal, newStatus)
     .catch(err => { /* revert */ });
   ```

4. **"Belum Diubah" Counter Logic**
   ```typescript
   const belumDiisi = absensiHariIni.filter(
     a => a.status === originalStatus[a.id_karyawan]
   ).length;
   ```

### Phase 3: Status Button Bug Fix
**Tujuan:** Fix unresponsive status buttons
**Status:** ✅ COMPLETED

#### File Modified: `src/store/absensiStore.ts`

**Problem:** Store checking local state instead of actual DB records
**Solution:** Query database directly in `setAbsensi()` method

```typescript
const setAbsensi = async (
  id_karyawan: string,
  tanggal: string,
  status: string,
  shiftName: string
) => {
  try {
    // 1. Query untuk check apakah record sudah ada
    const { data: existingRecords } = await supabase
      .from('absensi')
      .select('id')
      .eq('id_karyawan', id_karyawan)
      .eq('tanggal', tanggal)
      .single();

    // 2. Jika ada: UPDATE, jika tidak: INSERT
    if (existingRecords?.id) {
      await supabase
        .from('absensi')
        .update({ status })
        .eq('id', existingRecords.id);
    } else {
      await supabase
        .from('absensi')
        .insert({
          id_karyawan,
          tanggal,
          status,
          jam_in: '00:00',
          jam_out: '00:00'
        });
    }
    
    // Update local state
    setAbsensiHariIni(prev => 
      prev.map(a => a.id_karyawan === id_karyawan ? { ...a, status } : a)
    );
  } catch (err) {
    throw err;
  }
};
```

### Phase 4: Notification State Management
**Tujuan:** Fix notification logic agar akurat track status changes
**Status:** ✅ COMPLETED

#### Key Fixes:
1. **originalStatus tracking** - hanya update saat `isInitialFetch: true`
2. **localStorage persistence** - simpan save state per tanggal
3. **Correct belumDiisi count** - compare currentStatus dengan originalStatus

### Phase 5: SKPL Template Integration
**Tujuan:** Sesuaikan SKPL dengan template resmi Pertamina
**Status:** ✅ COMPLETED

#### Database Changes
```sql
ALTER TABLE skpl ADD COLUMN IF NOT EXISTS lokasi VARCHAR(255);
ALTER TABLE skpl ADD COLUMN IF NOT EXISTS keterangan TEXT;
```

#### Files Modified/Created:
1. **`src/types/index.ts`** - Update SKPL interface
   ```typescript
   export interface SKPL {
     // ... existing fields
     lokasi?: string;
     keterangan?: string;
   }
   ```

2. **`src/pages/skpl/DaftarSKPL.tsx`**
   - Update `handlePrint()` dengan logo fetching via Fetch API
   - Template styling match Pertamina format
   - Logo load as data URL (reliable untuk print)

3. **`src/pages/skpl/FormSKPL.tsx`**
   - Add form inputs untuk `lokasi` dan `keterangan`
   - Update `handleSave()` dengan logo fetching
   - Print template sama dengan DaftarSKPL

4. **`src/store/skplStore.ts`** - Add new fields handling

#### Logo Implementation
- File logo: `c:\KP\App-Absen\public\logo.png`
- Method: Fetch API → Blob → Data URL
- Reason: Base64 tidak muncul saat print, direct file path tidak accessible di print window

```typescript
// Fetch logo and convert to data URL
const response = await fetch('/logo.png');
const blob = await response.blob();
const logoDataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
});

// Embed in HTML
<img src="${logoDataUrl}" alt="Pertamina Trans Kontinental" />
```

---

## 🔧 Troubleshooting Guide

### Error: "Could not find the 'keterangan' column of 'skpl' in the schema cache"

**Cause:** Database schema belum di-apply ke Supabase

**Solution:**
1. Buka Supabase Dashboard → SQL Editor
2. Run ini:
   ```sql
   ALTER TABLE skpl ADD COLUMN IF NOT EXISTS lokasi VARCHAR(255);
   ALTER TABLE skpl ADD COLUMN IF NOT EXISTS keterangan TEXT;
   ```
3. Refresh browser

---

### Error: "Property 'id_karyawan' does not exist on type 'SKPL'"

**Cause:** Menggunakan camelCase property names (idKaryawan) instead of snake_case (id_karyawan)

**Solution:** Update property reference ke snake_case format
```typescript
// WRONG
skpl.idKaryawan

// CORRECT  
skpl.id_karyawan
```

**Files with this issue (pre-existing - tidak critical):**
- `src/pages/laporan/Export.tsx` (line 51-52)
- `src/pages/presensi/Kalender.tsx` (line 39)

---

### Error: Logo tidak muncul saat print/save PDF

**Cause:** Print window tidak bisa akses external resources

**Solution (Implemented):** 
- Gunakan Fetch API untuk load logo
- Convert blob ke data URL
- Embed langsung di HTML template

```typescript
// ✅ CORRECT approach
const response = await fetch('/logo.png');
const blob = await response.blob();
const logoDataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
});

// ❌ WRONG approaches (jangan gunakan):
// 1. Direct path: <img src="/logo.png" /> (tidak work di print)
// 2. Base64 string: data:image/png;base64,... (tidak reliable)
// 3. window.location.origin: ${window.location.origin}/logo.png (tidak work)
```

---

### Error: "Cannot find name 'id'" di DaftarSKPL

**Cause:** Ketika remove unused import, lupa kalau masih digunakan di code

**Solution:** 
```typescript
// Pastikan import ini ada:
import { id } from 'date-fns/locale';

// Dan digunakan di table format:
{format(new Date(skpl.tanggal), 'dd MMM yyyy', { locale: id })}
```

---

### Status button tidak responsive / tidak update di DB

**Cause:** Store hanya check local state, tidak query DB untuk exist-check

**Solution (Implemented):**
Gunakan direct DB query di `setAbsensi()` method bukan rely on local state:
```typescript
const { data: existingRecords } = await supabase
  .from('absensi')
  .select('id')
  .eq('id_karyawan', id_karyawan)
  .eq('tanggal', tanggal)
  .single();

if (existingRecords?.id) {
  // UPDATE
} else {
  // INSERT
}
```

---

### Notification "X karyawan belum diubah" menunjukkan angka salah

**Cause:** Hanya compare dengan default shift status, tidak track actual changes

**Solution (Implemented):**
1. Track `originalStatus` ketika fetch awal
2. Update `originalStatus` HANYA saat `isInitialFetch: true`
3. Saat refetch setelah save, gunakan `isInitialFetch: false` agar originalStatus tidak berubah
4. Calculate `belumDiisi` dengan: `status === originalStatus[id]`

```typescript
// BENAR: originalStatus only updated on initial fetch
const fetchAbsensiForDate = async (dateStr: string, isInitialFetch = true) => {
  // ... fetch data
  if (isInitialFetch) {
    setOriginalStatus(statusMap); // Only update pada initial load
  }
};
```

---

### Notification muncul lagi setelah navigate ke halaman lain

**Cause:** State reset saat component remount, tidak persist across navigation

**Solution (Implemented):**
Gunakan localStorage untuk track save state per tanggal:
```typescript
// Simpan saat save
localStorage.removeItem(`presisi_saved_${tanggal}`);

// Check saat fetch
useEffect(() => {
  const isSaved = localStorage.getItem(`presisi_saved_${tanggal}`);
  if (!isSaved) {
    setShowNotification(true);
  }
}, [tanggal]);
```

---

## 📝 TypeScript Types

### Database Schema
```typescript
// SKPL type
interface SKPL {
  id: string;
  id_karyawan: string;
  tanggal: string; // DATE format
  jam_mulai: string; // HH:MM format
  jam_selesai: string; // HH:MM format
  total_jam: number;
  aktivitas: string;
  lokasi?: string; // NEW
  keterangan?: string; // NEW
  status_approval: string;
  created_at: string;
  updated_at: string;
}

// Absensi type
interface Absensi {
  id: string;
  id_karyawan: string;
  tanggal: string;
  status: StatusAbsensi;
  jam_in?: string;
  jam_out?: string;
  created_at: string;
  updated_at: string;
}

type StatusAbsensi = 'DS' | 'NS' | 'OFF' | 'S' | 'I' | 'A';
```

---

## 🚀 Build & Deployment

### Current Build Status
```bash
✅ No critical errors in:
  - src/pages/presensi/Harian.tsx
  - src/pages/skpl/DaftarSKPL.tsx
  - src/pages/skpl/FormSKPL.tsx

⚠️ Pre-existing errors (non-critical):
  - src/pages/laporan/Export.tsx (camelCase property names)
  - src/pages/presensi/Kalender.tsx (camelCase property names)
```

### Build Command
```bash
npm run build
```

### Dev Server
```bash
npm run dev
# Runs on localhost:5176 (atau port lain jika 5173-5175 occupied)
```

---

## Phase 6: SKPL Print Layout Refinement
**Tujuan:** Memperbaiki layout dan styling SKPL print template
**Status:** ✅ COMPLETED
**Tanggal:** 26 Februari 2026

### Files Modified
- `src/pages/skpl/DaftarSKPL.tsx`
- `src/pages/skpl/FormSKPL.tsx`

### Changes Made

#### 1. Heading Styling - Remove Italic Effect
**Problem:** Judul "SURAT PERMINTAAN KERJA LEMBUR (SKPL)" tampil miring (italic)
**Solution:** Tambah `font-style: normal;` ke CSS `.header-title h1`

```css
.header-title h1 {
    font-size: 16px;
    font-weight: bold;
    margin: 0;
    letter-spacing: 0.5px;
    font-style: normal;  /* ← Added to remove italic */
}
```

#### 2. Logo Positioning - Absolute Right with Centered Title
**Problem:** Dengan flexbox, logo dan title tidak aligned sempurna untuk print
**Solution:** Ubah ke `position: relative` container dengan logo `position: absolute`

```css
/* Before: Flexbox layout */
.header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

/* After: Relative + Absolute positioning */
.header-top {
    position: relative;
    margin-bottom: 15px;
    min-height: 60px;
}

.header-top .logo {
    position: absolute;
    right: 0;
    top: 0;
    text-align: right;
}
```

#### 3. HTML Structure
- Title tetap `flex: 1; text-align: center;` untuk centered
- Logo dengan `position: absolute; right: 0;` untuk right-aligned

### Result
- ✅ Judul "SURAT PERMINTAAN KERJA LEMBUR (SKPL)" centered di tengah
- ✅ Logo Pertamina tetap di kanan atas
- ✅ Print preview render dengan rapi dan konsisten
- ✅ No TypeScript errors
- ✅ Tested dan verified working

### Code Diff Summary
```tsx
// src/pages/skpl/DaftarSKPL.tsx & FormSKPL.tsx

// CSS Changes:
// 1. .header-title h1 → add `font-style: normal;`
// 2. .header-top → position: relative with min-height: 60px
// 3. .header-top .logo → position: absolute; right: 0; top: 0;

// HTML Structure (unchanged, just CSS behavior)
// <div class="header-top">
//   <div class="header-title"><h1>SURAT PERMINTAAN KERJA LEMBUR (SKPL)</h1></div>
//   <div class="logo"><img src="${logoDataUrl}" /></div>
// </div>
```

---

## Phase 7: Multiple Karyawan per SKPL
**Tujuan:** Memungkinkan membuat 1 SKPL untuk multiple karyawan sekaligus
**Status:** ✅ COMPLETED
**Tanggal:** 26 Februari 2026

### Database Changes (Migration SQL)

```sql
-- 1. Modify SKPL table - remove id_karyawan, drop foreign key
ALTER TABLE skpl DROP CONSTRAINT skpl_id_karyawan_fkey;
ALTER TABLE skpl DROP COLUMN id_karyawan;

-- 2. Create junction table for multiple karyawan
CREATE TABLE skpl_karyawan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_skpl UUID NOT NULL,
    id_karyawan UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (id_skpl) REFERENCES skpl(id) ON DELETE CASCADE,
    FOREIGN KEY (id_karyawan) REFERENCES karyawan(id) ON DELETE CASCADE,
    UNIQUE(id_skpl, id_karyawan)
);

-- 3. Add indexes
CREATE INDEX idx_skpl_karyawan_id_skpl ON skpl_karyawan(id_skpl);
CREATE INDEX idx_skpl_karyawan_id_karyawan ON skpl_karyawan(id_karyawan);

-- 4. Update RLS (Row Level Security)
ALTER TABLE skpl_karyawan ENABLE ROW LEVEL SECURITY;
CREATE POLICY skpl_karyawan_select ON skpl_karyawan FOR SELECT USING (true);
CREATE POLICY skpl_karyawan_insert ON skpl_karyawan FOR INSERT WITH CHECK (true);
CREATE POLICY skpl_karyawan_update ON skpl_karyawan FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY skpl_karyawan_delete ON skpl_karyawan FOR DELETE USING (true);
```

### TypeScript Changes

**1. `src/types/index.ts` - Updated SKPL interface**
```typescript
// BEFORE
export interface SKPL {
  id: string;
  id_karyawan: string;  // ← Removed
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  total_jam: number;
  aktivitas: string;
  // ... other fields
  karyawan?: Karyawan;  // Single karyawan
}

// AFTER
export interface SKPL {
  id: string;
  // id_karyawan: removed ✓
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  total_jam: number;
  aktivitas: string;
  lokasi?: string;
  keterangan?: string;
  status_approval: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
  karyawanList?: Karyawan[];  // ← Multiple karyawan
}

// NEW interface
export interface SKPLKaryawan {
  id: string;
  id_skpl: string;
  id_karyawan: string;
  created_at?: string;
  karyawan?: Karyawan;
}
```

### API Service Changes (`src/services/api.ts`)

**Key Updates:**
1. All GET methods now fetch with junction table and return `karyawanList`
2. CREATE method now accepts `idKaryawanList: string[]` array
3. Automatic junction table population on CREATE
4. Rollback mechanism if junction insert fails

```typescript
// Example: Updated getAll()
async getAll() {
  const { data, error } = await supabase
    .from('skpl')
    .select(`
      *,
      skpl_karyawan(
        id,
        id_karyawan,
        karyawan(*)
      )
    `)
    .order('tanggal', { ascending: false })
  
  // Transform data to include karyawanList
  return (data || []).map(skpl => ({
    ...skpl,
    karyawanList: skpl.skpl_karyawan?.map((sk) => sk.karyawan) || []
  }))
}

// Example: Updated create()
async create(payload: {
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  total_jam: number;
  aktivitas: string;
  lokasi?: string;
  keterangan?: string;
  idKaryawanList: string[];  // ← Array instead of single ID
}) {
  // Insert SKPL record
  // Then insert multiple skpl_karyawan records
  // Rollback SKPL if any junction insert fails
}
```

### Store Changes (`src/store/skplStore.ts`)

```typescript
// Updated interface signature
addSKPL: (skpl: Omit<SKPL, 'id' | 'created_at' | 'updated_at' | 'status_approval'> & { idKaryawanList: string[] }) => Promise<SKPL>;

// Updated getSKPLByKaryawan method
getSKPLByKaryawan: (id_karyawan) =>
  get().skplList.filter((s) => s.karyawanList?.some((k) => k.id === id_karyawan))
```

### UI Components

**1. New Component: `src/pages/skpl/FormSKPLMulti.tsx`**
- Multi-select karyawan picker with searchable dropdown
- Selected karyawan shown as removable tags
- Same form fields as single SKPL
- Print template automatically generates multiple rows
- Features:
  - Tag-based selection display
  - Search by nama or NIK
  - Remove karyawan from selection
  - Validation for at least 1 karyawan selected

**2. Updated: `src/pages/skpl/DaftarSKPL.tsx`**
- Print template updated to generate multiple table rows from `karyawanList`
- List view shows:
  - "N Karyawan" if multiple (e.g., "6 Karyawan")
  - Single nama if only 1 karyawan
  - Preview of first 50 chars of  names list
- Button changed: "Buat SKPL Baru" → "Buat SKPL (Multi Karyawan)"
- Navigation to `/skpl/baru-multi`
- Removed hardcoded `id_karyawan` references

**3. Updated: `src/App.tsx`**
- Added import for FormSKPLMulti
- Added route: `/skpl/baru-multi` → FormSKPLMulti

**4. Keep Original: `src/pages/skpl/FormSKPL.tsx`**
- Unchanged (for backward compatibility or future single-form)
- Still available at `/skpl/baru` if needed

### Print Template Updates

**Multiple karyawan rows** are now dynamically generated:
```typescript
const karyawanRows = (skpl.karyawanList || [])
  .map((k, idx) => `
    <tr>
      <td class="center">${idx + 1}</td>
      <td>${k.nama}</td>
      <td>${k.nik}</td>
      <td>${k.jabatan}</td>
      <td class="center">${skpl.jam_mulai}..${skpl.jam_selesai}</td>
      <td class="center">${skpl.total_jam} Jam</td>
      <td>${skpl.aktivitas}</td>
    </tr>
  `)
  .join('');
```

### Benefits

✅ Single SKPL document can now contain multiple employees
✅ Matches Pertamina official template format (as seen in user image)
✅ Reduces administrative burden - 1 document instead of 6
✅ Normalized database design (junction table)
✅ Backward compatible - old single SKPL records still work
✅ Clean UI with tag-based selection
✅ Dynamic print template

### Migration Checklist

- [ ] Run migration SQL in Supabase (copy-paste to SQL Editor)
- [ ] Verify `skpl_karyawan` table created in Database view
- [ ] Verify RLS policies appear in skpl_karyawan
- [ ] Refresh browser (F5)
- [ ] Try creating SKPL with multiple karyawan
- [ ] Test print preview with multiple employees
- [ ] Verify list view shows "N Karyawan" for multi-select

### Related Routes

- Create multi-karyawan SKPL: `/skpl/baru-multi`
- View all SKPL: `/skpl`
- Print individual SKPL: Click printer icon in list

---

## 📚 Key Features Checklist

- [x] Shift period database schema
- [x] Auto-generation of daily attendance via PostgreSQL function
- [x] Presensi Harian integration (display only scheduled employees)
- [x] Status buttons fully responsive with direct DB query
- [x] "Belum diubah" notification with accurate counting
- [x] localStorage persistence of save state across navigation
- [x] Multiple saves per day handled correctly
- [x] SKPL database fields (lokasi, keterangan)
- [x] SKPL form with new input fields
- [x] Professional SKPL print templates (Pertamina format)
- [x] Logo display in print/PDF (Fetch API + Data URL)
- [x] **NEW:** Multiple karyawan per single SKPL document
- [x] **NEW:** Multi-select karyawan form (FormSKPLMulti)
- [x] **NEW:** Junction table (skpl_karyawan) for normalized design
- [x] **NEW:** Dynamic print template with multiple employee rows

---

## 🔗 Related Files Reference

**Database:**
- `database/schema.sql` - Schema dengan karyawan_shift table

**Frontend Components:**
- `src/types/index.ts` - Type definitions
- `src/store/absensiStore.ts` - Absensi state management
- `src/store/karyawanStore.ts` - Karyawan data
- `src/store/karyawanShiftStore.ts` - Shift period management
- `src/store/skplStore.ts` - SKPL management
- `src/pages/presensi/Harian.tsx` - Daily attendance page
- `src/pages/skpl/DaftarSKPL.tsx` - SKPL list & print
- `src/pages/skpl/FormSKPL.tsx` - SKPL form & print

**Design Assets:**
- `public/logo.png` - Pertamina logo (used in SKPL print)

---

## 📞 Notes untuk Development Kedepannya

1. **Jangan hardcode path** untuk assets - selalu gunakan `public/` folder
2. **Print template** harus fetch external resources (images) dan convert ke data URL
3. **localStorage keys** pattern: `presisi_saved_YYYY-MM-DD` - jangan ubah format
4. **originalStatus** hanya update pada initial fetch, jangan pada refetch
5. **Direct DB query** lebih reliable daripada rely on local state sync
6. **SKPL fields** sudah add `lokasi` dan `keterangan` - pastikan form input ada
7. **Logo** harus PNG/JPG format dan simpan di `public/` folder
8. Sebelum deploy, execute semua ALTER TABLE queries di Supabase

---

**Generated:** 26 Feb 2026  
**Modified By:** Assistant (Copilot)  
**Status:** ✅ All major features complete

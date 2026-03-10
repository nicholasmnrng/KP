# 📡 API Documentation - Sistem Informasi Lemburan

## Base URL
```
https://uftxasjmopgcierevmga.supabase.co/rest/v1
```

## Authentication
```
Headers: {
  "apikey": "sb_publishable_sDrGbuGo0TbDefqHufPvig_mohQLvgs",
  "Content-Type": "application/json"
}
```

---

## 🔹 KARYAWAN ENDPOINTS

### 1. Get All Karyawan
```
GET /karyawan
```
**Response:**
```json
[
  {
    "id": "uuid",
    "nik": "2024001",
    "nama": "Budi Santoso",
    "jabatan": "Operator",
    "departemen": "Operasional",
    "no_hp": "0812345678",
    "status_aktif": true,
    "created_at": "2024-02-19T10:00:00Z",
    "updated_at": "2024-02-19T10:00:00Z"
  }
]
```

### 2. Get Karyawan by ID
```
GET /karyawan?id=eq.{id}
```

### 3. Create Karyawan
```
POST /karyawan
Content-Type: application/json

{
  "nik": "2024004",
  "nama": "Rina Wijaya",
  "jabatan": "Admin",
  "departemen": "IT",
  "no_hp": "0812345681",
  "status_aktif": true
}
```

### 4. Update Karyawan
```
PATCH /karyawan?id=eq.{id}
Content-Type: application/json

{
  "nama": "Rina Updated",
  "jabatan": "Senior Admin"
}
```

### 5. Delete Karyawan
```
DELETE /karyawan?id=eq.{id}
```

---

## 🔹 SHIFT ENDPOINTS

### 1. Get All Shift
```
GET /shift
```

### 2. Create Shift
```
POST /shift
Content-Type: application/json

{
  "nama": "Shift Custom",
  "jam_mulai": "08:00",
  "jam_selesai": "16:00",
  "durasi_jam": 8
}
```

### 3. Update Shift
```
PATCH /shift?id=eq.{id}
Content-Type: application/json

{
  "jam_mulai": "09:00",
  "jam_selesai": "17:00"
}
```

### 4. Delete Shift
```
DELETE /shift?id=eq.{id}
```

---

## 🔹 ABSENSI ENDPOINTS

### 1. Get All Absensi
```
GET /absensi
```

### 2. Get Absensi by Karyawan
```
GET /absensi?id_karyawan=eq.{id_karyawan}
```

### 3. Get Absensi by Tanggal Range
```
GET /absensi?tanggal=gte.2024-02-01&tanggal=lte.2024-02-29
```

### 4. Create Absensi
```
POST /absensi
Content-Type: application/json

{
  "id_karyawan": "{uuid_karyawan}",
  "tanggal": "2024-02-19",
  "status": "hadir",
  "jam_in": "06:00",
  "jam_out": "14:00"
}
```

### 5. Update Absensi
```
PATCH /absensi?id=eq.{id}
Content-Type: application/json

{
  "status": "lembur",
  "jam_out": "22:00"
}
```

### 6. Delete Absensi
```
DELETE /absensi?id=eq.{id}
```

---

## 🔹 SKPL (PERMOHONAN LEMBURAN) ENDPOINTS

### 1. Get All SKPL
```
GET /skpl
```

### 2. Get SKPL by Karyawan
```
GET /skpl?id_karyawan=eq.{id_karyawan}
```

### 3. Get SKPL by Status
```
GET /skpl?status_approval=eq.pending
```

### 4. Create SKPL (Ajukan Permohonan Lemburan)
```
POST /skpl
Content-Type: application/json

{
  "id_karyawan": "{uuid_karyawan}",
  "tanggal": "2024-02-20",
  "jam_mulai": "14:00",
  "jam_selesai": "22:00",
  "total_jam": 8.0,
  "aktivitas": "Maintenance sistem database",
  "status_approval": "pending"
}
```

### 5. Update SKPL (Approve/Reject)
```
PATCH /skpl?id=eq.{id}
Content-Type: application/json

{
  "status_approval": "approved"
}
```
**Status options:** `pending`, `approved`, `rejected`

### 6. Delete SKPL
```
DELETE /skpl?id=eq.{id}
```

---

## 🔹 QUERY FILTERS & OPERATORS

| Operator | Contoh | Keterangan |
|----------|--------|-----------|
| `eq` | `id=eq.123` | Equal (sama dengan) |
| `neq` | `status=neq.rejected` | Not Equal |
| `gt` | `total_jam=gt.4` | Greater Than |
| `gte` | `total_jam=gte.8` | Greater or Equal |
| `lt` | `total_jam=lt.10` | Less Than |
| `lte` | `total_jam=lte.8` | Less or Equal |
| `in` | `status=in.(pending,approved)` | In List |
| `like` | `nama=like.%Budi%` | Pattern Match |

---

## 📊 COMPLEX QUERIES

### Get SKPL dengan Detail Karyawan
```
GET /skpl?select=*,karyawan(*)
```

### Get Absensi Lembur per Bulan
```
GET /absensi?status=eq.lembur&tanggal=gte.2024-02-01&tanggal=lte.2024-02-29
```

### Hitung Total Jam Lembur per Karyawan (Aggregation)
```
GET /skpl?select=id_karyawan,sum(total_jam)&status_approval=eq.approved&group_by=id_karyawan
```

---

## ⚠️ RESPONSE CODES

| Code | Meaning |
|------|---------|
| 200 | OK - Request berhasil |
| 201 | Created - Resource berhasil dibuat |
| 204 | No Content - Delete berhasil |
| 400 | Bad Request - Parameter invalid |
| 401 | Unauthorized - Auth diperlukan |
| 404 | Not Found - Resource tidak ditemukan |
| 409 | Conflict - Unique constraint violation |
| 500 | Server Error |

---

## 🛠️ JAVASCRIPT/TYPESCRIPT EXAMPLES

### Using Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://uftxasjmopgcierevmga.supabase.co',
  'sb_publishable_sDrGbuGo0TbDefqHufPvig_mohQLvgs'
)

// Get All Karyawan
const { data, error } = await supabase
  .from('karyawan')
  .select('*')

// Create SKPL
const { data, error } = await supabase
  .from('skpl')
  .insert({
    id_karyawan: 'uuid-karyawan',
    tanggal: '2024-02-20',
    jam_mulai: '14:00',
    jam_selesai: '22:00',
    total_jam: 8.0,
    aktivitas: 'Pekerjaan lembur',
    status_approval: 'pending'
  })

// Update SKPL Status
const { data, error } = await supabase
  .from('skpl')
  .update({ status_approval: 'approved' })
  .eq('id', 'skpl-id')
```

---

## 📝 LIMITATIONS

- Max 1000 rows per request (tanpa pagination)
- Rate limiting: 30 requests per minute
- Untuk data besar, gunakan `offset` dan `limit`:
  ```
  GET /karyawan?offset=0&limit=10
  ```

---

**Last Updated:** February 19, 2026

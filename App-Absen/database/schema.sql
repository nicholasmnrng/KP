-- ===================================
-- SISTEM INFORMASI LEMBURAN
-- Database Schema untuk Supabase
-- ===================================

-- 1. TABEL KARYAWAN
CREATE TABLE karyawan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nik VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(100) NOT NULL,
    jabatan VARCHAR(50) NOT NULL,
    departemen VARCHAR(50) NOT NULL,
    no_hp VARCHAR(15),
    status_aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABEL SHIFT
CREATE TABLE shift (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(50) NOT NULL UNIQUE,
    jam_mulai VARCHAR(5) NOT NULL,
    jam_selesai VARCHAR(5) NOT NULL,
    durasi_jam INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABEL KARYAWAN SHIFT (Periode Shift Karyawan)
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

-- 4. TABEL ABSENSI
CREATE TABLE absensi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_karyawan UUID NOT NULL,
    tanggal DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    jam_in VARCHAR(5),
    jam_out VARCHAR(5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (id_karyawan) REFERENCES karyawan(id) ON DELETE CASCADE,
    UNIQUE(id_karyawan, tanggal)
);

-- 4. TABEL SKPL (Surat Permohonan Lemburan)
-- Bisa contain multiple karyawan dalam 1 dokumen
CREATE TABLE skpl (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanggal DATE NOT NULL,
    jam_mulai VARCHAR(5) NOT NULL,
    jam_selesai VARCHAR(5) NOT NULL,
    total_jam FLOAT NOT NULL,
    aktivitas TEXT NOT NULL,
    lokasi VARCHAR(255),
    keterangan TEXT,
    status_approval VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABEL SKPL_KARYAWAN (Junction table untuk multiple karyawan per SKPL)
CREATE TABLE skpl_karyawan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_skpl UUID NOT NULL,
    id_karyawan UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (id_skpl) REFERENCES skpl(id) ON DELETE CASCADE,
    FOREIGN KEY (id_karyawan) REFERENCES karyawan(id) ON DELETE CASCADE,
    UNIQUE(id_skpl, id_karyawan)
);

-- ===================================
-- INDEXES untuk Performance
-- ===================================

CREATE INDEX idx_karyawan_shift_id_karyawan ON karyawan_shift(id_karyawan);
CREATE INDEX idx_karyawan_shift_id_shift ON karyawan_shift(id_shift);
CREATE INDEX idx_absensi_id_karyawan ON absensi(id_karyawan);
CREATE INDEX idx_absensi_tanggal ON absensi(tanggal);
CREATE INDEX idx_skpl_tanggal ON skpl(tanggal);
CREATE INDEX idx_skpl_status ON skpl(status_approval);
CREATE INDEX idx_skpl_karyawan_id_skpl ON skpl_karyawan(id_skpl);
CREATE INDEX idx_skpl_karyawan_id_karyawan ON skpl_karyawan(id_karyawan);

-- ===================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ===================================

ALTER TABLE karyawan ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift ENABLE ROW LEVEL SECURITY;
ALTER TABLE karyawan_shift ENABLE ROW LEVEL SECURITY;
ALTER TABLE absensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE skpl ENABLE ROW LEVEL SECURITY;
ALTER TABLE skpl_karyawan ENABLE ROW LEVEL SECURITY;

-- ===================================
-- RLS POLICIES
-- ===================================

-- Karyawan: Allow all authenticated users
CREATE POLICY karyawan_select ON karyawan FOR SELECT USING (true);
CREATE POLICY karyawan_insert ON karyawan FOR INSERT WITH CHECK (true);
CREATE POLICY karyawan_update ON karyawan FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY karyawan_delete ON karyawan FOR DELETE USING (true);

-- Shift: Allow all authenticated users
CREATE POLICY shift_select ON shift FOR SELECT USING (true);
CREATE POLICY shift_insert ON shift FOR INSERT WITH CHECK (true);
CREATE POLICY shift_update ON shift FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY shift_delete ON shift FOR DELETE USING (true);

-- Karyawan Shift: Allow all authenticated users
CREATE POLICY karyawan_shift_select ON karyawan_shift FOR SELECT USING (true);
CREATE POLICY karyawan_shift_insert ON karyawan_shift FOR INSERT WITH CHECK (true);
CREATE POLICY karyawan_shift_update ON karyawan_shift FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY karyawan_shift_delete ON karyawan_shift FOR DELETE USING (true);

-- Absensi: Allow all authenticated users
CREATE POLICY absensi_select ON absensi FOR SELECT USING (true);
CREATE POLICY absensi_insert ON absensi FOR INSERT WITH CHECK (true);
CREATE POLICY absensi_update ON absensi FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY absensi_delete ON absensi FOR DELETE USING (true);

-- SKPL: Allow all authenticated users
CREATE POLICY skpl_select ON skpl FOR SELECT USING (true);
CREATE POLICY skpl_insert ON skpl FOR INSERT WITH CHECK (true);
CREATE POLICY skpl_update ON skpl FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY skpl_delete ON skpl FOR DELETE USING (true);

-- SKPL Karyawan: Allow all authenticated users
CREATE POLICY skpl_karyawan_select ON skpl_karyawan FOR SELECT USING (true);
CREATE POLICY skpl_karyawan_insert ON skpl_karyawan FOR INSERT WITH CHECK (true);
CREATE POLICY skpl_karyawan_update ON skpl_karyawan FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY skpl_karyawan_delete ON skpl_karyawan FOR DELETE USING (true);

-- ===================================
-- SAMPLE DATA (Optional)
-- ===================================

INSERT INTO karyawan (nik, nama, jabatan, departemen, no_hp, status_aktif) VALUES
('2024001', 'Budi Santoso', 'Operator', 'Operasional', '0812345678', true),
('2024002', 'Siti Nur', 'Supervisor', 'Operasional', '0812345679', true),
('2024003', 'Ahmad Hidayat', 'Teknisi', 'Maintenance', '0812345680', true);

INSERT INTO shift (nama, jam_mulai, jam_selesai, durasi_jam) VALUES
('DS', '06:00', '14:00', 8),
('NS', '14:00', '22:00', 8),
('OFF', '00:00', '23:59', 0);

-- ===================================
-- FUNCTION: Generate Absensi Otomatis
-- ===================================
-- Function ini generate absensi otomatis berdasarkan periode shift karyawan
-- Dipanggil setiap tengah malam untuk hari berikutnya

CREATE OR REPLACE FUNCTION generate_absensi_otomatis(target_date DATE DEFAULT CURRENT_DATE + INTERVAL '1 day')
RETURNS json AS $$
DECLARE
    v_count INTEGER := 0;
    v_message TEXT;
BEGIN
    -- Insert absensi untuk karyawan yang terjadwal di target_date
    -- Status = mapping shift name to code (Shift Pagi -> DS, Shift Malam -> NS, Shift Siang -> NS, OFF -> OFF)
    INSERT INTO absensi (id_karyawan, tanggal, status)
    SELECT 
        k.id,
        target_date,
        CASE 
            WHEN s.nama ILIKE '%Pagi%' OR s.nama = 'DS' THEN 'DS'
            WHEN s.nama ILIKE '%Siang%' THEN 'NS'
            WHEN s.nama ILIKE '%Malam%' OR s.nama = 'NS' THEN 'NS'
            WHEN s.nama ILIKE '%OFF%' OR s.nama = 'OFF' THEN 'OFF'
            ELSE s.nama
        END as status_code
    FROM karyawan k
    INNER JOIN karyawan_shift ks ON k.id = ks.id_karyawan
    INNER JOIN shift s ON ks.id_shift = s.id
    WHERE k.status_aktif = true
        AND ks.tanggal_mulai <= target_date
        AND ks.tanggal_selesai >= target_date
    ON CONFLICT (id_karyawan, tanggal) DO NOTHING;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    v_message := 'Absensi otomatis generated untuk ' || target_date::TEXT || ' (' || v_count || ' records)';
    
    RETURN json_build_object(
        'success', true,
        'date', target_date,
        'generated_count', v_count,
        'message', v_message
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

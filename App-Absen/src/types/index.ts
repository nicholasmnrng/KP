// Status Absensi
// DS = Day Shift, NS = Night Shift, OFF = Libur, S = Sakit, I = Izin, A = Alpa
export type StatusAbsensi = 'DS' | 'NS' | 'OFF' | 'S' | 'I' | 'A';

export interface Karyawan {
  id: string;
  nik: string;
  nama: string;
  jabatan: string;
  departemen: string;
  no_hp: string;
  status_aktif: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Shift {
  id: string;
  nama: string;
  jam_mulai: string;
  jam_selesai: string;
  durasi_jam: number;
  created_at?: string;
  updated_at?: string;
}

export interface KaryawanShift {
  id: string;
  id_karyawan: string;
  id_shift: string;
  tanggal_mulai: string; // ISO date string YYYY-MM-DD
  tanggal_selesai: string; // ISO date string YYYY-MM-DD
  created_at?: string;
  updated_at?: string;
  shift?: Shift; // for joined data
}

export interface Absensi {
  id: string;
  id_karyawan: string;
  tanggal: string; // ISO date string YYYY-MM-DD
  status: StatusAbsensi;
  jam_in?: string;
  jam_out?: string;
  created_at?: string;
  updated_at?: string;
  karyawan?: Karyawan; // for joined data
}

export interface SKPL {
  id: string;
  tanggal: string; // ISO date string YYYY-MM-DD
  jam_mulai: string;
  jam_selesai: string;
  total_jam: number;
  aktivitas: string;
  lokasi?: string;
  keterangan?: string;
  status_approval: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
  karyawanList?: Karyawan[]; // for joined data
}

export interface SKPLKaryawan {
  id: string;
  id_skpl: string;
  id_karyawan: string;
  created_at?: string;
  karyawan?: Karyawan; // for joined data
}

export interface DashboardStats {
  totalAktif: number;
  hadirHariIni: number;
  absenHariIni: number;
  lemburHariIni: number;
  statusCount: Record<StatusAbsensi, number>;
}

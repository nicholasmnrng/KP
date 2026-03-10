import { create } from 'zustand';
import type { Absensi, StatusAbsensi } from '../types';
import { absensiService } from '../services/api';
import { supabase } from '../services/supabaseClient';

interface AbsensiStore {
    absensiList: Absensi[];
    loading: boolean;
    error: string | null;
    fetchAbsensi: () => Promise<void>;
    fetchAbsensiByKaryawan: (id_karyawan: string) => Promise<void>;
    fetchAbsensiByDateRange: (id_karyawan: string, startDate: string, endDate: string) => Promise<void>;
    setAbsensi: (id_karyawan: string, tanggal: string, status: StatusAbsensi, jam_in?: string, jam_out?: string) => Promise<void>;
    updateAbsensi: (id: string, updates: Partial<Absensi>) => Promise<void>;
    deleteAbsensi: (id: string) => Promise<void>;
    getAbsensiByTanggal: (tanggal: string) => Absensi[];
    getAbsensiByKaryawan: (id_karyawan: string) => Absensi[];
    getAbsensiByKaryawanAndBulan: (id_karyawan: string, year: number, month: number) => Absensi[];
    getAbsensiByBulan: (year: number, month: number) => Absensi[];
    getStatusByKaryawanAndTanggal: (id_karyawan: string, tanggal: string) => StatusAbsensi | null;
}

export const useAbsensiStore = create<AbsensiStore>((set, get) => ({
    absensiList: [],
    loading: false,
    error: null,

    fetchAbsensi: async () => {
        set({ loading: true, error: null });
        try {
            const data = await absensiService.getAll();
            set({ absensiList: data || [], loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    fetchAbsensiByKaryawan: async (id_karyawan) => {
        set({ loading: true, error: null });
        try {
            const data = await absensiService.getByKaryawan(id_karyawan);
            set({ absensiList: data || [], loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    fetchAbsensiByDateRange: async (id_karyawan, startDate, endDate) => {
        set({ loading: true, error: null });
        try {
            const data = await absensiService.getByDateRange(id_karyawan, startDate, endDate);
            set({ absensiList: data || [], loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    setAbsensi: async (id_karyawan, tanggal, status, jam_in, jam_out) => {
        set({ loading: true, error: null });
        try {
            // First try to fetch existing record from database
            const { data: existingRecords, error: fetchError } = await supabase
                .from('absensi')
                .select('id')
                .eq('id_karyawan', id_karyawan)
                .eq('tanggal', tanggal)
                .limit(1);
            
            if (fetchError) throw new Error(fetchError.message);

            let result: Absensi;
            if (existingRecords && existingRecords.length > 0) {
                // UPDATE existing absensi
                result = await absensiService.update(existingRecords[0].id, {
                    status,
                    jam_in,
                    jam_out,
                });
                set((state) => ({
                    absensiList: state.absensiList.map((a) =>
                        a.id === existingRecords[0].id ? { ...a, ...result } : a
                    ),
                    loading: false,
                }));
            } else {
                // CREATE new absensi
                result = await absensiService.create({
                    id_karyawan,
                    tanggal,
                    status,
                    jam_in,
                    jam_out,
                });
                set((state) => ({
                    absensiList: [...state.absensiList, result],
                    loading: false,
                }));
            }
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
        }
    },

    updateAbsensi: async (id, updates) => {
        set({ loading: true, error: null });
        try {
            const updated = await absensiService.update(id, updates);
            set((state) => ({
                absensiList: state.absensiList.map((a) =>
                    a.id === id ? { ...a, ...updated } : a
                ),
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
        }
    },

    deleteAbsensi: async (id) => {
        set({ loading: true, error: null });
        try {
            await absensiService.delete(id);
            set((state) => ({
                absensiList: state.absensiList.filter((item) => item.id !== id),
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
        }
    },

    getAbsensiByTanggal: (tanggal) =>
        get().absensiList.filter((a) => a.tanggal === tanggal),

    getAbsensiByKaryawan: (id_karyawan) =>
        get().absensiList.filter((a) => a.id_karyawan === id_karyawan),

    getAbsensiByKaryawanAndBulan: (id_karyawan, year, month) =>
        get().absensiList.filter((a) => {
            const d = new Date(a.tanggal);
            return (
                a.id_karyawan === id_karyawan &&
                d.getFullYear() === year &&
                d.getMonth() + 1 === month
            );
        }),

    getAbsensiByBulan: (year, month) =>
        get().absensiList.filter((a) => {
            const d = new Date(a.tanggal);
            return d.getFullYear() === year && d.getMonth() + 1 === month;
        }),

    getStatusByKaryawanAndTanggal: (id_karyawan, tanggal) => {
        const found = get().absensiList.find(
            (a) => a.id_karyawan === id_karyawan && a.tanggal === tanggal
        );
        return found ? found.status : null;
    },
}));

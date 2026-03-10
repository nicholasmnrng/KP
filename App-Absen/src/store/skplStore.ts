import { create } from 'zustand';
import type { SKPL } from '../types';
import { skplService } from '../services/api';

interface SKPLStore {
    skplList: SKPL[];
    loading: boolean;
    error: string | null;
    fetchSKPL: () => Promise<void>;
    fetchSKPLByKaryawan: (id_karyawan: string) => Promise<void>;
    fetchSKPLPending: () => Promise<void>;
    fetchSKPLByDateRange: (startDate: string, endDate: string) => Promise<void>;
    addSKPL: (skpl: Omit<SKPL, 'id' | 'created_at' | 'updated_at' | 'status_approval'> & { idKaryawanList: string[] }) => Promise<SKPL>;
    updateSKPL: (id: string, updates: Partial<SKPL>) => Promise<void>;
    approveSKPL: (id: string) => Promise<void>;
    rejectSKPL: (id: string) => Promise<void>;
    deleteSKPL: (id: string) => Promise<void>;
    getSKPLByKaryawan: (id_karyawan: string) => SKPL[];
    getSKPLByBulan: (year: number, month: number) => SKPL[];
    getSKPLByTanggal: (tanggal: string) => SKPL[];
    getTotalLemburanThisMonth: (id_karyawan: string) => Promise<{ total_jam: number; remaining: number; exceeded: boolean }>;
}

export const useSKPLStore = create<SKPLStore>((set, get) => ({
    skplList: [],
    loading: false,
    error: null,

    fetchSKPL: async () => {
        set({ loading: true, error: null });
        try {
            const data = await skplService.getAll();
            set({ skplList: data || [], loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    fetchSKPLByKaryawan: async (id_karyawan) => {
        set({ loading: true, error: null });
        try {
            const data = await skplService.getByKaryawan(id_karyawan);
            set({ skplList: data || [], loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    fetchSKPLPending: async () => {
        set({ loading: true, error: null });
        try {
            const data = await skplService.getPending();
            set({ skplList: data || [], loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    fetchSKPLByDateRange: async (startDate, endDate) => {
        set({ loading: true, error: null });
        try {
            const data = await skplService.getByDateRange(startDate, endDate);
            set({ skplList: data || [], loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    addSKPL: async (skpl) => {
        set({ loading: true, error: null });
        try {
            const newSKPL = await skplService.create({
                ...skpl,
                idKaryawanList: skpl.idKaryawanList || [],
            });
            set((state) => ({
                skplList: [...state.skplList, newSKPL],
                loading: false,
            }));
            return newSKPL;
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
        }
    },

    updateSKPL: async (id, updates) => {
        set({ loading: true, error: null });
        try {
            const updated = await skplService.update(id, updates);
            set((state) => ({
                skplList: state.skplList.map((s) =>
                    s.id === id ? { ...s, ...updated } : s
                ),
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
        }
    },

    approveSKPL: async (id) => {
        set({ loading: true, error: null });
        try {
            await skplService.approve(id);
            set((state) => ({
                skplList: state.skplList.map((s) =>
                    s.id === id ? { ...s, status_approval: 'approved' } : s
                ),
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
        }
    },

    rejectSKPL: async (id) => {
        set({ loading: true, error: null });
        try {
            await skplService.reject(id);
            set((state) => ({
                skplList: state.skplList.map((s) =>
                    s.id === id ? { ...s, status_approval: 'rejected' } : s
                ),
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
        }
    },

    deleteSKPL: async (id) => {
        set({ loading: true, error: null });
        try {
            await skplService.delete(id);
            set((state) => ({
                skplList: state.skplList.filter((s) => s.id !== id),
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
        }
    },

    getSKPLByKaryawan: (id_karyawan) =>
        get().skplList.filter((s) => s.karyawanList?.some((k) => k.id === id_karyawan)),

    getSKPLByBulan: (year, month) =>
        get().skplList.filter((s) => {
            const d = new Date(s.tanggal);
            return d.getFullYear() === year && d.getMonth() + 1 === month;
        }),

    getSKPLByTanggal: (tanggal) =>
        get().skplList.filter((s) => s.tanggal === tanggal),

    getTotalLemburanThisMonth: async (id_karyawan) => {
        try {
            return await skplService.getTotalLemburanThisMonth(id_karyawan);
        } catch (error) {
            console.error('Failed to get total lemburan:', error);
            return { total_jam: 0, remaining: 60, exceeded: false };
        }
    },
}));

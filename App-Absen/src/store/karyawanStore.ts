import { create } from 'zustand';
import type { Karyawan } from '../types';
import { karyawanService } from '../services/api';

interface KaryawanStore {
    karyawanList: Karyawan[];
    loading: boolean;
    error: string | null;
    fetchKaryawan: () => Promise<void>;
    addKaryawan: (k: Omit<Karyawan, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    updateKaryawan: (id: string, k: Partial<Karyawan>) => Promise<void>;
    deleteKaryawan: (id: string) => Promise<void>;
    getKaryawanById: (id: string) => Karyawan | undefined;
    getAktifList: () => Karyawan[];
}

export const useKaryawanStore = create<KaryawanStore>((set, get) => ({
    karyawanList: [],
    loading: false,
    error: null,

    fetchKaryawan: async () => {
        set({ loading: true, error: null });
        try {
            const data = await karyawanService.getAll();
            set({ karyawanList: data || [], loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    addKaryawan: async (k) => {
        set({ loading: true, error: null });
        try {
            const newKaryawan = await karyawanService.create(k);
            set((state) => ({
                karyawanList: [...state.karyawanList, newKaryawan],
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
        }
    },

    updateKaryawan: async (id, k) => {
        set({ loading: true, error: null });
        try {
            const updated = await karyawanService.update(id, k);
            set((state) => ({
                karyawanList: state.karyawanList.map((item) =>
                    item.id === id ? { ...item, ...updated } : item
                ),
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
        }
    },

    deleteKaryawan: async (id) => {
        set({ loading: true, error: null });
        try {
            await karyawanService.delete(id);
            set((state) => ({
                karyawanList: state.karyawanList.filter((item) => item.id !== id),
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
        }
    },

    getKaryawanById: (id) => get().karyawanList.find((k) => k.id === id),
    getAktifList: () => get().karyawanList.filter((k) => k.status_aktif),
}));

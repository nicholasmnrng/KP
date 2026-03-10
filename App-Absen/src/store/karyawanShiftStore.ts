import { create } from 'zustand';
import type { KaryawanShift } from '../types';
import { karyawanShiftService } from '../services/api';

interface KaryawanShiftStore {
    shiftList: KaryawanShift[];
    loading: boolean;
    error: string | null;
    fetchByKaryawan: (id_karyawan: string) => Promise<void>;
    addShift: (shift: Omit<KaryawanShift, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    updateShift: (id: string, shift: Partial<Omit<KaryawanShift, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
    deleteShift: (id: string) => Promise<void>;
    addShiftBulk: (shifts: Array<Omit<KaryawanShift, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
    deleteShiftByDateRange: (id_karyawan: string, startDate: string, endDate: string) => Promise<void>;
    getShiftById: (id: string) => KaryawanShift | undefined;
    clearShiftList: () => void;
}

export const useKaryawanShiftStore = create<KaryawanShiftStore>((set, get) => ({
    shiftList: [],
    loading: false,
    error: null,

    fetchByKaryawan: async (id_karyawan) => {
        set({ loading: true, error: null });
        try {
            const data = await karyawanShiftService.getByKaryawan(id_karyawan);
            set({ shiftList: data || [], loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    addShift: async (shift) => {
        set({ loading: true, error: null });
        try {
            const newShift = await karyawanShiftService.create(shift);
            set((state) => ({
                shiftList: [...state.shiftList, newShift],
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
        }
    },

    updateShift: async (id, shift) => {
        set({ loading: true, error: null });
        try {
            const updated = await karyawanShiftService.update(id, shift);
            set((state) => ({
                shiftList: state.shiftList.map((item) =>
                    item.id === id ? { ...item, ...updated } : item
                ),
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
        }
    },

    deleteShift: async (id) => {
        set({ loading: true, error: null });
        try {
            await karyawanShiftService.delete(id);
            set((state) => ({
                shiftList: state.shiftList.filter((item) => item.id !== id),
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
        }
    },

    addShiftBulk: async (shifts) => {
        set({ loading: true, error: null });
        try {
            const newShifts = await karyawanShiftService.createBulk(shifts as any);
            set((state) => ({
                shiftList: [...state.shiftList, ...newShifts],
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
        }
    },

    deleteShiftByDateRange: async (id_karyawan, startDate, endDate) => {
        set({ loading: true, error: null });
        try {
            await karyawanShiftService.deleteByDateRange(id_karyawan, startDate, endDate);
            set((state) => ({
                shiftList: state.shiftList.filter((item) =>
                    !(item.id_karyawan === id_karyawan &&
                      item.tanggal_mulai <= endDate &&
                      item.tanggal_selesai >= startDate)
                ),
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
        }
    },

    getShiftById: (id) => get().shiftList.find((s) => s.id === id),

    clearShiftList: () => set({ shiftList: [], error: null }),
}));

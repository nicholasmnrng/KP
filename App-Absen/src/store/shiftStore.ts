import { create } from 'zustand';
import type { Shift } from '../types';
import { shiftService } from '../services/api';

interface ShiftStore {
    shifts: Shift[];
    loading: boolean;
    error: string | null;
    fetchShifts: () => Promise<void>;
    addShift: (shift: Omit<Shift, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    updateShift: (id: string, shift: Partial<Shift>) => Promise<void>;
    deleteShift: (id: string) => Promise<void>;
    getShiftByNama: (nama: string) => Shift | undefined;
}

export const useShiftStore = create<ShiftStore>((set, get) => ({
    shifts: [],
    loading: false,
    error: null,

    fetchShifts: async () => {
        set({ loading: true, error: null });
        try {
            const data = await shiftService.getAll();
            set({ shifts: data || [], loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    addShift: async (shift) => {
        set({ loading: true, error: null });
        try {
            const newShift = await shiftService.create(shift);
            set((state) => ({
                shifts: [...state.shifts, newShift],
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
            const updated = await shiftService.update(id, shift);
            set((state) => ({
                shifts: state.shifts.map((s) => (s.id === id ? { ...s, ...updated } : s)),
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
            await shiftService.delete(id);
            set((state) => ({
                shifts: state.shifts.filter((s) => s.id !== id),
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            throw error;
        }
    },

    getShiftByNama: (nama) => get().shifts.find((s) => s.nama.includes(nama)),
}));

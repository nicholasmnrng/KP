import { useEffect } from 'react'
import { useKaryawanStore } from '../store/karyawanStore'
import { useShiftStore } from '../store/shiftStore'
import { useAbsensiStore } from '../store/absensiStore'
import { useSKPLStore } from '../store/skplStore'

/**
 * Hook untuk initialize semua stores dengan data dari Supabase
 * Jalankan ini satu kali di App.tsx saat app mount
 */
export const useInitStores = () => {
  const fetchKaryawan = useKaryawanStore((state) => state.fetchKaryawan)
  const fetchShifts = useShiftStore((state) => state.fetchShifts)
  const fetchAbsensi = useAbsensiStore((state) => state.fetchAbsensi)
  const fetchSKPL = useSKPLStore((state) => state.fetchSKPL)

  useEffect(() => {
    const initializeStores = async () => {
      try {
        // Load semua data parallel
        await Promise.all([
          fetchKaryawan(),
          fetchShifts(),
          fetchAbsensi(),
          fetchSKPL(),
        ])
      } catch (error) {
        console.error('Failed to initialize stores:', error)
      }
    }

    initializeStores()
  }, [fetchKaryawan, fetchShifts, fetchAbsensi, fetchSKPL])
}

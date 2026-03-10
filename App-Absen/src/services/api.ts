import { supabase } from './supabaseClient'

// ===================================
// KARYAWAN SERVICES
// ===================================

export const karyawanService = {
  // Get all karyawan
  async getAll() {
    const { data, error } = await supabase
      .from('karyawan')
      .select('*')
      .order('nama')
    
    if (error) throw new Error(error.message)
    return data
  },

  // Get karyawan by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('karyawan')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw new Error(error.message)
    return data
  },

  // Get karyawan by NIK
  async getByNik(nik: string) {
    const { data, error } = await supabase
      .from('karyawan')
      .select('*')
      .eq('nik', nik)
      .single()
    
    if (error) throw new Error(error.message)
    return data
  },

  // Get active karyawan only
  async getActive() {
    const { data, error } = await supabase
      .from('karyawan')
      .select('*')
      .eq('status_aktif', true)
      .order('nama')
    
    if (error) throw new Error(error.message)
    return data
  },

  // Create karyawan
  async create(payload: {
    nik: string
    nama: string
    jabatan: string
    departemen: string
    no_hp?: string
    status_aktif?: boolean
  }) {
    const { data, error } = await supabase
      .from('karyawan')
      .insert([payload])
      .select()
    
    if (error) throw new Error(error.message)
    return data[0]
  },

  // Update karyawan
  async update(id: string, payload: Partial<{
    nik: string
    nama: string
    jabatan: string
    departemen: string
    no_hp?: string
    status_aktif?: boolean
  }>) {
    const { data, error } = await supabase
      .from('karyawan')
      .update(payload)
      .eq('id', id)
      .select()
    
    if (error) throw new Error(error.message)
    return data[0]
  },

  // Delete karyawan
  async delete(id: string) {
    const { error } = await supabase
      .from('karyawan')
      .delete()
      .eq('id', id)
    
    if (error) throw new Error(error.message)
    return true
  }
}

// ===================================
// SHIFT SERVICES
// ===================================

export const shiftService = {
  // Get all shift
  async getAll() {
    const { data, error } = await supabase
      .from('shift')
      .select('*')
      .order('nama')
    
    if (error) throw new Error(error.message)
    return data
  },

  // Get shift by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('shift')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw new Error(error.message)
    return data
  },

  // Create shift
  async create(payload: {
    nama: string
    jam_mulai: string
    jam_selesai: string
    durasi_jam: number
  }) {
    const { data, error } = await supabase
      .from('shift')
      .insert([payload])
      .select()
    
    if (error) throw new Error(error.message)
    return data[0]
  },

  // Update shift
  async update(id: string, payload: Partial<{
    nama: string
    jam_mulai: string
    jam_selesai: string
    durasi_jam: number
  }>) {
    const { data, error } = await supabase
      .from('shift')
      .update(payload)
      .eq('id', id)
      .select()
    
    if (error) throw new Error(error.message)
    return data[0]
  },

  // Delete shift
  async delete(id: string) {
    const { error } = await supabase
      .from('shift')
      .delete()
      .eq('id', id)
    
    if (error) throw new Error(error.message)
    return true
  }
}

// ===================================
// ABSENSI SERVICES
// ===================================

export const absensiService = {
  // Get all absensi
  async getAll() {
    const { data, error } = await supabase
      .from('absensi')
      .select('*, karyawan(*)')
      .order('tanggal', { ascending: false })
    
    if (error) throw new Error(error.message)
    return data
  },

  // Get absensi by karyawan
  async getByKaryawan(id_karyawan: string) {
    const { data, error } = await supabase
      .from('absensi')
      .select('*')
      .eq('id_karyawan', id_karyawan)
      .order('tanggal', { ascending: false })
    
    if (error) throw new Error(error.message)
    return data
  },

  // Get absensi by date range
  async getByDateRange(id_karyawan: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('absensi')
      .select('*')
      .eq('id_karyawan', id_karyawan)
      .gte('tanggal', startDate)
      .lte('tanggal', endDate)
      .order('tanggal', { ascending: false })
    
    if (error) throw new Error(error.message)
    return data
  },

  // Get absensi by status
  async getByStatus(status: string) {
    const { data, error } = await supabase
      .from('absensi')
      .select('*, karyawan(*)')
      .eq('status', status)
      .order('tanggal', { ascending: false })
    
    if (error) throw new Error(error.message)
    return data
  },

  // Create absensi
  async create(payload: {
    id_karyawan: string
    tanggal: string
    status: string
    jam_in?: string
    jam_out?: string
  }) {
    const { data, error } = await supabase
      .from('absensi')
      .insert([payload])
      .select()
    
    if (error) throw new Error(error.message)
    return data[0]
  },

  // Update absensi
  async update(id: string, payload: Partial<{
    status: string
    jam_in?: string
    jam_out?: string
  }>) {
    const { data, error } = await supabase
      .from('absensi')
      .update(payload)
      .eq('id', id)
      .select()
    
    if (error) throw new Error(error.message)
    return data[0]
  },

  // Delete absensi
  async delete(id: string) {
    const { error } = await supabase
      .from('absensi')
      .delete()
      .eq('id', id)
    
    if (error) throw new Error(error.message)
    return true
  },

  // Generate absensi otomatis untuk hari tertentu (based on periode shift)
  async generateOtomatis(targetDate?: string) {
    const { data, error } = await supabase
      .rpc('generate_absensi_otomatis', {
        target_date: targetDate || new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow by default
      })
    
    if (error) throw new Error(error.message)
    return data
  },

  // Generate absensi otomatis + fetch untuk tanggal tertentu
  async generateAndFetchForDate(tanggal: string) {
    // Trigger generate function
    await this.generateOtomatis(tanggal)
    
    // Fetch absensi untuk tanggal itu dengan data karyawan
    const { data, error } = await supabase
      .from('absensi')
      .select('*, karyawan(*)')
      .eq('tanggal', tanggal)
      .order('karyawan(nama)')
    
    if (error) throw new Error(error.message)
    return data
  }
}

// ===================================
// KARYAWAN SHIFT SERVICES
// ===================================

export const karyawanShiftService = {
  // Get all karyawan shift
  async getAll() {
    const { data, error } = await supabase
      .from('karyawan_shift')
      .select('*, shift(*)')
      .order('tanggal_mulai', { ascending: false })
    
    if (error) throw new Error(error.message)
    return data
  },

  // Get shift by karyawan
  async getByKaryawan(id_karyawan: string) {
    const { data, error } = await supabase
      .from('karyawan_shift')
      .select('*, shift(*)')
      .eq('id_karyawan', id_karyawan)
      .order('tanggal_mulai', { ascending: false })
    
    if (error) throw new Error(error.message)
    return data
  },

  // Get shift by karyawan and date
  async getByKaryawanAndDate(id_karyawan: string, tanggal: string) {
    const { data, error } = await supabase
      .from('karyawan_shift')
      .select('*, shift(*)')
      .eq('id_karyawan', id_karyawan)
      .lte('tanggal_mulai', tanggal)
      .gte('tanggal_selesai', tanggal)
    
    if (error) throw new Error(error.message)
    return data
  },

  // Create karyawan shift
  async create(payload: {
    id_karyawan: string
    id_shift: string
    tanggal_mulai: string
    tanggal_selesai: string
  }) {
    const { data, error } = await supabase
      .from('karyawan_shift')
      .insert([payload])
      .select('*, shift(*)')
    
    if (error) throw new Error(error.message)
    return data[0]
  },

  // Update karyawan shift
  async update(id: string, payload: Partial<{
    id_shift: string
    tanggal_mulai: string
    tanggal_selesai: string
  }>) {
    const { data, error } = await supabase
      .from('karyawan_shift')
      .update(payload)
      .eq('id', id)
      .select('*, shift(*)')
    
    if (error) throw new Error(error.message)
    return data[0]
  },

  // Delete karyawan shift
  async delete(id: string) {
    const { error } = await supabase
      .from('karyawan_shift')
      .delete()
      .eq('id', id)
    
    if (error) throw new Error(error.message)
    return true
  },

  // Create multiple karyawan shifts (bulk insert)
  async createBulk(payloads: Array<{
    id_karyawan: string
    id_shift: string
    tanggal_mulai: string
    tanggal_selesai: string
  }>) {
    const { data, error } = await supabase
      .from('karyawan_shift')
      .insert(payloads)
      .select('*, shift(*)')
    
    if (error) throw new Error(error.message)
    return data || []
  },

  // Delete karyawan shifts by date range
  async deleteByDateRange(id_karyawan: string, startDate: string, endDate: string) {
    const { error } = await supabase
      .from('karyawan_shift')
      .delete()
      .eq('id_karyawan', id_karyawan)
      .lte('tanggal_mulai', endDate)
      .gte('tanggal_selesai', startDate)
    
    if (error) throw new Error(error.message)
    return true
  }
}

// ===================================
// SKPL SERVICES (Surat Permohonan Lemburan)
// ===================================

export const skplService = {
  // Get all SKPL with karyawan
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
    
    if (error) throw new Error(error.message)
    
    // Transform data to include karyawanList
    return (data || []).map(skpl => ({
      ...skpl,
      karyawanList: skpl.skpl_karyawan?.map((sk: any) => sk.karyawan) || []
    }))
  },

  // Get SKPL by karyawan
  async getByKaryawan(id_karyawan: string) {
    const { data, error } = await supabase
      .from('skpl_karyawan')
      .select(`
        id_skpl,
        skpl(
          *,
          skpl_karyawan(
            id,
            id_karyawan,
            karyawan(*)
          )
        )
      `)
      .eq('id_karyawan', id_karyawan)
    
    if (error) throw new Error(error.message)
    
    return (data || []).map((item: any) => ({
      ...item.skpl,
      karyawanList: item.skpl.skpl_karyawan?.map((sk: any) => sk.karyawan) || []
    }))
  },

  // Get SKPL by status
  async getByStatus(status: string) {
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
      .eq('status_approval', status)
      .order('tanggal', { ascending: false })
    
    if (error) throw new Error(error.message)
    
    return (data || []).map(skpl => ({
      ...skpl,
      karyawanList: skpl.skpl_karyawan?.map((sk: any) => sk.karyawan) || []
    }))
  },

  // Get SKPL pending only
  async getPending() {
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
      .eq('status_approval', 'pending')
      .order('tanggal', { ascending: false })
    
    if (error) throw new Error(error.message)
    
    return (data || []).map(skpl => ({
      ...skpl,
      karyawanList: skpl.skpl_karyawan?.map((sk: any) => sk.karyawan) || []
    }))
  },

  // Get SKPL by date range
  async getByDateRange(startDate: string, endDate: string) {
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
      .gte('tanggal', startDate)
      .lte('tanggal', endDate)
      .order('tanggal', { ascending: false })
    
    if (error) throw new Error(error.message)
    
    return (data || []).map(skpl => ({
      ...skpl,
      karyawanList: skpl.skpl_karyawan?.map((sk: any) => sk.karyawan) || []
    }))
  },

  // Create SKPL with multiple karyawan
  async create(payload: {
    tanggal: string
    jam_mulai: string
    jam_selesai: string
    total_jam: number
    aktivitas: string
    lokasi?: string
    keterangan?: string
    idKaryawanList: string[] // Array of karyawan IDs
  }) {
    const { data: skplData, error: skplError } = await supabase
      .from('skpl')
      .insert([{
        tanggal: payload.tanggal,
        jam_mulai: payload.jam_mulai,
        jam_selesai: payload.jam_selesai,
        total_jam: payload.total_jam,
        aktivitas: payload.aktivitas,
        lokasi: payload.lokasi,
        keterangan: payload.keterangan,
        status_approval: 'pending'
      }])
      .select()
    
    if (skplError) throw new Error(skplError.message)
    
    const skplId = skplData[0].id
    
    // Insert karyawan relationships
    const skplKaryawanData = payload.idKaryawanList.map(id_karyawan => ({
      id_skpl: skplId,
      id_karyawan
    }))
    
    const { error: relError } = await supabase
      .from('skpl_karyawan')
      .insert(skplKaryawanData)
    
    if (relError) {
      // Rollback: delete the created SKPL
      await supabase.from('skpl').delete().eq('id', skplId)
      throw new Error(relError.message)
    }
    
    // Fetch full data
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
      .eq('id', skplId)
      .single()
    
    if (error) throw new Error(error.message)
    
    return {
      ...data,
      karyawanList: data.skpl_karyawan?.map((sk: any) => sk.karyawan) || []
    }
  },

  // Update SKPL
  async update(id: string, payload: Partial<{
    status_approval: string
    aktivitas: string
  }>) {
    const { data, error } = await supabase
      .from('skpl')
      .update(payload)
      .eq('id', id)
      .select()
    
    if (error) throw new Error(error.message)
    return data[0]
  },

  // Approve SKPL
  async approve(id: string) {
    return this.update(id, { status_approval: 'approved' })
  },

  // Reject SKPL
  async reject(id: string) {
    return this.update(id, { status_approval: 'rejected' })
  },

  // Delete SKPL (cascade akan delete related skpl_karyawan)
  async delete(id: string) {
    const { error } = await supabase
      .from('skpl')
      .delete()
      .eq('id', id)
    
    if (error) throw new Error(error.message)
    return true
  },

  // Get total lemburan per karyawan (current month)
  async getTotalLemburanThisMonth(id_karyawan: string) {
    const { data, error } = await supabase
      .from('skpl_karyawan')
      .select(`
        skpl(
          total_jam,
          tanggal,
          status_approval
        )
      `)
      .eq('id_karyawan', id_karyawan)
    
    if (error) throw new Error(error.message)
    
    const total = (data || [])
      .filter((item: any) => item.skpl?.status_approval === 'approved')
      .reduce((sum, item: any) => sum + (item.skpl?.total_jam || 0), 0)
    
    return {
      total_jam: total,
      remaining: 60 - total,
      exceeded: total > 60
    }
  }
}

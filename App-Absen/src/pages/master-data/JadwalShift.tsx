import { useState, useMemo, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft, Save, Calendar } from 'lucide-react';
import { useKaryawanStore } from '../../store/karyawanStore';
import { useKaryawanShiftStore } from '../../store/karyawanShiftStore';
import { useShiftStore } from '../../store/shiftStore';

interface ShiftScheduleDay {
    date: string;
    shift: 'DS' | 'NS' | 'OFF';
}

export default function JadwalShiftPage() {
    const navigate = useNavigate();
    const { karyawanList } = useKaryawanStore();
    const { addShiftBulk, deleteShiftByDateRange } = useKaryawanShiftStore();
    const { shifts, fetchShifts } = useShiftStore();

    // Load shifts on mount
    useEffect(() => {
        fetchShifts();
    }, [fetchShifts]);

    // Form states
    const [search, setSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedKaryawan, setSelectedKaryawan] = useState<typeof karyawanList>([]);
    
    const [dsDays, setDsDays] = useState('4');
    const [nsDays, setNsDays] = useState('4');
    const [offDays, setOffDays] = useState('3');
    const [startShift, setStartShift] = useState<'DS' | 'NS' | 'OFF'>('DS');
    const [startDate, setStartDate] = useState(() => {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return format(firstDayOfMonth, 'yyyy-MM-dd');
    });

    const [schedule, setSchedule] = useState<ShiftScheduleDay[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Reset schedule when karyawan selection changes (prevent inconsistency)
    useEffect(() => {
        setSchedule([]);
    }, [selectedKaryawan.length > 0 ? selectedKaryawan.map(k => k.id).join(',') : 'empty']);

    // Reset schedule when configuration changes
    useEffect(() => {
        setSchedule([]);
    }, [dsDays, nsDays, offDays, startShift, startDate]);

    const filteredKaryawan = karyawanList.filter(
        (k) =>
            k.status_aktif &&
            !selectedKaryawan.find(sk => sk.id === k.id) &&
            (k.nama.toLowerCase().includes(search.toLowerCase()) || k.nik.includes(search))
    );

    const handleSelectKaryawan = (k: typeof karyawanList[0]) => {
        setSelectedKaryawan([...selectedKaryawan, k]);
        setSearch('');
        setShowDropdown(false);
    };

    const handleRemoveKaryawan = (id: string) => {
        setSelectedKaryawan(selectedKaryawan.filter(k => k.id !== id));
    };

    // Generate 90-day shift schedule with strict repeating pattern
    const generateSchedule = () => {
        setError(null);
        
        const ds = parseInt(dsDays) || 1;
        const ns = parseInt(nsDays) || 1;
        const off = parseInt(offDays) || 1;

        if (ds < 1 || ns < 1 || off < 1) {
            setError('Semua nilai hari harus minimal 1');
            return;
        }

        // Create shift order based on startShift selection
        const shiftOrder: ('DS' | 'NS' | 'OFF')[] = [];
        const shiftDays = { DS: ds, NS: ns, OFF: off };
        
        // Determine the order based on startShift
        if (startShift === 'DS') {
            shiftOrder.push('DS', 'NS', 'OFF');
        } else if (startShift === 'NS') {
            shiftOrder.push('NS', 'OFF', 'DS');
        } else if (startShift === 'OFF') {
            shiftOrder.push('OFF', 'DS', 'NS');
        }

        const cycleLength = ds + ns + off;
        const newSchedule: ShiftScheduleDay[] = [];

        for (let i = 0; i < 90; i++) {
            const currentDate = addDays(new Date(startDate), i);
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            
            const dayInCycle = i % cycleLength;
            let shift: 'DS' | 'NS' | 'OFF';
            let daysAccumulated = 0;

            // Map dayInCycle to the correct shift based on order
            for (const s of shiftOrder) {
                if (dayInCycle < daysAccumulated + shiftDays[s]) {
                    shift = s;
                    break;
                }
                daysAccumulated += shiftDays[s];
            }
            shift = shift!; // Ensure shift is always assigned

            newSchedule.push({ date: dateStr, shift });
        }

        setSchedule(newSchedule);
    };

    // Get shift ID based on shift name with validation
    const getShiftId = (shiftName: string): string => {
        const shift = shifts.find(s => s.nama === shiftName);
        if (!shift) {
            console.error(`Shift dengan nama '${shiftName}' tidak ditemukan di database`);
            throw new Error(`Shift '${shiftName}' tidak tersedia di database`);
        }
        return shift.id;
    };

    const handleSave = async () => {
        if (selectedKaryawan.length === 0 || schedule.length === 0) {
            setError('Pilih minimal 1 karyawan dan generate jadwal terlebih dahulu');
            return;
        }

        // Validate shifts are available
        if (shifts.length === 0) {
            setError('Shift data belum dimuat. Silakan refresh halaman.');
            setSaving(false);
            return;
        }

        // Pre-validate that all required shifts exist
        const requiredShifts = new Set<string>();
        schedule.forEach(s => requiredShifts.add(s.shift));
        
        for (const shiftName of requiredShifts) {
            if (!shifts.find(s => s.nama === shiftName)) {
                setError(`Shift '${shiftName}' tidak ditemukan di database. Silakan periksa data shift.`);
                setSaving(false);
                return;
            }
        }

        setSaving(true);
        setError(null);

        try {
            // For each karyawan, delete existing shifts in the date range and add new ones
            const startDateObj = new Date(startDate);
            const endDateObj = addDays(startDateObj, 89);
            const startDateStr = format(startDateObj, 'yyyy-MM-dd');
            const endDateStr = format(endDateObj, 'yyyy-MM-dd');

            // Create shift periods ONCE for all karyawan (ensure consistency)
            const createShiftPeriodsForKaryawan = (karyawanId: string): Array<any> => {
                const shiftPeriods = [];
                let currentShift = schedule[0].shift;
                let periodStart = schedule[0].date;

                for (let i = 1; i <= schedule.length; i++) {
                    const nextShift = i < schedule.length ? schedule[i].shift : null;

                    if (nextShift !== currentShift) {
                        shiftPeriods.push({
                            id_karyawan: karyawanId,
                            id_shift: getShiftId(currentShift),
                            tanggal_mulai: periodStart,
                            tanggal_selesai: schedule[i - 1].date,
                        });

                        if (nextShift) {
                            currentShift = nextShift;
                            periodStart = schedule[i].date;
                        }
                    }
                }

                return shiftPeriods;
            };

            for (const karyawan of selectedKaryawan) {
                // Delete existing shifts in the date range (replacement)
                await deleteShiftByDateRange(
                    karyawan.id,
                    startDateStr,
                    endDateStr
                );

                // Create shift periods for this karyawan
                const shiftPeriods = createShiftPeriodsForKaryawan(karyawan.id);

                // Bulk insert all shift periods
                if (shiftPeriods.length > 0) {
                    await addShiftBulk(shiftPeriods);
                }
            }

            setSuccess(true);
            setSaving(false);
            setTimeout(() => {
                navigate('/master-data/karyawan');
            }, 1500);
        } catch (err) {
            setError((err as Error).message);
            setSaving(false);
        }
    };

    // Stats for preview
    const stats = useMemo(() => {
        if (schedule.length === 0) return { ds: 0, ns: 0, off: 0 };
        return {
            ds: schedule.filter(s => s.shift === 'DS').length,
            ns: schedule.filter(s => s.shift === 'NS').length,
            off: schedule.filter(s => s.shift === 'OFF').length,
        };
    }, [schedule]);

    // Group schedule by month
    const scheduleByMonth = useMemo(() => {
        const grouped: Record<string, ShiftScheduleDay[]> = {};
        schedule.forEach(item => {
            const month = item.date.substring(0, 7); // YYYY-MM
            if (!grouped[month]) grouped[month] = [];
            grouped[month].push(item);
        });
        return grouped;
    }, [schedule]);

    const shiftColor = (shift: string) => {
        switch (shift) {
            case 'DS':
                return 'var(--status-ds)'; // Green
            case 'NS':
                return 'var(--status-ns)'; // Orange
            case 'OFF':
                return 'var(--status-off)'; // Gray
            default:
                return 'var(--bg-card)';
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Jadwal Shift Otomatis</h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '4px' }}>
                        Generate jadwal shift otomatis untuk 3 bulan (90 hari)
                    </p>
                </div>
                <button 
                    className="btn btn-secondary"
                    onClick={() => navigate('/master-data/karyawan')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <ArrowLeft size={16} />
                    Kembali
                </button>
            </div>

            <div className="page-content">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Form Section */}
                    <div className="card">
                        <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
                            Konfigurasi Jadwal
                        </h2>

                        {/* Karyawan Multi-Select */}
                        <div className="form-group">
                            <label className="form-label">Pilih Karyawan *</label>
                            <div style={{ position: 'relative' }}>
                                <div
                                    className="form-input"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    style={{
                                        cursor: 'pointer',
                                        minHeight: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px 12px',
                                    }}
                                >
                                    {selectedKaryawan.length === 0 ? (
                                        <span style={{ color: 'var(--text-dim)' }}>Ketik nama atau NIK karyawan...</span>
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder="Ketik nama atau NIK karyawan..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onFocus={() => setShowDropdown(true)}
                                            style={{
                                                flex: 1,
                                                border: 'none',
                                                background: 'transparent',
                                                color: 'var(--text-primary)',
                                                outline: 'none',
                                                fontSize: '14px',
                                            }}
                                        />
                                    )}
                                </div>

                                {showDropdown && filteredKaryawan.length > 0 && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-md)',
                                            marginTop: '4px',
                                            zIndex: 10,
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            boxShadow: 'var(--shadow-md)',
                                        }}
                                    >
                                        {filteredKaryawan.map(k => (
                                            <div
                                                key={k.id}
                                                onClick={() => handleSelectKaryawan(k)}
                                                style={{
                                                    padding: '10px 12px',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid var(--border-color)',
                                                    fontSize: '14px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                }}
                                                onMouseEnter={(e) => {
                                                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <span>{k.nama}</span>
                                                <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>{k.nik}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Selected Karyawan Tags */}
                            {selectedKaryawan.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                    {selectedKaryawan.map(k => (
                                        <div
                                            key={k.id}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                backgroundColor: 'var(--accent-blue-dim)',
                                                color: 'var(--accent-blue-light)',
                                                padding: '6px 10px',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '13px',
                                                border: '1px solid var(--accent-blue)',
                                            }}
                                        >
                                            {k.nama}
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleRemoveKaryawan(k.id)}
                                                style={{
                                                    width: '18px',
                                                    height: '18px',
                                                    padding: '0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    color: 'var(--text-dim)',
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Shift Pattern Inputs */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                            <div className="form-group">
                                <label className="form-label">Hari DS *</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={dsDays}
                                    onChange={(e) => setDsDays(e.target.value)}
                                    className="form-input"
                                    placeholder="4"
                                />
                                <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Day Shift</p>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Hari NS *</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={nsDays}
                                    onChange={(e) => setNsDays(e.target.value)}
                                    className="form-input"
                                    placeholder="4"
                                />
                                <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Night Shift</p>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Hari OFF *</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={offDays}
                                    onChange={(e) => setOffDays(e.target.value)}
                                    className="form-input"
                                    placeholder="3"
                                />
                                <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Libur</p>
                            </div>
                        </div>

                        {/* Start Shift */}
                        <div className="form-group">
                            <label className="form-label">Shift Mulai *</label>
                            <select
                                value={startShift}
                                onChange={(e) => setStartShift(e.target.value as 'DS' | 'NS' | 'OFF')}
                                className="form-input"
                            >
                                <option value="DS">DS (Day Shift)</option>
                                <option value="NS">NS (Night Shift)</option>
                                <option value="OFF">OFF (Libur)</option>
                            </select>
                            <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Shift yang menjadi awal pola</p>
                        </div>

                        {/* Start Date */}
                        <div className="form-group">
                            <label className="form-label">Tanggal Mulai *</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        {/* Pattern Info */}
                        <div
                            style={{
                                backgroundColor: 'var(--bg-hover)',
                                padding: '12px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                                fontSize: '13px',
                                marginTop: '12px',
                            }}
                        >
                            <p style={{ color: 'var(--text-dim)', marginBottom: '6px' }}>Pola berulang:</p>
                            <p style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                                {startShift === 'DS' && `${dsDays} hari DS → ${nsDays} hari NS → ${offDays} hari OFF`}
                                {startShift === 'NS' && `${nsDays} hari NS → ${offDays} hari OFF → ${dsDays} hari DS`}
                                {startShift === 'OFF' && `${offDays} hari OFF → ${dsDays} hari DS → ${nsDays} hari NS`}
                                <br />
                                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>(setiap {(parseInt(dsDays) + parseInt(nsDays) + parseInt(offDays)) || 11} hari)</span>
                            </p>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div
                                style={{
                                    backgroundColor: 'rgba(169, 0, 0, 0.1)',
                                    color: 'var(--status-absent)',
                                    padding: '10px 12px',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '13px',
                                    marginTop: '12px',
                                    border: '1px solid rgba(169, 0, 0, 0.3)',
                                }}
                            >
                                {error}
                            </div>
                        )}

                        {success && (
                            <div
                                style={{
                                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                    color: 'var(--status-sakit)',
                                    padding: '10px 12px',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '13px',
                                    marginTop: '12px',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                }}
                            >
                                Jadwal berhasil disimpan!
                            </div>
                        )}

                        {/* Generate Button */}
                        <button
                            className="btn btn-primary"
                            onClick={generateSchedule}
                            style={{ width: '100%', marginTop: '16px' }}
                        >
                            <Calendar size={16} />
                            Generate Preview
                        </button>
                    </div>

                    {/* Preview Section */}
                    <div className="card">
                        <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
                            Preview Jadwal (90 Hari)
                        </h2>

                        {schedule.length === 0 ? (
                            <div
                                style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: 'var(--text-dim)',
                                    fontSize: '14px',
                                }}
                            >
                                <Calendar size={32} style={{ opacity: 0.5, marginBottom: '12px' }} />
                                <p>Klik tombol "Generate Preview" untuk melihat jadwal</p>
                            </div>
                        ) : (
                            <>
                                {/* Stats */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ padding: '12px', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                        <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>DS (Day Shift)</p>
                                        <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--status-ds)' }}>{stats.ds} hari</p>
                                    </div>
                                    <div style={{ padding: '12px', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                        <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>NS (Night Shift)</p>
                                        <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--status-ns)' }}>{stats.ns} hari</p>
                                    </div>
                                    <div style={{ padding: '12px', backgroundColor: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                        <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>OFF (Libur)</p>
                                        <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--status-off)' }}>{stats.off} hari</p>
                                    </div>
                                </div>

                                {/* Calendar Grid */}
                                {Object.entries(scheduleByMonth).map(([monthKey, days]) => {
                                    const monthDate = new Date(monthKey + '-01');
                                    const monthName = format(monthDate, 'MMMM yyyy', { locale: id });
                                    const daysArray = Array.from({ length: 31 }, (_, i) => i + 1).filter(d => {
                                        const testDate = new Date(monthKey + `-${String(d).padStart(2, '0')}`);
                                        return testDate.getMonth() === monthDate.getMonth();
                                    });
                                    const firstDayOfWeek = new Date(monthKey + '-01').getDay();
                                    const adjustedStartDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Convert Sunday=0 to Monday=0
                                    
                                    return (
                                        <div key={monthKey} style={{ marginBottom: '24px' }}>
                                            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                                                {monthName}
                                            </p>
                                            {/* Day headers */}
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '6px' }}>
                                                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                                                    <div key={day} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', padding: '8px 0' }}>
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Calendar grid */}
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                                                {/* Empty cells for first week */}
                                                {Array.from({ length: adjustedStartDay }).map((_, i) => (
                                                    <div key={`empty-${i}`} />
                                                ))}
                                                {/* Days */}
                                                {daysArray.map((day) => {
                                                    const dateStr = `${monthKey}-${String(day).padStart(2, '0')}`;
                                                    const shiftItem = days.find(d => d.date === dateStr);
                                                    const shift = shiftItem?.shift || 'OFF';
                                                    const statusColor = shiftColor(shift);
                                                    
                                                    return (
                                                        <div
                                                            key={day}
                                                            style={{
                                                                padding: '8px 4px',
                                                                borderRadius: 'var(--radius-md)',
                                                                textAlign: 'center',
                                                                background: statusColor + '18',
                                                                border: `1px solid ${statusColor}40`,
                                                                minHeight: '60px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '4px',
                                                            }}
                                                        >
                                                            <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)' }}>
                                                                {day}
                                                            </div>
                                                            {shift && (
                                                                <div style={{ fontSize: '11px', fontWeight: '700', color: statusColor }}>
                                                                    {shift}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Legend */}
                                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--status-ds)', borderRadius: 'var(--radius-sm)' }}></div>
                                        <span>DS</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--status-ns)', borderRadius: 'var(--radius-sm)' }}></div>
                                        <span>NS</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--status-off)', borderRadius: 'var(--radius-sm)' }}></div>
                                        <span>OFF</span>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <button
                                    className="btn btn-success"
                                    onClick={handleSave}
                                    disabled={saving}
                                    style={{ width: '100%', marginTop: '16px' }}
                                >
                                    <Save size={16} />
                                    {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

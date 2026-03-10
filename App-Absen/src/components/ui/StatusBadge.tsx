import type { StatusAbsensi } from '../../types';

interface StatusBadgeProps {
    status: StatusAbsensi;
}

const labels: Record<StatusAbsensi, string> = {
    DS: 'Day Shift',
    NS: 'Night Shift',
    OFF: 'OFF',
    S: 'Sakit',
    I: 'Izin',
    A: 'Alpa',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
    return (
        <span className={`badge badge-${status.toLowerCase()}`}>
            {status} {status !== 'OFF' && status !== 'DS' && status !== 'NS' ? `· ${labels[status]}` : ''}
        </span>
    );
}

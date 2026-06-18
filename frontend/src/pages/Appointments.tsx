import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Appointment } from '../types';

const statusColors: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: '#c6f6d5', color: '#276749' },
  cancelled:  { bg: '#fed7d7', color: '#c53030' },
  completed:  { bg: '#bee3f8', color: '#2b6cb0' },
  'no-show':  { bg: '#fefcbf', color: '#744210' }
};

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const load = async () => {
    const res = await api.get<Appointment[]>('/appointments');
    setAppointments(res.data);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    await api.patch(`/appointments/${id}/status`, { status });
    toast.success('Status updated');
    load();
  };

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ margin: '0 0 24px', color: '#1a1a2e' }}>Appointments</h1>
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f7fafc' }}>
              {['#', 'Patient', 'Phone', 'Doctor', 'Date', 'Time', 'Channel', 'Status', 'Action'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#666', fontSize: '13px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {appointments.map(a => (
              <tr key={a.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '14px 16px', color: '#999' }}>#{a.id}</td>
                <td style={{ padding: '14px 16px', fontWeight: '500' }}>{a.patient_name}</td>
                <td style={{ padding: '14px 16px', color: '#666' }}>{a.patient_phone}</td>
                <td style={{ padding: '14px 16px' }}>{a.doctor_name}</td>
                <td style={{ padding: '14px 16px', color: '#666' }}>{new Date(a.slot_date).toLocaleDateString()}</td>
                <td style={{ padding: '14px 16px', color: '#667eea' }}>{a.start_time}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', background: '#f0f4ff', color: '#667eea' }}>
                    {a.channel}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                    background: statusColors[a.status]?.bg || '#f0f0f0',
                    color: statusColors[a.status]?.color || '#666'
                  }}>
                    {a.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <select value={a.status} onChange={e => updateStatus(a.id, e.target.value)}
                    style={{ padding: '6px 10px', border: '1px solid #e1e5e9', borderRadius: '6px', fontSize: '13px' }}>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No Show</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {appointments.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999', padding: '48px' }}>No appointments yet</p>
        )}
      </div>
    </div>
  );
}

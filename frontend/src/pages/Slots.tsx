import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { Doctor, TimeSlot } from '../types';

interface SlotForm {
  doctor_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
}

export default function Slots() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [form, setForm] = useState<SlotForm>({ doctor_id: '', slot_date: '', start_time: '', end_time: '' });

  const load = async () => {
    const [s, d] = await Promise.all([api.get<TimeSlot[]>('/slots'), api.get<Doctor[]>('/doctors')]);
    setSlots(s.data);
    setDoctors(d.data);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.doctor_id || !form.slot_date || !form.start_time || !form.end_time) {
      toast.error('All fields required'); return;
    }
    try {
      await api.post('/slots', form);
      toast.success('Slot added');
      setForm({ doctor_id: '', slot_date: '', start_time: '', end_time: '' });
      load();
    } catch { toast.error('Error adding slot'); }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this slot?')) return;
    await api.delete(`/slots/${id}`);
    toast.success('Slot deleted');
    load();
  };

  const inputStyle = {
    padding: '10px 14px', border: '2px solid #e1e5e9',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
    width: '100%', boxSizing: 'border-box' as const
  };

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ margin: '0 0 24px', color: '#1a1a2e' }}>Time Slots</h1>

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '16px' }}>Add New Slot</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <select value={form.doctor_id} onChange={e => setForm({ ...form, doctor_id: e.target.value })} style={inputStyle}>
            <option value="">Select Doctor</option>
            {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
          </select>
          <input type="date" value={form.slot_date} onChange={e => setForm({ ...form, slot_date: e.target.value })} style={inputStyle} />
          <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} style={inputStyle} />
          <input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} style={inputStyle} />
          <button onClick={save} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '10px 20px', background: '#667eea', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
          }}>
            <Plus size={18} /> Add Slot
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f7fafc' }}>
              {['Doctor', 'Date', 'Start', 'End', 'Status', 'Action'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#666', fontSize: '13px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map(s => (
              <tr key={s.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '14px 16px', fontWeight: '500' }}>Dr. {s.doctor_name}</td>
                <td style={{ padding: '14px 16px', color: '#666' }}>{new Date(s.slot_date).toLocaleDateString()}</td>
                <td style={{ padding: '14px 16px', color: '#667eea' }}>{s.start_time}</td>
                <td style={{ padding: '14px 16px', color: '#667eea' }}>{s.end_time}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                    background: s.is_booked ? '#fed7d7' : '#c6f6d5',
                    color: s.is_booked ? '#c53030' : '#276749'
                  }}>
                    {s.is_booked ? 'Booked' : 'Available'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {!s.is_booked && (
                    <button onClick={() => remove(s.id)} style={{
                      background: '#fff5f5', border: 'none', borderRadius: '8px',
                      padding: '8px', cursor: 'pointer', color: '#e53e3e'
                    }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {slots.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999', padding: '48px' }}>No slots yet</p>
        )}
      </div>
    </div>
  );
}

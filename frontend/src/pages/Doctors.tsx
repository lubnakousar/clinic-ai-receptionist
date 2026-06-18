import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { Doctor } from '../types';

type DoctorForm = Omit<Doctor, 'id' | 'is_active' | 'created_at'>;
const empty: DoctorForm = { name: '', specialty: '', phone: '', email: '', bio: '' };

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<DoctorForm>(empty);
  const [editing, setEditing] = useState<number | null>(null);

  const load = async () => {
    const res = await api.get<Doctor[]>('/doctors');
    setDoctors(res.data);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditing(null); setModal(true); };
  const openEdit = (d: Doctor) => {
    setForm({ name: d.name, specialty: d.specialty, phone: d.phone || '', email: d.email || '', bio: d.bio || '' });
    setEditing(d.id);
    setModal(true);
  };

  const save = async () => {
    try {
      if (editing) {
        await api.put(`/doctors/${editing}`, { ...form, is_active: true });
        toast.success('Doctor updated');
      } else {
        await api.post('/doctors', form);
        toast.success('Doctor added');
      }
      setModal(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error saving');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this doctor?')) return;
    await api.delete(`/doctors/${id}`);
    toast.success('Doctor deleted');
    load();
  };

  const fields: (keyof DoctorForm)[] = ['name', 'specialty', 'phone', 'email', 'bio'];

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: '#1a1a2e' }}>Doctors</h1>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', background: '#667eea', color: 'white',
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
        }}>
          <Plus size={18} /> Add Doctor
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {doctors.map(d => (
          <div key={d.id} style={{
            background: 'white', borderRadius: '12px', padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>👨‍⚕️</div>
                <h3 style={{ margin: '0 0 4px', color: '#1a1a2e' }}>Dr. {d.name}</h3>
                <span style={{
                  padding: '3px 10px', borderRadius: '20px', fontSize: '12px',
                  background: '#ebf4ff', color: '#667eea', fontWeight: '600'
                }}>
                  {d.specialty}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openEdit(d)} style={{
                  background: '#ebf8ff', border: 'none', borderRadius: '8px',
                  padding: '8px', cursor: 'pointer', color: '#3182ce'
                }}>
                  <Pencil size={16} />
                </button>
                <button onClick={() => remove(d.id)} style={{
                  background: '#fff5f5', border: 'none', borderRadius: '8px',
                  padding: '8px', cursor: 'pointer', color: '#e53e3e'
                }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {d.phone && <p style={{ margin: '12px 0 0', color: '#666', fontSize: '14px' }}>📞 {d.phone}</p>}
            {d.email && <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>✉️ {d.email}</p>}
          </div>
        ))}
      </div>

      {modal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ margin: 0 }}>{editing ? 'Edit Doctor' : 'Add Doctor'}</h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            {fields.map(field => (
              <div key={field} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#444', fontWeight: '500', textTransform: 'capitalize' }}>
                  {field}
                </label>
                <input
                  value={form[field] || ''}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', border: '2px solid #e1e5e9',
                    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none'
                  }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button onClick={() => setModal(false)} style={{
                flex: 1, padding: '12px', border: '2px solid #e1e5e9',
                borderRadius: '8px', background: 'white', cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={save} style={{
                flex: 1, padding: '12px', background: '#667eea',
                color: 'white', border: 'none', borderRadius: '8px',
                cursor: 'pointer', fontWeight: '600'
              }}>{editing ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

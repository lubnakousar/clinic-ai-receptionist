import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Calendar, Users, UserCircle, MessageSquare } from 'lucide-react';
import { Appointment, Patient, Doctor } from '../types';

interface Stats {
  appointments: number;
  patients: number;
  doctors: number;
  today: number;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div style={{
      background: 'white', borderRadius: '12px', padding: '24px',
      display: 'flex', alignItems: 'center', gap: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      <div style={{
        width: '52px', height: '52px', borderRadius: '12px', background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={24} color="white" />
      </div>
      <div>
        <div style={{ color: '#666', fontSize: '13px' }}>{label}</div>
        <div style={{ color: '#1a1a2e', fontSize: '28px', fontWeight: '700' }}>{value}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ appointments: 0, patients: 0, doctors: 0, today: 0 });
  const [todayAppts, setTodayAppts] = useState<Appointment[]>([]);
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');

  useEffect(() => {
    const load = async () => {
      try {
        const [appts, patients, doctors, today] = await Promise.all([
          api.get<Appointment[]>('/appointments'),
          api.get<Patient[]>('/patients'),
          api.get<Doctor[]>('/doctors'),
          api.get<Appointment[]>('/appointments/today')
        ]);
        setStats({
          appointments: appts.data.length,
          patients: patients.data.length,
          doctors: doctors.data.length,
          today: today.data.length
        });
        setTodayAppts(today.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, color: '#1a1a2e', fontSize: '24px' }}>
          Good day, {admin.name} 👋
        </h1>
        <p style={{ color: '#666', margin: '4px 0 0' }}>Here's what's happening at the clinic today</p>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px', marginBottom: '32px'
      }}>
        <StatCard icon={Calendar}       label="Today's Appointments" value={stats.today}        color="#667eea" />
        <StatCard icon={MessageSquare}  label="Total Appointments"   value={stats.appointments} color="#48bb78" />
        <StatCard icon={Users}          label="Total Patients"       value={stats.patients}     color="#ed8936" />
        <StatCard icon={UserCircle}     label="Active Doctors"       value={stats.doctors}      color="#9f7aea" />
      </div>

      <div style={{
        background: 'white', borderRadius: '12px', padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <h2 style={{ margin: '0 0 16px', color: '#1a1a2e', fontSize: '18px' }}>Today's Appointments</h2>
        {todayAppts.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '32px 0' }}>No appointments today</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                {['Patient', 'Phone', 'Doctor', 'Time', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#666', fontSize: '13px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {todayAppts.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '12px' }}>{a.patient_name}</td>
                  <td style={{ padding: '12px', color: '#666' }}>{a.patient_phone}</td>
                  <td style={{ padding: '12px' }}>{a.doctor_name}</td>
                  <td style={{ padding: '12px', color: '#667eea' }}>{a.start_time} - {a.end_time}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                      background: a.status === 'confirmed' ? '#c6f6d5' : '#fed7d7',
                      color: a.status === 'confirmed' ? '#276749' : '#c53030'
                    }}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

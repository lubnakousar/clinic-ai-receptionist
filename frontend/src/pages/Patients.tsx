import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Patient } from '../types';

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    api.get<Patient[]>('/patients').then(res => setPatients(res.data));
  }, []);

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ margin: '0 0 24px', color: '#1a1a2e' }}>Patients</h1>
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f7fafc' }}>
              {['#', 'Name', 'Phone', 'Email', 'Address', 'Medical Info', 'Registered'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#666', fontSize: '13px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patients.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '14px 16px', color: '#999' }}>#{p.id}</td>
                <td style={{ padding: '14px 16px', fontWeight: '500' }}>{p.name}</td>
                <td style={{ padding: '14px 16px', color: '#666' }}>{p.phone}</td>
                <td style={{ padding: '14px 16px', color: '#666' }}>{p.email || '—'}</td>
                <td style={{ padding: '14px 16px', color: '#666' }}>{p.address}</td>
                <td style={{ padding: '14px 16px', color: '#666', maxWidth: '200px' }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.medical_info || '—'}
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: '#999', fontSize: '13px' }}>
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {patients.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999', padding: '48px' }}>No patients yet</p>
        )}
      </div>
    </div>
  );
}

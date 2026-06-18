import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar,
  UserCircle, MessageSquare, LogOut, Menu, X
} from 'lucide-react';
import { Admin } from '../types';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/doctors',      icon: UserCircle,      label: 'Doctors'      },
  { to: '/slots',        icon: Calendar,        label: 'Time Slots'   },
  { to: '/appointments', icon: MessageSquare,   label: 'Appointments' },
  { to: '/patients',     icon: Users,           label: 'Patients'     },
];

export default function Layout() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const admin: Admin = JSON.parse(localStorage.getItem('admin') || '{}');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa' }}>
      <div style={{
        width: open ? '240px' : '64px',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        transition: 'width 0.3s',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 16px', display: 'flex',
          alignItems: 'center', gap: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <span style={{ fontSize: '28px', flexShrink: 0 }}>🏥</span>
          {open && (
            <div>
              <div style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>Clinic AI</div>
              <div style={{ color: '#a0aec0', fontSize: '11px' }}>Admin Panel</div>
            </div>
          )}
          <button onClick={() => setOpen(!open)} style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            color: '#a0aec0', cursor: 'pointer', padding: '4px', flexShrink: 0
          }}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '8px', marginBottom: '4px',
                textDecoration: 'none',
                color: isActive ? 'white' : '#a0aec0',
                background: isActive ? 'rgba(102,126,234,0.3)' : 'transparent',
                whiteSpace: 'nowrap', overflow: 'hidden'
              })}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              {open && <span style={{ fontSize: '14px', fontWeight: '500' }}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {open && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>{admin.name}</div>
              <div style={{ color: '#a0aec0', fontSize: '11px' }}>{admin.email}</div>
            </div>
          )}
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            color: '#fc8181', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: '14px', padding: '8px 12px',
            borderRadius: '8px', width: '100%'
          }}>
            <LogOut size={18} />
            {open && 'Logout'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
}

// src/components/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import { LogOut, Home, Bike, Clock, Users, MapPin, Plus, FileText } from 'lucide-react';

const menuConfig = {
  guest: [
    { to: '/', icon: <Home size={18} />, label: 'Home' },
    { to: '/auth/login', icon: <Users size={18} />, label: 'Login' },
    { to: '/auth/register', icon: <Plus size={18} />, label: 'Register' }
  ],
  user: [
    { to: '/user/booking', icon: <Bike size={18} />, label: 'Book Scooter' },
    { to: '/user/history', icon: <Clock size={18} />, label: 'My Booking History' }
  ],
  partner: [
    { to: '/partner/dashboard', icon: <Home size={18} />, label: 'Dashboard' },
    { to: '/partner/scooter-history', icon: <FileText size={18} />, label: 'Scooter History' }
  ]
};

export default function Sidebar() {
  const { isAuthenticated, authUser, logout } = useAuth();
  const navigate = useNavigate();

  const role = authUser?.role === 'Franchise' || authUser?.role === 'partner' ? 'partner'
    : authUser?.role === 'Client' || authUser?.role === 'user' ? 'user'
    : 'guest';

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const menu = menuConfig[role];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.menuWrapper}>
        <h2 style={styles.title}>DALScooter</h2>
        <nav>
          {menu.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                color: isActive ? '#FFD700' : '#FFF',
                textDecoration: 'none',
                fontWeight: isActive ? 700 : 500,
                borderRadius: '6px',
                background: isActive ? 'rgba(255,215,0,0.12)' : 'transparent',
                marginBottom: 4,
                gap: '0.75rem'
              })}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      {isAuthenticated && (
        <button style={styles.logoutButton} onClick={handleLogout}>
          <LogOut style={{ verticalAlign: 'middle', marginRight: 8 }} size={18} />
          Logout
        </button>
      )}
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 240,
    padding: '2rem 1rem 1rem 1rem',
    backgroundColor: '#006F44',
    minHeight: '100vh',
    boxSizing: 'border-box',
    boxShadow: '2px 0 10px rgba(0,0,0,0.07)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  menuWrapper: {
    flex: 1
  },
  title: {
    color: '#FFF',
    marginBottom: '2rem',
    fontSize: '1.5rem',
    textAlign: 'center',
    fontWeight: 800,
    letterSpacing: '1px'
  },
  logoutButton: {
    width: '100%',
    padding: '0.8rem 1rem',
    color: '#FFD700',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontWeight: 700,
    fontSize: '1rem',
    borderRadius: '6px',
    marginTop: '2rem',
    marginBottom: '1rem',
    transition: 'background 0.18s'
  }
};

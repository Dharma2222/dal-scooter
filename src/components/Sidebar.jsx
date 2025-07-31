import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  Home,
  Bike,
  Clock,
  Users,
  Plus,
  FileText,
  Zap,
  BarChart3
} from 'lucide-react';

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
    { to: '/partner', icon: <Home size={18} />, label: 'Dashboard' },
    {
      to: '/partner/scooters/history',
      icon: <FileText size={18} />,
      label: 'Scooter History'
    },
    
    { to: '/feedback-table', icon: <FileText size={18} />, label: 'View Feedback' },
    { to: '/partner/analytics',        icon: <BarChart3 size={18} />,  label: 'Analytics' }

  ]
};

export default function Sidebar() {
  const { isAuthenticated, authUser, logout } = useAuth();
  const navigate = useNavigate();

  const role = authUser?.role === 'partner' || authUser?.role === 'Franchise'
    ? 'partner'
    : authUser?.role === 'user' || authUser?.role === 'Client'
      ? 'user'
      : 'guest';

  const menu = menuConfig[role] || menuConfig.guest;

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.header}>
        <div style={styles.brandContainer}>
          <div style={styles.brandIcon}>
            <Zap size={24} color="#fff" />
          </div>
          <div>
            <h2 style={styles.brandTitle}>DALScooter</h2>
            <p style={styles.brandSubtitle}>Management Platform</p>
          </div>
        </div>
      </div>

      {isAuthenticated && authUser && (
        <div style={styles.userSection}>
          <div style={styles.userAvatar}>
            <span style={styles.userInitial}>
              {authUser.name?.[0].toUpperCase() || 'U'}
            </span>
          </div>
          <div style={styles.userDetails}>
            <p style={styles.userName}>{authUser.name || authUser.email}</p>
            <p style={styles.userRole}>
              {role === 'partner' ? 'Partner' : role === 'user' ? 'Customer' : 'Guest'}
            </p>
          </div>
        </div>
      )}

      <nav style={styles.navigation}>
        {menu.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : styles.navItemInactive)
            })}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {isAuthenticated && (
        <div style={styles.footer}>
          <button style={styles.logoutButton} onClick={handleLogout}>
            <LogOut size={18} style={styles.logoutIcon} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 280,
    backgroundColor: '#fff',
    borderRight: '1px solid #e5e7eb',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'system-ui'
  },
  header: {
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f8fafc'
  },
  brandContainer: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  brandIcon: {
    padding: '0.5rem',
    backgroundColor: '#2563eb',
    borderRadius: '0.5rem'
  },
  brandTitle: { margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' },
  brandSubtitle: { margin: 0, fontSize: '0.875rem', color: '#6b7280' },
  userSection: { display: 'flex', alignItems: 'center', padding: '1rem' },
  userAvatar: {
    width: 32,
    height: 32,
    backgroundColor: '#dbeafe',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '0.75rem'
  },
  userInitial: { fontSize: '0.875rem', fontWeight: 600, color: '#2563eb' },
  userDetails: { flex: 1, overflow: 'hidden' },
  userName: {
    margin: 0,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#111827',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  userRole: { margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'capitalize' },
  navigation: { flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    transition: 'background 0.15s'
  },
  navItemActive: { backgroundColor: '#eff6ff', color: '#1d4ed8', borderRight: '3px solid #2563eb' },
  navItemInactive: {},
  navIcon: { display: 'flex', alignItems: 'center' },
  footer: { borderTop: '1px solid #e5e7eb' },
  logoutButton: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  logoutIcon: { flexShrink: 0 }
};

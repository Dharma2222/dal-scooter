import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const linkStyle = ({ isActive }) => ({
    display: 'block',
    padding: '0.75rem 1rem',
    color: isActive ? '#FFD700' : '#FFF',
    textDecoration: 'none',
    fontWeight: isActive ? '700' : '500',
    borderRadius: '4px',
    backgroundColor: isActive ? 'rgba(255,215,0,0.1)' : 'transparent'
  });

  return (
    <aside style={styles.sidebar}>
      <h2 style={styles.title}>DALScooter</h2>
      <nav>
        <NavLink to="/auth/register" style={linkStyle}>
          Register
        </NavLink>
        <NavLink to="/auth/login" style={linkStyle}>
          Login
        </NavLink>
      </nav>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '220px',
    padding: '2rem 1rem',
    backgroundColor: '#006F44',
    minHeight: '100vh',
    boxSizing: 'border-box',
    boxShadow: '2px 0 6px rgba(0,0,0,0.1)'
  },
  title: {
    color: '#FFF',
    marginBottom: '2rem',
    fontSize: '1.5rem',
    textAlign: 'center'
  }
};

export default Sidebar;

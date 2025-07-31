// src/pages/partner/ScooterHistoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchScooterHistory } from '../../api/gatewayClient';
import { ArrowLeft, Zap, Clock, User, Calendar, CheckCircle, AlertCircle, Loader2, TrendingUp } from 'lucide-react';

export default function ScooterHistoryPage() {
  const { scooterId } = useParams();
  const { authUser } = useAuth(); // expects authUser.companyId
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchScooterHistory(authUser.companyId, scooterId);
        setHistory(data);
      } catch (err) {
        console.error('Error fetching scooter history:', err);
        setError(err.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [authUser.companyId, scooterId]);

  const calculateStats = () => {
    const totalBookings = history.length;
    const activeBookings = history.filter(h => !h.endTime).length;
    const completedBookings = totalBookings - activeBookings;
    
    let totalDuration = 0;
    let totalRevenue  = 0;
    history.forEach(booking => {
      if (booking.endTime) {
        const start = new Date(booking.startTime);
        const end = new Date(booking.endTime);
        totalDuration += (end - start) / (1000 * 60); // minutes
        totalRevenue  += (booking.fare || 0);
      }
    });
    
    const avgDuration = completedBookings > 0 ? Math.round(totalDuration / completedBookings) : 0;
    const avgFare     = completedBookings > 0 ? (totalRevenue / completedBookings).toFixed(2) : 0;
    
    return { totalBookings, activeBookings, completedBookings, avgDuration, totalRevenue: totalRevenue.toFixed(2), avgFare };
  };

  const formatDuration = (startTime, endTime) => {
    if (!endTime) return null;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.floor((end - start) / (1000 * 60)); // minutes
    
    if (duration < 60) {
      return `${duration}m`;
    }
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusBadge = (booking) => {
    const isActive = !booking.endTime;
    return (
      <span style={{
        ...styles.statusBadge,
        ...(isActive ? styles.statusActive : styles.statusCompleted)
      }}>
        <div style={{
          ...styles.statusDot,
          backgroundColor: isActive ? '#10b981' : '#6b7280'
        }}></div>
        {isActive ? 'Active' : 'Completed'}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <Loader2 size={32} style={styles.spinner} />
          <p style={styles.loadingText}>Loading scooter history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <AlertCircle size={48} style={styles.errorIcon} />
          <h3 style={styles.errorTitle}>Error Loading History</h3>
          <p style={styles.errorMessage}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.titleSection}>
            <Link to="/partner/dashboard" style={styles.backButton}>
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </Link>
            <div style={styles.titleContainer}>
              <div style={styles.iconContainer}>
                <Zap size={24} style={styles.headerIcon} />
              </div>
              <div>
                <h1 style={styles.title}>Scooter History</h1>
                <p style={styles.subtitle}>ID: {scooterId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <TrendingUp size={20} style={styles.statIcon} />
            <span style={styles.statLabel}>Total Bookings</span>
          </div>
          <span style={styles.statValue}>{stats.totalBookings}</span>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <CheckCircle size={20} style={{...styles.statIcon, color: '#10b981'}} />
            <span style={styles.statLabel}>Completed</span>
          </div>
          <span style={styles.statValue}>{stats.completedBookings}</span>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <Clock size={20} style={{...styles.statIcon, color: '#f59e0b'}} />
            <span style={styles.statLabel}>Active</span>
          </div>
          <span style={styles.statValue}>{stats.activeBookings}</span>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <Calendar size={20} style={{...styles.statIcon, color: '#8b5cf6'}} />
            <span style={styles.statLabel}>Avg Duration</span>
          </div>
          <span style={styles.statValue}>{stats.avgDuration}m</span>
        </div>
        <div style={styles.statCard}>
        <div style={styles.statHeader}>
          <TrendingUp size={20} style={{ ...styles.statIcon, color: '#9333ea' }} />
          <span style={styles.statLabel}>Total Revenue</span>
        </div>
        <span style={styles.statValue}>${stats.totalRevenue}</span>
      </div>
      <div style={styles.statCard}>
        <div style={styles.statHeader}>
          <Clock size={20} style={{ ...styles.statIcon, color: '#d97706' }} />
          <span style={styles.statLabel}>Avg Fare</span>
        </div>
        <span style={styles.statValue}>${stats.avgFare}</span>
      </div>
      </div>

      {/* History Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>Booking History ({history.length})</h2>
        </div>
        
        {history.length === 0 ? (
          <div style={styles.emptyState}>
            <Calendar size={64} style={styles.emptyIcon} />
            <h3 style={styles.emptyTitle}>No Booking History</h3>
            <p style={styles.emptyMessage}>This scooter hasn't been booked yet.</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.tableHeaderCell}>Booking ID</th>
                  <th style={styles.tableHeaderCell}>User ID</th>
                  <th style={styles.tableHeaderCell}>Start Time</th>
                  <th style={styles.tableHeaderCell}>End Time</th>
                  <th style={styles.tableHeaderCell}>Duration</th>
                  <th style={styles.tableHeaderCell}>Fare</th>
                  <th style={styles.tableHeaderCell}>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((booking, index) => (
                  <tr key={booking.bookingId} style={{
                    ...styles.tableRow,
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb'
                  }}>
                    <td style={styles.tableCell}>
                      <div style={styles.bookingIdContainer}>
                        <span style={styles.bookingId}>#{booking.bookingId}</span>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.userContainer}>
                        <User size={16} style={styles.userIcon} />
                        <span>{booking.userId}</span>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.timeContainer}>
                        <span style={styles.date}>
                          {new Date(booking.startTime).toLocaleDateString()}
                        </span>
                        <span style={styles.time}>
                          {new Date(booking.startTime).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      {booking.endTime ? (
                        <div style={styles.timeContainer}>
                          <span style={styles.date}>
                            {new Date(booking.endTime).toLocaleDateString()}
                          </span>
                          <span style={styles.time}>
                            {new Date(booking.endTime).toLocaleTimeString()}
                          </span>
                        </div>
                      ) : (
                        <span style={styles.inProgress}>In progress</span>
                      )}
                    </td>
                  
                    <td style={styles.tableCell}>
                      {formatDuration(booking.startTime, booking.endTime) || (
                        <span style={styles.noDuration}>-</span>
                      )}
                    </td>
                    <td style={styles.tableCell}>
                      {booking.fare}
                    </td>
                    <td style={styles.tableCell}>
                      {getStatusBadge(booking)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '1.5rem'
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px'
  },
  
  spinner: {
    color: '#3b82f6',
    animation: 'spin 1s linear infinite'
  },
  
  loadingText: {
    marginTop: '1rem',
    color: '#6b7280',
    fontSize: '1rem'
  },
  
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    textAlign: 'center'
  },
  
  errorIcon: {
    color: '#ef4444',
    marginBottom: '1rem'
  },
  
  errorTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '0.5rem'
  },
  
  errorMessage: {
    color: '#6b7280',
    marginBottom: '1.5rem'
  },
  
  retryButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500'
  },
  
  header: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    marginBottom: '1.5rem'
  },
  
  headerContent: {
    padding: '1.5rem'
  },
  
  titleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    alignSelf: 'flex-start'
  },
  
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  
  iconContainer: {
    padding: '0.75rem',
    backgroundColor: '#fef3c7',
    borderRadius: '0.75rem'
  },
  
  headerIcon: {
    color: '#f59e0b'
  },
  
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#111827',
    margin: 0
  },
  
  subtitle: {
    color: '#6b7280',
    margin: '0.25rem 0 0 0',
    fontSize: '0.875rem'
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  
  statCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },
  
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem'
  },
  
  statIcon: {
    color: '#6b7280'
  },
  
  statLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: '500'
  },
  
  statValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#111827'
  },
  
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden'
  },
  
  tableHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  },
  
  tableTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  },
  
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  
  emptyIcon: {
    color: '#d1d5db',
    marginBottom: '1rem'
  },
  
  emptyTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '0.5rem'
  },
  
  emptyMessage: {
    color: '#6b7280'
  },
  
  tableWrapper: {
    overflowX: 'auto'
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  
  tableHeaderRow: {
    backgroundColor: '#f9fafb'
  },
  
  tableHeaderCell: {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #e5e7eb'
  },
  
  tableRow: {
    borderBottom: '1px solid #f3f4f6'
  },
  
  tableCell: {
    padding: '1rem',
    fontSize: '0.875rem'
  },
  
  bookingIdContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  
  bookingId: {
    fontWeight: '600',
    color: '#111827'
  },
  
  userContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  
  userIcon: {
    color: '#6b7280'
  },
  
  timeContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  
  date: {
    fontWeight: '500',
    color: '#111827'
  },
  
  time: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  
  inProgress: {
    color: '#10b981',
    fontWeight: '600'
  },
  
  noDuration: {
    color: '#9ca3af'
  },
  
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500',
    border: '1px solid'
  },
  
  statusActive: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderColor: '#a7f3d0'
  },
  
  statusCompleted: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    borderColor: '#d1d5db'
  },
  
  statusDot: {
    width: '0.375rem',
    height: '0.375rem',
    borderRadius: '50%'
  }
};
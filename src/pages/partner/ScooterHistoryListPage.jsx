import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { decodeJwt, fetchPartnerScooters } from '../../api/gatewayClient';
import { Zap, ChevronRight, Loader2, AlertCircle, Search, Filter } from 'lucide-react';

export default function ScooterHistoryListPage() {
  const [scooters, setScooters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredScooters, setFilteredScooters] = useState([]);
  
  const token = localStorage.getItem('authToken');
  const companyId = decodeJwt(token).sub;

  useEffect(() => {
    const loadScooters = async () => {
      try {
        setLoading(true);
        const data = await fetchPartnerScooters(companyId);
        const list = Array.isArray(data)
          ? data.map(s => ({ id: s.scooterId || s.id, name: s.name }))
          : [];
        setScooters(list);
        setFilteredScooters(list);
        setError(null);
      } catch (err) {
        console.error('Failed to load scooters:', err);
        setError('Failed to load scooter data');
      } finally {
        setLoading(false);
      }
    };

    loadScooters();
  }, [companyId]);

  useEffect(() => {
    const filtered = scooters.filter(scooter =>
      scooter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scooter.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredScooters(filtered);
  }, [searchTerm, scooters]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <Loader2 size={32} style={styles.spinner} />
          <p style={styles.loadingText}>Loading scooter data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <AlertCircle size={48} style={styles.errorIcon} />
          <h3 style={styles.errorTitle}>Error Loading Data</h3>
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

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.titleSection}>
            <div style={styles.iconContainer}>
              <Zap size={24} style={styles.headerIcon} />
            </div>
            <div>
              <h1 style={styles.title}>Scooter History</h1>
              <p style={styles.subtitle}>View detailed history for each scooter in your fleet</p>
            </div>
          </div>
          <div style={styles.statsContainer}>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>{scooters.length}</span>
              <span style={styles.statLabel}>Total Scooters</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={styles.controlsSection}>
        <div style={styles.searchContainer}>
          <Search size={20} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by scooter name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.resultsInfo}>
          <Filter size={16} style={styles.filterIcon} />
          <span style={styles.resultsText}>
            Showing {filteredScooters.length} of {scooters.length} scooters
          </span>
        </div>
      </div>

      {/* Scooter List */}
      <div style={styles.listContainer}>
        {filteredScooters.length === 0 ? (
          <div style={styles.emptyState}>
            <Zap size={64} style={styles.emptyIcon} />
            <h3 style={styles.emptyTitle}>
              {searchTerm ? 'No scooters match your search' : 'No scooters found'}
            </h3>
            <p style={styles.emptyMessage}>
              {searchTerm 
                ? 'Try adjusting your search terms or clear the search to see all scooters.'
                : 'Add scooters to your fleet to view their history here.'
              }
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                style={styles.clearButton}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div style={styles.scooterGrid}>
            {filteredScooters.map(scooter => (
              <Link
                key={scooter.id}
                to={`/partner/scooters/${scooter.id}/history`}
                style={styles.scooterCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.scooterIconContainer}>
                    <Zap size={20} style={styles.scooterIcon} />
                  </div>
                  <div style={styles.scooterInfo}>
                    <h3 style={styles.scooterName}>{scooter.name}</h3>
                    <p style={styles.scooterId}>ID: {scooter.id}</p>
                  </div>
                  <ChevronRight size={20} style={styles.chevron} />
                </div>
                <div style={styles.cardFooter}>
                  <span style={styles.viewHistoryText}>View History</span>
                </div>
              </Link>
            ))}
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
    padding: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  
  iconContainer: {
    padding: '0.75rem',
    backgroundColor: '#dbeafe',
    borderRadius: '0.75rem'
  },
  
  headerIcon: {
    color: '#3b82f6'
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
  
  statsContainer: {
    display: 'flex',
    gap: '2rem'
  },
  
  statItem: {
    textAlign: 'center'
  },
  
  statNumber: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#111827'
  },
  
  statLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  
  controlsSection: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    padding: '1rem',
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem'
  },
  
  searchContainer: {
    position: 'relative',
    flex: 1,
    maxWidth: '400px'
  },
  
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af'
  },
  
  searchInput: {
    width: '100%',
    padding: '0.5rem 0.75rem 0.5rem 2.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.15s ease-in-out'
  },
  
  resultsInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  
  filterIcon: {
    color: '#6b7280'
  },
  
  resultsText: {
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  
  listContainer: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden'
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
    color: '#6b7280',
    marginBottom: '1.5rem'
  },
  
  clearButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500'
  },
  
  scooterGrid: {
    padding: '1.5rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem'
  },
  
  scooterCard: {
    display: 'block',
    padding: '1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    backgroundColor: '#fafafa',
    transition: 'all 0.15s ease-in-out',
    cursor: 'pointer'
  },
  
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem'
  },
  
  scooterIconContainer: {
    padding: '0.5rem',
    backgroundColor: '#fef3c7',
    borderRadius: '0.5rem',
    flexShrink: 0
  },
  
  scooterIcon: {
    color: '#f59e0b'
  },
  
  scooterInfo: {
    flex: 1
  },
  
  scooterName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  },
  
  scooterId: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: '0.25rem 0 0 0'
  },
  
  chevron: {
    color: '#9ca3af',
    flexShrink: 0
  },
  
  cardFooter: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '0.75rem'
  },
  
  viewHistoryText: {
    fontSize: '0.875rem',
    color: '#3b82f6',
    fontWeight: '500'
  }
};
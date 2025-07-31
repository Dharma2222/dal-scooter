// src/pages/partner/FeedbackTablePage.jsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchAllFeedback } from '../../api/gatewayClient'; // GET /feedback/all
import {
  MessageSquare,
  Star,
  User,
  Calendar,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Clock,
  FileText,
  ChevronDown,
  X
} from 'lucide-react';

export default function FeedbackTablePage() {
  const { authUser } = useAuth();
  const isPartner = authUser?.role === 'Franchise';

  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [err, setErr] = useState();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');

  const loadFeedback = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const data = await fetchAllFeedback();
      setRows(data);
      setFilteredRows(data);
      setErr(null);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  // Apply filters whenever search term or filters change
  useEffect(() => {
    let filtered = rows;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(row =>
        row.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.scooterId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.scooterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.userId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      filtered = filtered.filter(row => row.rating === parseInt(ratingFilter));
    }

    // Sentiment filter
    if (sentimentFilter !== 'all') {
      filtered = filtered.filter(row => 
        (row.sentiment || 'neutral').toLowerCase() === sentimentFilter
      );
    }

    setFilteredRows(filtered);
  }, [rows, searchTerm, ratingFilter, sentimentFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setRatingFilter('all');
    setSentimentFilter('all');
  };

  const hasActiveFilters = searchTerm || ratingFilter !== 'all' || sentimentFilter !== 'all';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-gray-600 text-lg">Loading feedback data...</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border max-w-md">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-6">{err}</p>
          <button 
            onClick={() => loadFeedback()} 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customer Feedback</h1>
                <p className="text-gray-600 mt-1">
                  {filteredRows.length} of {rows.length} feedback entries
                </p>
              </div>
              <button
                onClick={() => loadFeedback(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={refreshing ? 'animate-spin' : ''} size={16} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search comments, scooter ID, user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Rating Filter */}
              <div className="relative">
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>

              {/* Sentiment Filter */}
              <div className="relative">
                <select
                  value={sentimentFilter}
                  onChange={(e) => setSentimentFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Sentiments</option>
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      Date & Time
                    </div>
                  </th>
                  {isPartner && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Zap size={14} />
                        Scooter
                      </div>
                    </th>
                  )}
                  {isPartner && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        User ID
                      </div>
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Star size={14} />
                      Rating
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} />
                      Comment
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={14} />
                      Sentiment
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={isPartner ? 6 : 4} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <MessageSquare className="mx-auto mb-4" size={48} />
                        <p className="text-lg font-medium">No feedback found</p>
                        <p className="text-sm">
                          {hasActiveFilters ? 'Try adjusting your filters' : 'No feedback data available'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((r, i) => (
                    <tr
                      key={r.feedbackId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatDate(r.createdAt)}</div>
                        <div className="text-sm text-gray-500">{formatTime(r.createdAt)}</div>
                      </td>
                      {isPartner && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono font-medium text-gray-900">{r.scooterId}</div>
                          {r.scooterName && (
                            <div className="text-sm text-gray-500">{r.scooterName}</div>
                          )}
                        </td>
                      )}
                      {isPartner && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">{r.userId}</div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{r.rating}</span>
                          <div className="flex">{getRatingStars(r.rating)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {r.comment || <span className="text-gray-400 italic">No comment</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSentimentBadge(r.sentiment, r.sentimentScore)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.ceil((now - d) / (1000 * 60 * 60 * 24));
  if (diff === 1) return 'Today';
  if (diff === 2) return 'Yesterday';
  if (diff <= 7) return `${diff - 1} days ago`;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getRatingStars(rating) {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={16}
      fill={i < rating ? '#f59e0b' : 'none'}
      color={i < rating ? '#f59e0b' : '#e5e7eb'}
    />
  ));
}

function getSentimentBadge(sentiment, score) {
  const s = (sentiment || 'neutral').toLowerCase();
  
  const baseClasses = "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium";
  
  const variants = {
    positive: "bg-green-100 text-green-800 border border-green-200",
    negative: "bg-red-100 text-red-800 border border-red-200",
    neutral: "bg-gray-100 text-gray-800 border border-gray-200"
  };

  const Icon = s === 'positive'
    ? TrendingUp
    : s === 'negative'
      ? TrendingDown
      : Minus;

  return (
    <span className={`${baseClasses} ${variants[s] || variants.neutral}`}>
      <Icon size={12} />
      <span className="capitalize">{sentiment || 'Neutral'}</span>
      <span className="text-xs opacity-75">
        ({score?.toFixed(2) || '0.00'})
      </span>
    </span>
  );
}
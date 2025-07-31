// src/pages/user/FeedbackPage.jsx
import React, { useEffect, useState } from 'react';
import { fetchAllFeedback } from '../../api/gatewayClient'; // GET /feedback?userId=…
import { Star, MessageSquare, TrendingUp, TrendingDown, Minus, Calendar, Filter, Download } from 'lucide-react';
import { decodeJwt } from '../../api/gatewayClient';

export default function FeedbackPage() {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [err, setErr] = useState();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    scooterName: '',
    rating: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userId = decodeJwt(token)?.sub;
        const data = await fetchAllFeedback({ userId });
        setRows(data);
        setFilteredRows(data);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter effect
  useEffect(() => {
    let filtered = rows;

    // Filter by scooter name
    if (filters.scooterName) {
      filtered = filtered.filter(fb => 
        (fb.scooterName || fb.scooterId || '').toLowerCase().includes(filters.scooterName.toLowerCase())
      );
    }

    // Filter by rating
    if (filters.rating) {
      filtered = filtered.filter(fb => fb.rating === parseInt(filters.rating));
    }

    setFilteredRows(filtered);
  }, [rows, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      scooterName: '',
      rating: ''
    });
  };

  const uniqueScooters = [...new Set(rows.map(fb => fb.scooterName || fb.scooterId))].filter(Boolean).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Feedback</h3>
            <p className="text-red-600">{err}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!filteredRows.length && !filters.scooterName && !filters.rating) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Feedback Yet</h3>
            <p className="text-gray-600">Your ride feedback will appear here once you start submitting reviews.</p>
          </div>
        </div>
      </div>
    );
  }

  const avgRating = filteredRows.length > 0 ? filteredRows.reduce((sum, fb) => sum + fb.rating, 0) / filteredRows.length : 0;
  const sentimentCounts = filteredRows.reduce((acc, fb) => {
    const sentiment = (fb.sentiment || 'neutral').toLowerCase();
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Ride Feedback</h1>
                <p className="text-gray-600 mt-1">Your scooter ride experiences and reviews</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    showFilters || filters.scooterName || filters.rating
                      ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <Filter size={16} />
                  Filter
                  {(filters.scooterName || filters.rating) && (
                    <span className="bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5 ml-1">
                      {[filters.scooterName, filters.rating].filter(Boolean).length}
                    </span>
                  )}
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Filter Feedback</h3>
                  {(filters.scooterName || filters.rating) && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Scooter Name Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scooter Name
                    </label>
                    <select
                      value={filters.scooterName}
                      onChange={(e) => handleFilterChange('scooterName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">All Scooters</option>
                      {uniqueScooters.map(scooter => (
                        <option key={scooter} value={scooter}>{scooter}</option>
                      ))}
                    </select>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <select
                      value={filters.rating}
                      onChange={(e) => handleFilterChange('rating', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">All Ratings</option>
                      {[5, 4, 3, 2, 1].map(rating => (
                        <option key={rating} value={rating}>
                          {rating} Star{rating !== 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(filters.scooterName || filters.rating) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Active filters:</p>
                    <div className="flex flex-wrap gap-2">
                      {filters.scooterName && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          Scooter: {filters.scooterName}
                          <button
                            onClick={() => handleFilterChange('scooterName', '')}
                            className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {filters.rating && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          Rating: {filters.rating} Star{filters.rating !== '1' ? 's' : ''}
                          <button
                            onClick={() => handleFilterChange('rating', '')}
                            className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredRows.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Average Rating</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={i < Math.floor(avgRating) ? '#fbbf24' : 'none'}
                            stroke="#fbbf24"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Positive Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{sentimentCounts.positive || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Negative Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{sentimentCounts.negative || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Table */}
          {filteredRows.length === 0 && (filters.scooterName || filters.rating) ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600 mb-4">No feedback matches your current filters.</p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Feedback</h2>
                {filteredRows.length !== rows.length && (
                  <span className="text-sm text-gray-500">
                    Showing {filteredRows.length} of {rows.length} reviews
                  </span>
                )}
              </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scooter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sentiment
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRows.map((fb, index) => (
                    <tr key={fb.feedbackId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Calendar size={14} className="text-gray-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(fb.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(fb.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {fb.scooterName || fb.scooterId}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{fb.rating}</span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                fill={i < fb.rating ? '#fbbf24' : 'none'}
                                stroke="#fbbf24"
                                className="drop-shadow-sm"
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {fb.comment ? (
                            <span className="line-clamp-2">{fb.comment}</span>
                          ) : (
                            <span className="text-gray-400 italic">No comment</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const s = (fb.sentiment || 'neutral').toLowerCase();
                          const Icon = s === 'positive' ? TrendingUp : s === 'negative' ? TrendingDown : Minus;
                          const colorClasses = s === 'positive' 
                            ? 'text-green-700 bg-green-50 border-green-200' 
                            : s === 'negative' 
                            ? 'text-red-700 bg-red-50 border-red-200'
                            : 'text-gray-700 bg-gray-50 border-gray-200';
                          
                          return (
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${colorClasses}`}>
                              <Icon size={12} />
                              <span className="capitalize">{fb.sentiment || 'neutral'}</span>
                              {fb.sentimentScore && (
                                <span className="text-xs opacity-75">
                                  ({fb.sentimentScore.toFixed(2)})
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
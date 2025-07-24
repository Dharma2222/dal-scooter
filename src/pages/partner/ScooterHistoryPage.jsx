// src/pages/partner/ScooterHistoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchScooterHistory } from '../../api/gatewayClient';

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

  if (loading) return <div className="p-6 text-center">Loading history...</div>;
  if (error)   return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Scooter History: {scooterId}</h2>
        <Link to="/partner/dashboard" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
      {history.length === 0 ? (
        <div className="text-gray-600">No bookings found for this scooter.</div>
      ) : (
        <table className="min-w-full bg-white border rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Booking ID</th>
              <th className="px-4 py-2 text-left">User ID</th>
              <th className="px-4 py-2 text-left">Start Time</th>
              <th className="px-4 py-2 text-left">End Time</th>
            </tr>
          </thead>
          <tbody>
            {history.map(({ bookingId, userId, startTime, endTime }) => (
              <tr key={bookingId} className="border-t">
                <td className="px-4 py-2">{bookingId}</td>
                <td className="px-4 py-2">{userId}</td>
                <td className="px-4 py-2">{new Date(startTime).toLocaleString()}</td>
                <td className="px-4 py-2">
                  {endTime ? new Date(endTime).toLocaleString() : 'In progress'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { fetchUserBookings } from '../../api/gatewayClient';
import { useAuth } from '../../context/AuthContext';

export default function BookingHistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchUserBookings().then(setHistory);
  }, []);

  return (
    <table className="min-w-full text-left">
      <thead>
        <tr>
        <th>Booking Id</th><th>Scooter</th><th>Start</th><th>End</th>
        </tr>
      </thead>
      <tbody>
        {history.map(b => (
          <tr key={b.bookingId}>
            <td>{b.bookingId}</td>
            <td>{b.scooterId}</td>
            <td>{new Date(b.startTime).toLocaleString()}</td>
            <td>{b.endTime ? new Date(b.endTime).toLocaleString() : 'In progress'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

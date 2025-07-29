// src/pages/user/BookingPage.jsx
import React, { useEffect, useState } from 'react';
import { fetchAvailableScooters, startRide, endRide } from '../../api/gatewayClient';
import { useAuth } from '../../context/AuthContext';
import ScooterMap from '../../components/ScooterMap';
import FeedbackForm from '../../components/FeedbackForm';

export default function BookingPage() {
  const { authUser } = useAuth();
  const [scooters, setScooters]             = useState([]);
  const [activeBooking, setActiveBooking]   = useState(null);
  const [showFeedback, setShowFeedback]     = useState(false);
  const [lastBooking, setLastBooking]       = useState(null);

  // Load available scooters on mount
  useEffect(() => {
    fetchAvailableScooters()
      .then(setScooters)
      .catch(console.error);
  }, []);

  // Start ride: pass scooterId and let the helper grab userId from the JWT
  const handleStart = async (scooterId) => {
    try {
      const booking = await startRide({ scooterId });
      setActiveBooking(booking);
      setScooters(s => s.filter(x => x.id !== scooterId));
    } catch (err) {
      console.error('Start ride failed', err);
      alert('Could not start ride. Please try again.');
    }
  };

  // End ride: update backend, then launch feedback
  const handleEnd = () => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await endRide({
            bookingId: activeBooking.bookingId,
            latitude:  coords.latitude,
            longitude: coords.longitude,
          });
          // stash booking info for the feedback form
          setLastBooking(activeBooking);
          setActiveBooking(null);
          setShowFeedback(true);
          // refresh the map/list
          fetchAvailableScooters().then(setScooters).catch(console.error);
        } catch (err) {
          console.error('End ride failed', err);
          alert('Could not end ride. Please try again.');
        }
      },
      (err) => {
        console.error('Geolocation error', err);
        alert('Unable to read your location.');
      }
    );
  };

  // Close feedback form
  const handleFeedbackClose = () => {
    setShowFeedback(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* 1) If a ride is active, show End Ride */}
      {activeBooking && !showFeedback && (
        <button
          onClick={handleEnd}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          End Ride
        </button>
      )}

      {/* 2) Otherwise, show map + list */}
      {!activeBooking && !showFeedback && (
        <>
          <div className="h-96 w-full">
            <ScooterMap scooters={scooters} />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {scooters.map(s => (
              <div key={s.id} className="p-4 border rounded">
                <h3 className="font-bold">{s.name}</h3>
                <button
                  onClick={() => handleStart(s.scooterId)}
                  className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
                >
                  Start Ride
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 3) Feedback modal */}
      {showFeedback && lastBooking && (
        <FeedbackForm
          bookingId={lastBooking.bookingId}
          scooterId={lastBooking.scooterId}
          onClose={handleFeedbackClose}
        />
      )}
    </div>
  );
}

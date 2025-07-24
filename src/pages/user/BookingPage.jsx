// src/pages/user/BookingPage.jsx
import React, { useEffect, useState } from 'react';
import { fetchAvailableScooters, startRide, endRide } from '../../api/gatewayClient';
import { useAuth } from '../../context/AuthContext';
import ScooterMap from '../../components/ScooterMap';

export default function BookingPage() {
  const { authUser } = useAuth();
  const [scooters, setScooters] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);

  useEffect(() => {
    fetchAvailableScooters().then(setScooters);
  }, []);

  const handleStart = async (scooterId ) => {
    console.log(scooters)

    const booking = await startRide({
      scooterId,  //: scooterId.id,
      userId: authUser.sub,
    });
    setActiveBooking(booking);
    setScooters(s => s.filter(x => x.id !== scooterId));
  };

  const handleEnd = async () => {
    // grab user's current geolocation
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      await endRide({
        bookingId: activeBooking.bookingId,
        latitude: coords.latitude,
        longitude: coords.longitude
      });
      setActiveBooking(null);
      fetchAvailableScooters().then(setScooters);
    });
  };

  return (
    <div className="p-6 space-y-6">
      {activeBooking ? (
        <button
          onClick={handleEnd}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          End Ride
        </button>
      ) : (
        <>
          <ScooterMap scooters={scooters} />
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
    </div>
  );
}

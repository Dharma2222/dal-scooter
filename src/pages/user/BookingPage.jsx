import React, { useEffect, useState } from 'react';
import { fetchAvailableScooters, startRide, endRide } from '../../api/gatewayClient';
import { useAuth } from '../../context/AuthContext';
import ScooterMap from '../../components/ScooterMap';
import FeedbackForm from '../../components/FeedbackForm';
import { MapPin, Zap, Clock, Battery, Play, Square, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function BookingPage() {
  const { authUser } = useAuth();
  const [scooters, setScooters] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingRide, setStartingRide] = useState(null);
  const [endingRide, setEndingRide] = useState(false);
  const [error, setError] = useState(null);
  const [rideTimer, setRideTimer] = useState(0);

  // Timer for active ride
  useEffect(() => {
    let interval;
    if (activeBooking) {
      interval = setInterval(() => {
        const startTime = new Date(activeBooking.startTime || Date.now());
        const now = new Date();
        setRideTimer(Math.floor((now - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeBooking]);

  // Load available scooters on mount
  useEffect(() => {
    const loadScooters = async () => {
      try {
        setLoading(true);
        const data = await fetchAvailableScooters();
        setScooters(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load scooters:', err);
        setError('Failed to load available scooters');
      } finally {
        setLoading(false);
      }
    };
    
    loadScooters();
  }, []);

  // Start ride: pass scooterId and let the helper grab userId from the JWT
  const handleStart = async (scooterId) => {
    try {
      setStartingRide(scooterId);
      const booking = await startRide({ scooterId });
      setActiveBooking(booking);
      setScooters(s => s.filter(x => x.id !== scooterId));
      setError(null);
    } catch (err) {
      console.error('Start ride failed', err);
      setError('Could not start ride. Please try again.');
    } finally {
      setStartingRide(null);
    }
  };

  // End ride: update backend, then launch feedback
  const handleEnd = () => {
    setEndingRide(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await endRide({
            bookingId: activeBooking.bookingId,
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
          // stash booking info for the feedback form
          setLastBooking(activeBooking);
          setActiveBooking(null);
          setShowFeedback(true);
          setRideTimer(0);
          // refresh the map/list
          const data = await fetchAvailableScooters();
          setScooters(data);
          setError(null);
        } catch (err) {
          console.error('End ride failed', err);
          setError('Could not end ride. Please try again.');
        } finally {
          setEndingRide(false);
        }
      },
      (err) => {
        console.error('Geolocation error', err);
        setError('Unable to read your location.');
        setEndingRide(false);
      }
    );
  };

  // Close feedback form
  const handleFeedbackClose = () => {
    setShowFeedback(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
              <p className="mt-3 text-gray-600">Loading available scooters...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Scooter Booking</h1>
              <p className="text-gray-600">Find and book available electric scooters</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 flex-1">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 text-xl leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Active Ride Panel */}
        {activeBooking && !showFeedback && (
          <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Active Ride</h3>
                  <p className="text-gray-600">Scooter ID: {activeBooking.scooterId}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-lg font-mono font-semibold text-gray-900">
                      {formatTime(rideTimer)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Duration</p>
                </div>

                <button
                  onClick={handleEnd}
                  disabled={endingRide}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                >
                  {endingRide ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Ending Ride...</span>
                    </>
                  ) : (
                    <>
                      <Square className="h-4 w-4" />
                      <span>End Ride</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map and Scooter List */}
        {!activeBooking && !showFeedback && (
          <>
            {/* Map Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Map View</h2>
                </div>
              </div>
              <div className="h-96 w-full">
                <ScooterMap scooters={scooters} />
              </div>
            </div>

            {/* Scooter List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  Available Scooters ({scooters.length})
                </h2>
              </div>
              
              {scooters.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Scooters Available</h3>
                  <p className="text-gray-500">Check back later or try a different location</p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scooters.map(scooter => (
                      <div key={scooter.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-yellow-50 rounded-lg">
                              <Zap className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{scooter.name}</h3>
                              <p className="text-sm text-gray-500">ID: {scooter.scooterId}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-green-600">
                            <Battery className="h-4 w-4" />
                            <span className="text-sm font-medium">85%</span>
                          </div>
                        </div>

                        {/* <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                          <MapPin className="h-4 w-4" />
                          <span>Available nearby</span>
                        </div> */}

                        <button
                          onClick={() => handleStart(scooter.scooterId)}
                          disabled={startingRide === scooter.scooterId}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          {startingRide === scooter.scooterId ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Starting...</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4" />
                              <span>Start Ride</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Feedback Modal */}
        {showFeedback && lastBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <FeedbackForm
                bookingId={lastBooking.bookingId}
                scooterId={lastBooking.scooterId}
                onClose={handleFeedbackClose}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
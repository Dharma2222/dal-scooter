const functions = require('@google-cloud/functions-framework');
const axios = require('axios');

// Your actual API Gateway URLs
const SCOOTER_API_URL = 'https://iwazomvgd6.execute-api.us-east-1.amazonaws.com/api/scooter';
const BOOKING_API_URL = 'https://e5mlkm1bfa.execute-api.us-east-1.amazonaws.com/prod/booking';

functions.http('dialogflowWebhook', async (req, res) => {
  console.log('Dialogflow Request:', JSON.stringify(req.body, null, 2));
  
  // Add CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  // Validate request structure
  if (!req.body || !req.body.queryResult) {
    console.error('Invalid request structure:', req.body);
    return res.status(400).json({
      fulfillmentText: "Invalid request format"
    });
  }
  
  const intent = req.body.queryResult.intent?.displayName;
  const parameters = req.body.queryResult.parameters || {};
  
  console.log('Intent detected:', intent);
  console.log('Parameters:', parameters);
  console.log('Using SCOOTER_API_URL:', SCOOTER_API_URL);
  console.log('Using BOOKING_API_URL:', BOOKING_API_URL);
  
  try {
    if (intent === 'find_scooter') {
      const scooterId = parameters.scooter_id || parameters['scooter-id'] || parameters.scooterId;
      
      if (!scooterId) {
        return res.json({
          fulfillmentText: "I couldn't find a scooter ID in your request. Please provide a valid scooter ID."
        });
      }
      
      try {
        const apiUrl = `${SCOOTER_API_URL}?scooterId=${encodeURIComponent(scooterId)}`;
        console.log('Calling scooter API:', apiUrl);
        
        const response = await axios.get(apiUrl, {
          timeout: 10000, // 10 second timeout
          headers: {
            'User-Agent': 'Dialogflow-Webhook/1.0'
          }
        });
        
        let scooterData = response.data;
        console.log('Raw Scooter API response:', scooterData);
        
        // Handle nested response structure
        if (scooterData.body) {
          // If body is a string, parse it
          if (typeof scooterData.body === 'string') {
            scooterData = JSON.parse(scooterData.body);
          } else {
            scooterData = scooterData.body;
          }
        }
        console.log('Parsed Scooter data:', scooterData);
        
        if (scooterData && scooterData.length > 0) {
          const scooter = scooterData[0];
          const fulfillmentText = `🛴 Found scooter ${scooterId}!\n📋 Name: ${scooter.name || 'Unknown'}\n📍 🏢 ✅ Available: ${scooter.isAvailable ? 'Yes' : 'No'}\n📍 Location: ${scooter.latitude || 'Unknown'}, ${scooter.longitude || 'Unknown'}`;
          
          return res.json({
            fulfillmentText: fulfillmentText
          });
        } else {
          return res.json({
            fulfillmentText: `❌ Sorry, I couldn't find a scooter with ID: ${scooterId}. Please check the ID and try again.`
          });
        }
      } catch (error) {
        console.error('Scooter API Error:', error.message);
        console.error('Error details:', error.response?.data);
        console.error('Status code:', error.response?.status);
        return res.json({
          fulfillmentText: `❌ Sorry, I encountered an error looking up scooter ${scooterId}. Please try again later.`
        });
      }
    }
    
    else if (intent === 'get_booking') {
      // Try multiple parameter names that might be used
      const bookingRef = parameters.booking_ref || 
                        parameters['booking-ref'] || 
                        parameters.bookingRef || 
                        parameters.booking_reference ||
                        parameters['booking-reference'];
      
      console.log('Looking for booking reference in parameters:', parameters);
      console.log('Found booking reference:', bookingRef);
      
      if (!bookingRef) {
        return res.json({
          fulfillmentText: "I couldn't find a booking reference in your request. Please provide a valid booking reference."
        });
      }
      
      try {
        const apiUrl = `${BOOKING_API_URL}?bookingId=${encodeURIComponent(bookingRef)}`;
        console.log('Calling booking API:', apiUrl);
        
        const response = await axios.get(apiUrl, {
          timeout: 10000, // 10 second timeout
          headers: {
            'User-Agent': 'Dialogflow-Webhook/1.0'
          }
        });
        
        let bookingData = response.data;
        console.log('Raw Booking API response:', bookingData);
        
        // Handle nested response structure
        if (bookingData.body) {
          // If body is a string, parse it
          if (typeof bookingData.body === 'string') {
            bookingData = JSON.parse(bookingData.body);
          } else {
            bookingData = bookingData.body;
          }
        }
        console.log('Parsed Booking data:', bookingData);
        
        if (bookingData && bookingData.length > 0) {
          const booking = bookingData[0];
          
          // Convert timestamps to readable dates
          const startTime = booking.startTime ? new Date(parseInt(booking.startTime)).toLocaleString() : 'Unknown';
          const endTime = booking.endTime && booking.endTime !== '0' ? new Date(parseInt(booking.endTime)).toLocaleString() : 'Not ended';
          
          const fulfillmentText = `📋 Found booking ${bookingRef}!\n👤 User ID: ${booking.userId || 'Unknown'}\n🛴 Scooter ID: ${booking.scooterId || 'Unknown'}\n📅 Start Time: ${startTime}\n⏰ End Time: ${endTime}`;
          
          return res.json({
            fulfillmentText: fulfillmentText
          });
        } else {
          return res.json({
            fulfillmentText: `❌ Sorry, I couldn't find a booking with reference: ${bookingRef}. Please check the reference and try again.`
          });
        }
      } catch (error) {
        console.error('Booking API Error:', error.message);
        console.error('Error details:', error.response?.data);
        console.error('Status code:', error.response?.status);
        return res.json({
          fulfillmentText: `❌ Sorry, I encountered an error looking up booking ${bookingRef}. Please try again later.`
        });
      }
    }
    
    // Default response for other intents or unhandled cases
    return res.json({
      fulfillmentText: "I can help you with:\n🛴 Looking up scooter information - just say 'Find scooter [ID]'\n📋 Checking booking details - just say 'Show booking [reference]'"
    });
    
  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({
      fulfillmentText: "Sorry, I encountered an unexpected error. Please try again later."
    });
  }
});
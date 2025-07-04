const { Firestore } = require('@google-cloud/firestore');
const cors = require('cors')({ origin: true });
const dialogflow = require('@google-cloud/dialogflow'); // Import Dialogflow client library

// Initialize Firestore
const db = new Firestore();

// Initialize Dialogflow Sessions Client
// IMPORTANT: Replace with your actual project ID
const projectId = 'dalscooterproject-464815'; // Your GCP Project ID
const sessionClient = new dialogflow.SessionsClient({
  // Key file can be implicitly picked up by Cloud Functions environment
  // or explicitly provided if running locally:
  // keyFilename: '/path/to/your/service-account-key.json'
});

exports.dalscooterWebhook = (req, res) => {
  return cors(req, res, async () => {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Access-Control-Max-Age', '3600');
      res.status(204).send('');
      return;
    }

    // Set CORS headers for actual requests
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST'); // Only POST is needed for main logic
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    try {
      const body = req.body;
      let fulfillmentText = '';

      // --- Scenario 1: Request from your React frontend (contains 'message') ---
      if (body.message) {
        const userInput = body.message;
        console.log('Received message from frontend:', userInput);

        // Create a session ID for Dialogflow
        const sessionId = "session_" + Date.now(); // Example session ID based on timestamp
        console.log('Using session ID:', sessionId);
        const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

        const request = {
          session: sessionPath,
          queryInput: {
            text: {
              text: userInput,
              languageCode: 'en-US', // Or your agent's language
            },
          },
        };

        console.log('Sending Detect Intent request to Dialogflow:', JSON.stringify(request));
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;

        fulfillmentText = result.fulfillmentText;
        console.log('Received response from Dialogflow Detect Intent:', fulfillmentText);

        

        return res.json({
          fulfillmentText: fulfillmentText // Send Dialogflow's result back to frontend
        });
      }

      // Scenario 2: Request from Dialogflow's webhook
      
      if (body.queryResult) {
        const intent = body.queryResult.intent.displayName;
        const parameters = body.queryResult.parameters;
        const queryText = body.queryResult.queryText || '';

        console.log('Received webhook request from Dialogflow. Intent:', intent);
        console.log('Parameters:', parameters);

        // Route to appropriate handler based on intent
        switch (intent) {
          case 'BOOKBIKEACCESSCODE':
            return await handleAccessCode(req, res, parameters);
          case 'CHECK_BIKE_AVAILABILITY':
            return await handleBikeAvailability(req, res, parameters);
          case 'SUBMIT_CUSTOMER_CONCERN':
            return await handleCustomerConcern(req, res, parameters, queryText);
          case 'VIEW_FEEDBACK':
            return await handleViewFeedback(req, res, parameters);
          case 'Default Welcome Intent': 
            return res.json({ fulfillmentText: "Hello there from the webhook! How can I assist with scooters today?" });
          default:
            
            fulfillmentText = body.queryResult.fulfillmentText || '🤖 I understand your request, but that intent is not fully implemented yet by my webhook.';
            return res.json({ fulfillmentText });
        }
      }

      // Fallback for unexpected request body format
      return res.status(400).json({
        fulfillmentText: ' Invalid request format. Please send a "message" for chat or a "queryResult" for webhook.'
      });

    } catch (error) {
      console.error('Webhook or Detect Intent error:', error);
      res.status(500).json({ // Send 500 status for server errors
        fulfillmentText: ' An error occurred while processing your request. Please try again later.'
      });
    }
  });
};


// 1. Access Code Handler
async function handleAccessCode(req, res, parameters) {
  const bookingRef = parameters['booking-reference'];

  if (!bookingRef) {
    return res.json({
      fulfillmentText: ' Please provide a valid booking reference code (e.g., ABC123).',
    });
  }

  try {
    const docRef = db.collection('Bookingd').doc(bookingRef);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.json({
        fulfillmentText: ` No booking found for reference ${bookingRef}. Please check your code.`,
      });
    }

    const data = doc.data();
    
    return res.json({
      fulfillmentText: `🔓 Access Code Details:\n\n` +
                     `• Booking: ${bookingRef}\n` +
                     `• Bike: ${data.bike_type || 'N/A'}\n` +
                     `• Access Code: ${data.AccessCode || 'N/A'}\n` +
                     `• Duration: ${data.Duration || 'N/A'}\n` +
                     `• Status: ${data.status || 'active'}\n\n` +
                     `Locate your bike and enter this code to unlock.`
    });

  } catch (error) {
    console.error('Access code error:', error);
    return res.json({
      fulfillmentText: ` Couldn't retrieve details for booking ${bookingRef}. Try again later.`,
    });
  }
}

// 2. Bike Availability Handler
async function handleBikeAvailability(req, res, parameters) {
  const bikeType = parameters['bike-type'];
  
  try {
    // Use the same collection pattern as your working code
    const docRef = db.collection('BikeAvailability').doc('current_status');
    const doc = await docRef.get();

    if (!doc.exists) {
      console.log('No availability document found');
      return res.json({
        fulfillmentText: ' Could not check availability. Please try again later.'
      });
    }

    const availability = doc.data();
    console.log('Availability data:', availability);
    
    if (bikeType && availability[bikeType]) {
      const bike = availability[bikeType];
      return res.json({
        fulfillmentText: ` ${bikeType} Availability:\n\n` +
                       `• Available: ${bike.available} units\n` +
                       `• Rate: ${bike.rate || 'N/A'}\n` +
                       `• Features: ${bike.features || 'N/A'}\n\n` +
                       `Would you like to book one?`
      });
    } else {
      // Show all bikes if no specific type requested
      let response = `🚲 Current Availability:\n\n`;
      
      for (const [type, details] of Object.entries(availability)) {
        if (typeof details === 'object' && details.available !== undefined) {
          response += `• ${type}: ${details.available} available (${details.rate || 'Rate N/A'})\n`;
        }
      }
      
      response += `\nWhich type would you like?`;
      return res.json({ fulfillmentText: response });
    }

  } catch (error) {
    console.error('Availability error:', error);
    return res.json({
      fulfillmentText: '⚠️ Could not check availability. Please try again later.'
    });
  }
}

// 3. View Feedback Handler
async function handleViewFeedback(req, res, parameters) {
  const bikeType = parameters['bike-type'];
  
  // Add debugging
  console.log('Raw bike-type parameter:', bikeType);
  console.log('All parameters:', parameters);
  
  if (!bikeType) {
    return res.json({
      fulfillmentText: 'ℹ Please specify which bike type you want feedback for (eBike, Gyroscooter, or Segway).'
    });
  }

  try {
    // Normalize the bike type - handle different variations
    const normalizedBikeType = normalizeBikeType(bikeType);
    console.log('Normalized bike type:', normalizedBikeType);
    
    // Try exact match first
    let docRef = db.collection('Feedback').doc(normalizedBikeType);
    let doc = await docRef.get();
    
    if (!doc.exists) {
      // Try alternative names if exact match fails
      const alternatives = getBikeTypeAlternatives(normalizedBikeType);
      console.log('Trying alternatives:', alternatives);
      
      for (const alt of alternatives) {
        docRef = db.collection('Feedback').doc(alt);
        doc = await docRef.get();
        if (doc.exists) {
          console.log('Found match with alternative:', alt);
          break;
        }
      }
    }
    
    if (!doc.exists) {
      // List all available documents for debugging
      const allDocs = await db.collection('Feedback').get();
      const availableDocs = allDocs.docs.map(doc => doc.id);
      console.log('Available feedback documents:', availableDocs);
      
      return res.json({
        fulfillmentText: ` No feedback found for "${bikeType}". Available types: ${availableDocs.join(', ')}`
      });
    }

    const data = doc.data();
    console.log('Feedback data found:', data);
    
    let response = ` ${bikeType} Feedback:\n\n`;
    
    if (data.average_rating !== undefined) {
      response += `• Average Rating: ${data.average_rating}/5\n`;
    }
    
    if (data.total_reviews !== undefined) {
      response += `• Total Reviews: ${data.total_reviews}\n`;
    }
    
    if (data.feature_ratings) {
      response += `• Feature Ratings:\n`;
      Object.entries(data.feature_ratings).forEach(([feature, rating]) => {
        response += `  - ${feature.replace('_', ' ')}: ${rating}\n`;
      });
    }
    
    if (data.recent_feedback && Array.isArray(data.recent_feedback)) {
      response += `• Recent Feedback:\n`;
      data.recent_feedback.forEach((feedback, index) => {
        response += `  - "${feedback}"\n`;
      });
    }
    
    response += `\nWould you like more details?`;
    
    return res.json({
      fulfillmentText: response
    });

  } catch (error) {
    console.error('Feedback error:', error);
    return res.json({
      fulfillmentText: ' Could not retrieve feedback. Please try again later.'
    });
  }
}

// Helper function to normalize bike type names to match Firestore documents
function normalizeBikeType(bikeType) {
  if (!bikeType) return '';
  
  const normalized = bikeType.trim().toLowerCase();
  
  // Map to exact Firestore document names
  const mappings = {
    'ebike': 'eBike',
    'e-bike': 'eBike',
    'e bike': 'eBike',
    'electric bike': 'eBike',
    'electricbike': 'eBike',
    'gyroscooter': 'Gyroscooter',
    'gyro scooter': 'Gyroscooter',
    'gyro-scooter': 'Gyroscooter',
    'segway': 'Segway'
  };
  
  // Return mapped value or original if no mapping found
  return mappings[normalized] || bikeType;
}






const functions = require("@google-cloud/functions-framework");

// Guest responses for common questions
const guestResponses = {
  // Registration and account
  signup: `🛴 **Getting Started with DALScooter**

📝 To sign up:
1. Click "Start Riding Todayor Get Started" on our homepage
2. Enter your email and create a password
3. Enter Ceasar Shift Key and Security Question
3. Verify your email address
4. Complete your profile

✅ **Requirements:**
• Valid email address
• Must be 18+ years old
• Accept terms of service

Need help? Contact support at support@dalscooter.com`,

  login: `🔑 **Login Help**

Having trouble logging in?

**Common solutions:**
• Check your email and password
• Use "Forgot Password" link
• Clear browser cache/cookies
• Try a different browser

**Still having issues?**
• Contact support: support@dalscooter.com
• Check your email for verification links
• Ensure caps lock is off`,

  password: `🔒 **Password Reset**

To reset your password:
1. Go to the login page
2. Click "Forgot Password"
3. Enter your registered email
4. Check your email for reset link
5. Follow the instructions

**Tips:**
• Check spam/junk folder
• Link expires in 24 hours
• Use a strong, unique password

Still need help? Email support@dalscooter.com`,

  // About DALScooter
  about: `🛴 **About DALScooter**

We're Halifax's premier electric scooter sharing service!

**Our Mission:**
Provide convenient, eco-friendly transportation around Dalhousie University and Halifax.

**Key Features:**
• Electric scooters available 24/7
• Easy mobile app booking
• Affordable pricing
• Safe and reliable

🌱 Join us in making Halifax greener, one ride at a time!`,

  how_it_works: `⚡ **How DALScooter Works**

**Simple 4-Step Process:**
1. 📱 **Find** - Locate nearby scooters on our app
2. 🔓 **Unlock** - Scan QR code to unlock
3. 🛴 **Ride** - Enjoy your eco-friendly trip
4. 🅿️ **Park** - End ride at designated areas

**Safety First:**
• Always wear a helmet
• Follow traffic rules
• Park responsibly
• Check scooter before riding`,

  // Pricing and costs
  pricing: `💰 **DALScooter Pricing**

**Pay-Per-Ride:**
• Unlock fee: $1.00
• Per-minute rate: $0.25
• Maximum daily charge: $25.00

**Student Discounts:**
• 20% off with valid student ID
• Special semester packages available

**Payment Methods:**
• Credit/Debit cards
• PayPal
• Student accounts

📧 Questions about billing? Contact billing@dalscooter.com`,

  // Locations and availability
  locations: `📍 **DALScooter Locations**

**Primary Service Areas:**
• Dalhousie University Campus
• Downtown Halifax
• Spring Garden Road
• Waterfront Boardwalk
• Halifax Shopping Centre area

**Operating Hours:**
• 24/7 availability
• Best availability: 6 AM - 10 PM

**Finding Scooters:**
• Use our mobile app
• Look for designated parking zones
• Check campus bulletin boards for updates

🗺️ Download our app for real-time scooter locations!`,

  availability: `⏰ **Scooter Availability**

**Peak Times:**
• Morning: 8 AM - 10 AM (High demand)
• Lunch: 12 PM - 2 PM (Moderate)
• Evening: 5 PM - 7 PM (High demand)

**Best Times to Find Scooters:**
• Early morning (6 AM - 8 AM)
• Mid-afternoon (2 PM - 4 PM)
• Late evening (8 PM - 11 PM)

**Tips:**
• Book in advance when possible
• Check multiple locations
• Consider walking to less busy pickup points`,

  // Safety and rules
  safety: `🛡️ **Safety Guidelines**

**Before You Ride:**
• Check brakes and steering
• Adjust handlebar height
• Wear a helmet (recommended)
• Check battery level

**While Riding:**
• Follow traffic laws
• Use bike lanes when available
• Don't exceed speed limit (25 km/h)
• Don't ride on sidewalks
• No riding under influence

**Parking:**
• Use designated parking areas
• Don't block walkways
• Keep upright and visible
• Lock properly after use

🚨 Emergency? Call 911 first, then contact us.`,

  rules: `📋 **DALScooter Rules**

**DO's:**
✅ Be 18+ years old
✅ Wear a helmet
✅ Follow traffic laws
✅ Park in designated areas
✅ Report damage immediately
✅ End trips properly

**DON'Ts:**
❌ Share your account
❌ Ride with passengers
❌ Use while intoxicated
❌ Modify the scooter
❌ Ride in bad weather
❌ Block pathways when parking

Violations may result in account suspension.`,

  // Support and contact
  support: `🆘 **Need Help?**

**Contact Options:**
📧 Email: support@dalscooter.com
📞 Phone: 1-800-DAL-RIDE
💬 Live Chat: Available in app (for registered users)

**Support Hours:**
• Monday-Friday: 8 AM - 8 PM
• Saturday-Sunday: 10 AM - 6 PM
• Emergency line: 24/7

**Common Issues:**
• Account problems
• Billing questions
• Technical difficulties
• Lost items
• Damage reports

We typically respond within 2 hours!`,

  // Default responses
  greeting: `👋 Welcome to DALScooter!

I'm here to help you get started with our electric scooter service.

**Popular topics:**
🔹 How to sign up
🔹 Pricing information
🔹 Service locations
🔹 Safety guidelines
🔹 How it works

What would you like to know about?`,

  default: `I'm here to help with information about DALScooter! 

**I can help you with:**
• 📝 Account registration
• 💰 Pricing and payments
• 📍 Service locations
• 🛡️ Safety guidelines
• ⚡ How our service works
• 🆘 Getting support

Try asking me about any of these topics, or be more specific about what you need help with!`
};

// Function to process guest messages and return appropriate responses
function processGuestMessage(queryText) {
  const message = queryText.toLowerCase().trim();
  
  // Greeting patterns
  if (message.match(/^(hi|hello|hey|good\s+(morning|afternoon|evening)|greetings)$/)) {
    return guestResponses.greeting;
  }
  
  // Registration/signup related
  if (message.includes('sign up') || message.includes('signup') || message.includes('register') || message.includes('account') || message.includes('join')) {
    return guestResponses.signup;
  }
  
  // Login issues
  if (message.includes('login') || message.includes('log in') || message.includes('sign in') || message.includes('signin')) {
    return guestResponses.login;
  }
  
  // Password issues
  if (message.includes('password') || message.includes('forgot') || message.includes('reset')) {
    return guestResponses.password;
  }
  
  // About DALScooter
  if (message.includes('about') || message.includes('what is') || message.includes('tell me about')) {
    return guestResponses.about;
  }
  
  // How it works
  if (message.includes('how') && (message.includes('work') || message.includes('use') || message.includes('start'))) {
    return guestResponses.how_it_works;
  }
  
  // Pricing
  if (message.includes('price') || message.includes('cost') || message.includes('fee') || message.includes('charge') || message.includes('money') || message.includes('payment')) {
    return guestResponses.pricing;
  }
  
  // Locations
  if (message.includes('location') || message.includes('where') || message.includes('find') || message.includes('area') || message.includes('zone')) {
    return guestResponses.locations;
  }
  
  // Availability
  if (message.includes('available') || message.includes('availability') || message.includes('when') || message.includes('time') || message.includes('hours')) {
    return guestResponses.availability;
  }
  
  // Safety
  if (message.includes('safe') || message.includes('safety') || message.includes('helmet') || message.includes('rule')) {
    return guestResponses.safety;
  }
  
  // Rules and regulations
  if (message.includes('rules') || message.includes('regulation') || message.includes('policy') || message.includes('allowed') || message.includes('not allowed')) {
    return guestResponses.rules;
  }
  
  // Support/help
  if (message.includes('help') || message.includes('support') || message.includes('contact') || message.includes('problem') || message.includes('issue')) {
    return guestResponses.support;
  }
  
  // Default response for unmatched queries
  return guestResponses.default;
}

functions.http("dalscooterGuestWebhook", async (req, res) => {
  console.log("Guest Dialogflow Request:", JSON.stringify(req.body, null, 2));

  // Add CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // Validate request structure
  if (!req.body || !req.body.queryResult) {
    console.error("Invalid request structure:", req.body);
    return res.status(400).json({
      fulfillmentText: "Invalid request format",
    });
  }

  const queryText = req.body.queryResult.queryText;
  const intent = req.body.queryResult.intent?.displayName;
  const parameters = req.body.queryResult.parameters || {};

  console.log("Guest Query Text:", queryText);
  console.log("Guest Intent detected:", intent);
  console.log("Guest Parameters:", parameters);

  try {
    // For guest users, we'll primarily rely on the query text processing
    // But you can also set up specific intents in your Dialogflow agent
    let response;

    // Check if there's a specific intent matched by Dialogflow
    switch (intent) {
      case "signup.help":
        response = guestResponses.signup;
        break;
      case "login.help":
        response = guestResponses.login;
        break;
      case "password.reset":
        response = guestResponses.password;
        break;
      case "about.company":
        response = guestResponses.about;
        break;
      case "how.it.works":
        response = guestResponses.how_it_works;
        break;
      case "pricing.info":
        response = guestResponses.pricing;
        break;
      case "locations.info":
        response = guestResponses.locations;
        break;
      case "availability.info":
        response = guestResponses.availability;
        break;
      case "safety.guidelines":
        response = guestResponses.safety;
        break;
      case "rules.regulations":
        response = guestResponses.rules;
        break;
      case "support.contact":
        response = guestResponses.support;
        break;
      case "Default Welcome Intent":
        response = guestResponses.greeting;
        break;
      default:
        // If no specific intent is matched, use text processing
        response = processGuestMessage(queryText);
        break;
    }

    console.log("Guest Response:", response);

    return res.json({
      fulfillmentText: response,
    });

  } catch (error) {
    console.error("Guest Webhook Error:", error);
    return res.status(500).json({
      fulfillmentText:
        "Sorry, I encountered an unexpected error. Please try again later or contact support at support@dalscooter.com.",
    });
  }
});
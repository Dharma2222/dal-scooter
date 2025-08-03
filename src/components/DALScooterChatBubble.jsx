import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext"; // Adjust path to your AuthContext
import { useLocation } from "react-router-dom";

const DALScooterChatBubble = () => {
  const { authUser, isAuthenticated } = useAuth();
  const location = useLocation();
  const [showChat, setShowChat] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Your webhook URL - update this with your actual Cloud Function URL
  const WEBHOOK_URL =
    "https://us-central1-dalscooterproject-464815.cloudfunctions.net/dalscooterWebhook";

  // Simplified logic to determine when to show chat bubble
  useEffect(() => {
    const shouldShowChat = () => {
      const currentPath = location.pathname;

      // Always hide on franchise signup pages (both route names)
      const franchisePages = [
        "/auth/FranchiseSignUpPage",
        "/auth/franchise-signup",
      ];
      if (franchisePages.includes(currentPath)) {
        return false;
      }

      // Show for unauthenticated users (guests) on public pages
      if (!isAuthenticated) {
        const publicPages = [
          "/auth/LoginPage",
          "/auth/login",
          "/auth/RegistrationPage",
          "/auth/register",
          "/auth/confirm",
        ];
        return publicPages.some(
          (page) => currentPath === page || currentPath.startsWith(page)
        );
      }

      // Show for authenticated users (removed role check)
      if (isAuthenticated) {
        return true;
      }

      return false;
    };

    setShowChat(shouldShowChat());

    // Close chat if it should not be shown
    if (!shouldShowChat()) {
      setOpen(false);
    }
  }, [isAuthenticated, location.pathname]);

  // Initial welcome message - different for guests vs authenticated users
  useEffect(() => {
    if (showChat) {
      let welcomeMessage;

      if (!isAuthenticated) {
        // Message for guests
        welcomeMessage = `🛴 Welcome to DALScooter! I'm here to help you get started.\n\n🔍 Learn about our scooters\n📍 Find locations\n❓ Get help with registration\n💡 Booking assistance\n\nWhat would you like to know?`;
      } else {
        // Message for authenticated users with flexible name display
        const userDisplayName = authUser?.name || authUser?.email || "User";
        welcomeMessage = `🛴 Hi, ${userDisplayName}! I'm your DALScooter Assistant. I can help you with:\n\n🔍 Find scooter information\n📋 Check booking details\n❓ General navigation help\n\nWhat would you like to know?`;
      }

      setMessages([
        {
          id: 1,
          text: welcomeMessage,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  }, [showChat, authUser?.name, authUser?.email, isAuthenticated]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Process message through webhook
  const processMessage = async (userMessage) => {
    // Simple intent detection and parameter extraction
    let intent = "";
    let parameters = {};

    const message = userMessage.toLowerCase();

    if (message.includes("find scooter") || message.includes("scooter")) {
      intent = "find_scooter";
      // Updated regex to capture scooter IDs - more flexible pattern
      const scooterMatch =
        userMessage.match(
          /(?:scooter\s+|find\s+scooter\s+)([a-zA-Z0-9\-_]{3,})/i
        ) ||
        userMessage.match(
          /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i
        );
      if (scooterMatch) {
        parameters.scooter_id = scooterMatch[1];
      }
    } else if (
      message.includes("booking") ||
      message.includes("show booking") ||
      message.includes("get booking")
    ) {
      intent = "get_booking";
      // Extract UUID booking reference
      const uuidMatch = userMessage.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
      );
      if (uuidMatch) {
        parameters.booking_ref = uuidMatch[0];
      }
    }

    // Create request body similar to what Dialogflow would send
    const requestBody = {
      queryResult: {
        intent: {
          displayName: intent,
        },
        parameters: {
          ...parameters,
          userId: authUser?.sub || authUser?.email, // Include user ID if available
          isGuest: !isAuthenticated, // Flag to indicate guest user
        },
        queryText: userMessage,
      },
    };

    console.log("Sending request to webhook:", requestBody);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Webhook response:", data);
      return (
        data.fulfillmentText ||
        "Sorry, I didn't get a response from the server."
      );
    } catch (error) {
      console.error("Error calling webhook:", error);
      return `❌ Connection error: ${error.message}. Please try again later.`;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // Process the message through webhook
      const response = await processMessage(currentInput);

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "❌ Sorry, I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const sendQuickMessage = (message) => {
    setInput(message);
    setTimeout(() => handleSendMessage(), 100);
  };

  const clearMessages = () => {
    let welcomeMessage;

    if (!isAuthenticated) {
      welcomeMessage = "🛴 Welcome to DALScooter! How can I help you today?";
    } else {
      const userDisplayName = authUser?.name || authUser?.email || "User";
      welcomeMessage = `🛴 Hi, ${userDisplayName}! I'm your DALScooter Assistant. How can I help you today?`;
    }

    setMessages([
      {
        id: 1,
        text: welcomeMessage,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  };

  // Function to parse URLs and render them as clickable links
  const renderMessageText = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Don't render anything if chat should not be shown
  if (!showChat) return null;

  // Quick actions based on user authentication status
  const getQuickActions = () => {
    if (!isAuthenticated) {
      return (
        <>
          <button
            onClick={() => sendQuickMessage("How do I sign up for DALScooter?")}
            className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition"
          >
            📝 Sign Up Help
          </button>
          <button
            onClick={() => sendQuickMessage("I forgot my password")}
            className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition"
          >
            🔑 Login Help
          </button>
          <button
            onClick={() => sendQuickMessage("Where can I find scooters?")}
            className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition"
          >
            📍 Locations
          </button>
        </>
      );
    } else {
      return (
        <>
          <button
            onClick={() =>
              sendQuickMessage(
                "Find scooter 1aa8bb37-6674-4e2c-994b-9ad65df134e8"
              )
            }
            className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition"
          >
            🔍 Find Scooter
          </button>
          <button
            onClick={() =>
              sendQuickMessage(
                "Show booking e00937f2-be20-4d35-a397-dcb6bbab1b15"
              )
            }
            className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition"
          >
            📋 Check Booking
          </button>
          <button
            onClick={() => sendQuickMessage("Help")}
            className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition"
          >
            ❓ Help
          </button>
        </>
      );
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chat Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 animate-pulse"
          aria-label="Open DALScooter Assistant"
        >
          <svg
            className="w-8 h-8 block mx-auto my-auto"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2m4.243 1.757l1.414-1.414M21 12h-2M17.243 17.243l1.414 1.414M12 21v-2M6.757 17.243l-1.414 1.414M3 12h2M6.757 6.757l-1.414-1.414M12 7a5 5 0 100 10 5 5 0 000-10z"
            />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="w-96 max-w-[90vw] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-lg">🛴</span>
              </div>
              <div>
                <span className="font-bold text-lg">DALScooter</span>
                <p className="text-xs opacity-90">
                  {isAuthenticated ? "Virtual Assistant" : "Welcome Assistant"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearMessages}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition"
                title="Clear conversation"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition"
                aria-label="Close chat"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white px-4 py-3">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-end space-x-2 max-w-[85%] ${
                      message.sender === "user"
                        ? "flex-row-reverse space-x-reverse"
                        : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600"
                          : "bg-gradient-to-r from-purple-500 to-purple-600"
                      }`}
                    >
                      {message.sender === "user" ? "👤" : "🛴"}
                    </div>
                    {/* Message bubble */}
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm break-words shadow-sm ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                          : "bg-white text-gray-800 border border-gray-200"
                      }`}
                    >
                      <div className="whitespace-pre-line">
                        {renderMessageText(message.text)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-end space-x-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold">
                      🛴
                    </div>
                    <div className="flex space-x-1 bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-200">
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">{getQuickActions()}</div>
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white flex items-center space-x-3">
            <textarea
              className="flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
              rows={1}
              placeholder={
                isAuthenticated
                  ? "Ask about scooters or bookings..."
                  : "Ask about DALScooter services..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              maxLength={500}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              className={`p-3 rounded-full transition-all duration-200 ${
                input.trim() && !isLoading
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:scale-105 shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DALScooterChatBubble;

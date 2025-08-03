import { useState, useEffect, useRef } from "react";

const DALScooterGuestChatBot = ({ webhookUrl }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Your guest webhook URL - should point to your new Dialogflow agent
  const GUEST_WEBHOOK_URL = webhookUrl || 
    "https://us-central1-caramel-goal-467621-p7.cloudfunctions.net/dalscooterGuestWebhook";

  // Initial welcome message for guests
  useEffect(() => {
    const welcomeMessage = `🛴 Welcome to DALScooter! I'm here to help you get started.

🔍 Learn about our scooters
📍 Find locations  
❓ Get help with registration
💡 Pricing information
🛡️ Safety guidelines

What would you like to know?`;

    setMessages([
      {
        id: 1,
        text: welcomeMessage,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Process message through guest Dialogflow webhook
  const processGuestMessage = async (userMessage) => {
    const requestBody = {
      queryResult: {
        queryText: userMessage,
        parameters: {
          isGuest: true,
        },
      },
    };

    console.log("Sending guest request to webhook:", requestBody);

    try {
      const response = await fetch(GUEST_WEBHOOK_URL, {
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
      console.log("Guest webhook response:", data);
      return (
        data.fulfillmentText ||
        "Sorry, I didn't get a response from the server."
      );
    } catch (error) {
      console.error("Error calling guest webhook:", error);
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
      // Process the message through guest webhook
      const response = await processGuestMessage(currentInput);

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
    const welcomeMessage = "🛴 Welcome to DALScooter! How can I help you today?";

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

  // Guest-specific quick actions
  const guestQuickActions = (
    <>
      <button
        onClick={() => sendQuickMessage("How do I sign up?")}
        className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition"
      >
        📝 Sign Up
      </button>
      <button
        onClick={() => sendQuickMessage("What are your prices?")}
        className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition"
      >
        💰 Pricing
      </button>
      <button
        onClick={() => sendQuickMessage("Where are scooters located?")}
        className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition"
      >
        📍 Locations
      </button>
      <button
        onClick={() => sendQuickMessage("How does it work?")}
        className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition"
      >
        ⚡ How It Works
      </button>
      <button
        onClick={() => sendQuickMessage("Safety information")}
        className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition"
      >
        🛡️ Safety
      </button>
      <button
        onClick={() => sendQuickMessage("Contact support")}
        className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition"
      >
        🆘 Support
      </button>
    </>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chat Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-gradient-to-r from-green-600 to-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-110 animate-pulse"
          aria-label="Open DALScooter Help"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="w-96 max-w-[90vw] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-lg">🛴</span>
              </div>
              <div>
                <span className="font-bold text-lg">DALScooter Help</span>
                <p className="text-xs opacity-90">Guest Assistant</p>
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
                          : "bg-gradient-to-r from-green-500 to-green-600"
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
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold">
                      🛴
                    </div>
                    <div className="flex space-x-1 bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-200">
                      <div
                        className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
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
            <div className="flex flex-wrap gap-2">{guestQuickActions}</div>
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white flex items-center space-x-3">
            <textarea
              className="flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
              rows={1}
              placeholder="Ask about DALScooter services..."
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
                  ? "bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 hover:scale-105 shadow-lg"
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

export default DALScooterGuestChatBot;
import { useState, useEffect, useRef } from 'react';

const ChatBubble = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Sample initial messages
  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm DALScooter Assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addDebugMessage = (message) => {
    if (debugMode) {
      const debugMessage = {
        id: Date.now() + Math.random(),
        text: `[DEBUG] ${message}`,
        sender: 'debug',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, debugMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    addDebugMessage(`Sending message: "${currentInput}"`);

    try {
      const requestBody = { message: currentInput };
      addDebugMessage(`Request body: ${JSON.stringify(requestBody)}`);

      // Direct call to Cloud Function
      const response = await fetch('https://us-central1-dalscooterproject-464815.cloudfunctions.net/dalscooterWebhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      addDebugMessage(`Response status: ${response.status}`);
      addDebugMessage(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        addDebugMessage(`Error response text: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      addDebugMessage(`Content-Type: ${contentType}`);
      
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        addDebugMessage(`Non-JSON response: ${text.substring(0, 200)}`);
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      addDebugMessage(`Response data: ${JSON.stringify(data)}`);
      
      // Try multiple possible response formats
      let botResponseText = '';
      if (data.fulfillmentText) {
        botResponseText = data.fulfillmentText;
      } else if (data.response) {
        botResponseText = data.response;
      } else if (data.message) {
        botResponseText = data.message;
      } else if (data.text) {
        botResponseText = data.text;
      } else if (typeof data === 'string') {
        botResponseText = data;
      } else {
        addDebugMessage(`Unexpected response format: ${JSON.stringify(data)}`);
        botResponseText = 'Sorry, I received an unexpected response format.';
      }
      
      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error calling Cloud Function:', error);
      addDebugMessage(`Error: ${error.message}`);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearMessages = () => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm DALScooter Assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chat Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition relative animate-pulse"
          aria-label="Open chat"
        >
          {/* Chat Icon (SVG) */}
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 3.866-3.582 7-8 7a8.96 8.96 0 01-4-.93L3 21l1.07-3.21A7.963 7.963 0 013 12c0-3.866 3.582-7 8-7s8 3.134 8 7z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="w-80 max-w-[90vw] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="font-semibold text-lg">DALScooter Assistant</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDebugMode(!debugMode)}
                className={`p-1 rounded-full transition text-xs ${debugMode ? 'bg-yellow-500 text-black' : 'hover:bg-white hover:bg-opacity-20'}`}
                title="Toggle debug mode"
              >
                🐛
              </button>
              <button
                onClick={clearMessages}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition"
                title="Clear messages"
              >
                🗑️
              </button>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition" aria-label="Close chat">
                {/* Close Icon (SVG) */}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-2">
            <ul className="space-y-3">
              {messages.map((message) => (
                <li key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end space-x-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                      message.sender === 'user' 
                        ? 'bg-blue-500' 
                        : message.sender === 'debug' 
                          ? 'bg-yellow-500' 
                          : 'bg-green-600'
                    }`}>
                      {message.sender === 'user' ? 'U' : message.sender === 'debug' ? 'D' : 'B'}
                    </div>
                    {/* Message bubble */}
                    <div className={`px-4 py-2 rounded-2xl text-sm break-words ${
                      message.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : message.sender === 'debug'
                          ? 'bg-yellow-100 text-black border border-yellow-300'
                          : 'bg-white text-gray-800 shadow-sm border'
                    }`}>
                      {message.text}
                    </div>
                  </div>
                </li>
              ))}
              {isLoading && (
                <li className="flex justify-start">
                  <div className="flex items-end space-x-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-600 text-white text-sm font-bold">B</div>
                    <div className="flex space-x-1 bg-white px-4 py-2 rounded-2xl shadow-sm">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                </li>
              )}
              <div ref={messagesEndRef} />
            </ul>
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white flex items-center space-x-2">
            <textarea
              className="flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
              rows={1}
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              maxLength={500}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              className={`p-2 rounded-full transition-all duration-200 ${input.trim() && !isLoading ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-105' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              disabled={!input.trim() || isLoading}
              aria-label="Send"
              type="button"
            >
              {/* Send Icon (SVG) */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Waves } from 'lucide-react';
import ChatBox from './components/ChatBox';
import InputBox from './components/InputBox';
import axios from 'axios';

// Use environment variable for API base URL, fallback to relative paths for development
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [apiStatus, setApiStatus] = useState('unknown');

  // Check API health on startup
  useEffect(() => {
    checkApiHealth();
    
    // Add welcome message
    setMessages([{
      id: 'welcome',
      type: 'assistant',
      content: `Welcome to FloatChat! 🌊

I'm your AI assistant for exploring Argo oceanographic data. I can help you:

• **Analyze ocean temperature and salinity patterns**
• **Create interactive visualizations**
• **Answer questions about oceanography**
• **Explore data from different regions and depths**

Try asking something like:
- "Show me temperature profiles from the Atlantic Ocean"
- "What's the relationship between temperature and salinity?"
- "Create a map of ocean measurements"
- "Explain what Argo floats are"

What would you like to explore?`,
      timestamp: new Date().toISOString(),
      plotUrl: null
    }]);
  }, []);

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const checkApiHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      setApiStatus(response.data.status);
    } catch (error) {
      console.error('API health check failed:', error);
      setApiStatus('unavailable');
    }
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now() + Math.random(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send to backend
      const response = await axios.post(`${API_BASE_URL}/query`, {
        message: message,
        language: 'en',
        include_visualization: true
      });

      // Add assistant response
      const assistantMessage = {
        id: Date.now() + Math.random() + 1,
        type: 'assistant',
        content: response.data.text_response,
        timestamp: response.data.timestamp,
        plotUrl: response.data.plot_url,
        dataSummary: response.data.data_summary,
        queryType: response.data.query_type
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + Math.random() + 2,
        type: 'assistant',
        content: `I apologize, but I encountered an error processing your request. ${
          error.response?.data?.detail || 'Please check your connection and try again.'
        }`,
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    // Re-add welcome message
    setTimeout(() => {
      setMessages([{
        id: 'welcome',
        type: 'assistant',
        content: `Chat cleared! 🌊 

What would you like to explore about ocean data?`,
        timestamp: new Date().toISOString(),
        plotUrl: null
      }]);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-ocean-500 p-2 rounded-xl">
              <Waves className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                FloatChat
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Ocean Data AI Assistant
              </p>
            </div>
          </motion.div>

          <div className="flex items-center space-x-4">
            {/* API Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                apiStatus === 'healthy' ? 'bg-green-400' : 
                apiStatus === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
              }`} />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {apiStatus === 'healthy' ? 'Online' : 
                 apiStatus === 'degraded' ? 'Limited' : 'Offline'}
              </span>
            </div>

            {/* Clear Chat Button */}
            <button
              onClick={clearChat}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
            >
              Clear Chat
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 h-[calc(100vh-80px)] flex flex-col">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          <ChatBox 
            messages={messages} 
            isLoading={isLoading}
          />
          
          <InputBox 
            onSendMessage={sendMessage}
            disabled={isLoading || apiStatus === 'unavailable'}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
        <p>
          Powered by Argo oceanographic data • Built with React & FastAPI
        </p>
      </footer>
    </div>
  );
};

export default App;
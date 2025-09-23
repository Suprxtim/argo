import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Waves } from 'lucide-react';
import ChatBox from './components/ChatBox';
import InputBox from './components/InputBox';
import AnimatedBackground from './components/AnimatedBackground';
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Content Container */}
      <div className="relative z-10 min-h-screen bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
        {/* Decorative elements */}
        <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-cyan-400/40 animate-ping"></div>
        <div className="absolute top-8 right-8 w-2 h-2 rounded-full bg-blue-400/40 animate-ping delay-1000"></div>
        <div className="absolute bottom-8 left-8 w-2 h-2 rounded-full bg-teal-400/40 animate-ping delay-2000"></div>
        
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl shadow-lg">
                <Waves className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white text-over-background">
                  FloatChat
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 text-over-background">
                  Ocean Data AI Assistant
                </p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              {/* API Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  apiStatus === 'healthy' ? 'bg-green-400 animate-pulse' : 
                  apiStatus === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
                <span className="text-sm text-gray-600 dark:text-gray-300 text-over-background">
                  {apiStatus === 'healthy' ? 'Online' : 
                   apiStatus === 'degraded' ? 'Limited' : 'Offline'}
                </span>
              </div>

              {/* Clear Chat Button */}
              <button
                onClick={clearChat}
                className="px-3 py-1 text-sm bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Clear Chat
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors duration-200 shadow-md"
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
        <footer className="text-center py-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200/30 dark:border-gray-700/30">
          <p className="text-over-background">
            Powered by Argo oceanographic data • Built with React & FastAPI
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
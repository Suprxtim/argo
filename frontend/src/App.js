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
      <div className="relative z-10 min-h-screen bg-gradient-to-b from-black/10 to-white/20 dark:from-black/20 dark:to-black/10 backdrop-blur-xl">
        {/* Decorative elements */}
        <div className="absolute top-6 left-6 w-4 h-4 rounded-full bg-cyan-400/60 animate-ping"></div>
        <div className="absolute top-12 right-12 w-3 h-3 rounded-full bg-blue-400/60 animate-ping delay-1000"></div>
        <div className="absolute bottom-12 left-12 w-3 h-3 rounded-full bg-teal-400/60 animate-ping delay-2000"></div>
        
        {/* Header */}
        <header className="bg-gradient-to-r from-white/80 to-cyan-50/80 dark:from-gray-900/80 dark:to-slate-900/80 backdrop-blur-2xl border-b border-cyan-200/30 dark:border-cyan-800/30 sticky top-0 z-50 shadow-2xl shadow-cyan-500/10 dark:shadow-cyan-900/20">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-2xl shadow-2xl shadow-cyan-500/30">
                <Waves className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent text-over-background">
                  FloatChat
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 text-over-background">
                  Ocean Data AI Assistant
                </p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-5">
              {/* API Status */}
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-white/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-lg border border-cyan-200/30 dark:border-cyan-800/30">
                <div className={`w-3 h-3 rounded-full ${
                  apiStatus === 'healthy' ? 'bg-green-400 animate-pulse' : 
                  apiStatus === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-over-background">
                  {apiStatus === 'healthy' ? 'Online' : 
                   apiStatus === 'degraded' ? 'Limited' : 'Offline'}
                </span>
              </div>

              {/* Clear Chat Button */}
              <button
                onClick={clearChat}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Clear Chat
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2.5 rounded-xl bg-gradient-to-r from-gray-200/80 to-gray-300/80 hover:from-gray-300/80 hover:to-gray-400/80 dark:from-gray-700/80 dark:to-gray-800/80 dark:hover:from-gray-600/80 dark:hover:to-gray-700/80 text-gray-700 dark:text-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8 h-[calc(100vh-90px)] flex flex-col">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
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
        <footer className="text-center py-5 text-sm text-gray-600 dark:text-gray-400 border-t border-cyan-200/20 dark:border-cyan-800/20 backdrop-blur-lg bg-white/30 dark:bg-gray-900/30">
          <p className="text-over-background">
            Powered by Argo oceanographic data • Built with React & FastAPI
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
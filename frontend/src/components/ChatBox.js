import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Message from './Message';

const ChatBox = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-hidden bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-ocean-500/10 dark:shadow-ocean-900/20">
      <div className="h-full overflow-y-auto scrollbar-thin p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              className="relative"
            >
              <Message message={message} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-xs lg:max-w-md">
              <div className="bg-gradient-to-r from-gray-100/80 to-gray-200/80 dark:from-gray-700/80 dark:to-gray-800/80 backdrop-blur-sm rounded-2xl rounded-bl-sm px-4 py-3 border border-gray-200/30 dark:border-gray-600/30 shadow-md">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="typing-indicator bg-cyan-500"></div>
                    <div className="typing-indicator bg-cyan-500"></div>
                    <div className="typing-indicator bg-cyan-500"></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 text-over-background">
                    FloatChat is thinking...
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {messages.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center space-y-4"
          >
            <div className="bg-gradient-to-br from-ocean-100/80 to-cyan-100/80 dark:from-ocean-900/50 dark:to-cyan-900/50 backdrop-blur-sm p-6 rounded-full border border-ocean-200/50 dark:border-ocean-700/50 shadow-lg">
              <svg 
                className="w-12 h-12 text-ocean-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-over-background">
                Welcome to FloatChat!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md text-over-background">
                Start a conversation about oceanographic data. Ask me about temperature patterns, 
                salinity measurements, or request visualizations of ocean data.
              </p>
            </div>
          </motion.div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatBox;
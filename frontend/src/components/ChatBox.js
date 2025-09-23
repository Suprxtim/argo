import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves } from 'lucide-react';
import Message from './Message';

const ChatBox = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-hidden bg-gradient-to-b from-white/70 to-cyan-50/70 dark:from-gray-800/70 dark:to-slate-800/70 backdrop-blur-2xl rounded-3xl border border-cyan-200/40 dark:border-cyan-800/40 shadow-2xl shadow-cyan-500/20 dark:shadow-cyan-900/30">
      <div className="h-full overflow-y-auto scrollbar-thin p-6 space-y-5">
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
              <div className="bg-gradient-to-r from-gray-100/90 to-cyan-100/90 dark:from-gray-700/90 dark:to-slate-700/90 backdrop-blur-lg rounded-2xl rounded-bl-sm px-5 py-4 border border-cyan-200/40 dark:border-cyan-800/40 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1.5">
                    <div className="typing-indicator bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                    <div className="typing-indicator bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                    <div className="typing-indicator bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-over-background">
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
            className="flex flex-col items-center justify-center h-full text-center space-y-6"
          >
            <div className="bg-gradient-to-br from-cyan-100/80 to-blue-100/80 dark:from-cyan-900/50 dark:to-blue-900/50 backdrop-blur-lg p-8 rounded-3xl border border-cyan-200/50 dark:border-cyan-800/50 shadow-2xl">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Waves className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent mb-3">
                Welcome to FloatChat!
              </h3>
              <p className="text-gray-700 dark:text-gray-300 max-w-md text-over-background">
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
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, MicOff, Sparkles } from 'lucide-react';

const InputBox = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef(null);

  // Sample suggestions for user queries
  const suggestions = [
    "Show me temperature profiles from the Atlantic Ocean",
    "What's the relationship between temperature and salinity?",
    "Create a map of recent ocean measurements",
    "Explain how Argo floats work",
    "Show temperature trends over time",
    "Compare salinity between different regions",
    "What are the temperature ranges at different depths?",
    "Visualize 3D ocean data patterns"
  ];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const toggleRecording = () => {
    // Voice recording functionality would be implemented here
    // For now, it's a placeholder
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Start recording
      console.log('Starting voice recording...');
      // In a real implementation, you would:
      // 1. Request microphone permission
      // 2. Start recording audio
      // 3. Convert speech to text
      // 4. Set the transcribed text to the message state
    } else {
      // Stop recording
      console.log('Stopping voice recording...');
    }
  };

  const clearMessage = () => {
    setMessage('');
    textareaRef.current?.focus();
  };

  return (
    <div className="relative">
      {/* Suggestions popup */}
      {showSuggestions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg max-h-64 overflow-y-auto scrollbar-thin"
        >
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-ocean-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Suggested Questions
              </span>
            </div>
          </div>
          <div className="p-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-150"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main input container */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2 p-4">
          {/* Suggestion button */}
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className={`flex-shrink-0 p-2 rounded-lg transition-colors duration-200 ${
              showSuggestions
                ? 'bg-ocean-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
            }`}
            title="Show suggestions"
          >
            <Sparkles className="h-5 w-5" />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={disabled ? "System unavailable..." : "Ask about ocean data, request visualizations, or explore oceanography..."}
              disabled={disabled}
              rows={1}
              className={`
                w-full resize-none border-0 bg-transparent text-gray-900 dark:text-gray-100 
                placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0
                max-h-32 scrollbar-thin
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              style={{ minHeight: '24px', maxHeight: '128px' }}
            />
            
            {/* Clear button */}
            {message && (
              <button
                type="button"
                onClick={clearMessage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Clear message"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Voice recording button */}
          <button
            type="button"
            onClick={toggleRecording}
            disabled={disabled}
            className={`
              flex-shrink-0 p-2 rounded-lg transition-all duration-200
              ${isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={isRecording ? "Stop recording" : "Start voice recording"}
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {/* Send button */}
          <motion.button
            type="submit"
            disabled={!message.trim() || disabled}
            whileHover={!disabled && message.trim() ? { scale: 1.05 } : {}}
            whileTap={!disabled && message.trim() ? { scale: 0.95 } : {}}
            className={`
              flex-shrink-0 p-2 rounded-lg transition-all duration-200
              ${!disabled && message.trim()
                ? 'bg-ocean-500 hover:bg-ocean-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
            title="Send message"
          >
            <Send className="h-5 w-5" />
          </motion.button>
        </form>

        {/* Input hints */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              Press Enter to send, Shift+Enter for new line
            </span>
            <span className={`transition-colors ${
              disabled ? 'text-red-500' : 'text-green-500'
            }`}>
              {disabled ? '● Offline' : '● Online'}
            </span>
          </div>
        </div>
      </div>

      {/* Character count */}
      {message.length > 500 && (
        <div className="mt-1 text-right">
          <span className={`text-xs ${
            message.length > 1000 ? 'text-red-500' : 'text-yellow-500'
          }`}>
            {message.length}/1000 characters
          </span>
        </div>
      )}
    </div>
  );
};

export default InputBox;
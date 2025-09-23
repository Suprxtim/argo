import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, MicOff, Sparkles, Wifi, WifiOff, RefreshCw } from 'lucide-react';

const InputBox = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [recordingError, setRecordingError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

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

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setRecordingError(null);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setRecordingError('Network error: Please check your internet connection and try again.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize speech recognition with better error handling
  useEffect(() => {
    let recognitionInstance = null;
    
    const initSpeechRecognition = () => {
      // Check if browser supports speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setRecordingError('Speech recognition not supported in this browser. Please try Chrome, Edge, or Safari.');
        return null;
      }

      try {
        recognitionInstance = new SpeechRecognition();
        
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';
        recognitionInstance.maxAlternatives = 1;
        
        recognitionInstance.onstart = () => {
          setIsRecording(true);
          setRecordingError(null);
        };
        
        recognitionInstance.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setMessage(prev => prev + finalTranscript);
          }
        };
        
        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event);
          setIsRecording(false);
          
          // Handle specific error types
          switch (event.error) {
            case 'network':
              setRecordingError('Network error: Please check your internet connection and try again.');
              break;
            case 'not-allowed':
            case 'permission-denied':
              setRecordingError('Microphone access denied: Please allow microphone access in your browser settings.');
              break;
            case 'no-speech':
              setRecordingError('No speech detected. Please try again and speak clearly.');
              break;
            case 'audio-capture':
              setRecordingError('Audio capture error: Please check your microphone and try again.');
              break;
            case 'not-supported':
              setRecordingError('Speech recognition not supported on this device.');
              break;
            case 'service-not-allowed':
              setRecordingError('Speech service not allowed. Please check your browser settings.');
              break;
            case 'bad-grammar':
              setRecordingError('Speech recognition grammar error. Please try again.');
              break;
            case 'language-not-supported':
              setRecordingError('Selected language not supported. Please try English (US).');
              break;
            default:
              setRecordingError(`Speech recognition error: ${event.error}. Please try again.`);
          }
        };
        
        recognitionInstance.onend = () => {
          setIsRecording(false);
        };
        
        return recognitionInstance;
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
        setRecordingError('Failed to initialize speech recognition. Please check your browser settings.');
        return null;
      }
    };
    
    recognitionInstance = initSpeechRecognition();
    setRecognition(recognitionInstance);
    recognitionRef.current = recognitionInstance;
    
    // Cleanup function
    return () => {
      if (recognitionInstance) {
        try {
          recognitionInstance.stop();
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
      }
    };
  }, []);

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
    // Check if online first
    if (!isOnline) {
      setRecordingError('Network error: Please check your internet connection and try again.');
      return;
    }
    
    const currentRecognition = recognitionRef.current || recognition;
    
    if (!currentRecognition) {
      setRecordingError('Speech recognition not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }
    
    if (isRecording) {
      // Stop recording
      try {
        currentRecognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        setRecordingError('Failed to stop recording. Please try again.');
      }
    } else {
      // Start recording
      try {
        // Reset any previous errors
        setRecordingError(null);
        currentRecognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setRecordingError('Failed to start recording. Please check microphone permissions and try again.');
      }
    }
  };

  const clearMessage = () => {
    setMessage('');
    textareaRef.current?.focus();
  };

  // Function to request microphone permissions
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setRecordingError(null);
      // Re-initialize speech recognition after permission is granted
      window.location.reload();
    } catch (error) {
      setRecordingError('Microphone access denied: Please allow microphone access in your browser settings.');
    }
  };

  // Function to retry speech recognition
  const retrySpeechRecognition = () => {
    setRecordingError(null);
    setRetryCount(prev => prev + 1);
    
    // Re-initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const newRecognition = new SpeechRecognition();
        newRecognition.continuous = false;
        newRecognition.interimResults = true;
        newRecognition.lang = 'en-US';
        newRecognition.maxAlternatives = 1;
        
        newRecognition.onstart = () => {
          setIsRecording(true);
          setRecordingError(null);
        };
        
        newRecognition.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setMessage(prev => prev + finalTranscript);
          }
        };
        
        newRecognition.onerror = (event) => {
          console.error('Speech recognition error:', event);
          setIsRecording(false);
          
          switch (event.error) {
            case 'network':
              setRecordingError('Network error: Please check your internet connection and try again.');
              break;
            case 'not-allowed':
            case 'permission-denied':
              setRecordingError('Microphone access denied: Please allow microphone access in your browser settings.');
              break;
            default:
              setRecordingError(`Speech recognition error: ${event.error}. Please try again.`);
          }
        };
        
        newRecognition.onend = () => {
          setIsRecording(false);
        };
        
        setRecognition(newRecognition);
        recognitionRef.current = newRecognition;
        
        // Try to start recognition
        setTimeout(() => {
          try {
            newRecognition.start();
          } catch (error) {
            console.error('Error starting speech recognition after retry:', error);
            setRecordingError('Failed to start recording after retry. Please check your connection and try again.');
          }
        }, 100);
      } catch (error) {
        console.error('Error re-initializing speech recognition:', error);
        setRecordingError('Failed to re-initialize speech recognition. Please refresh the page and try again.');
      }
    }
  };

  return (
    <div className="relative">
      {/* Suggestions popup */}
      {showSuggestions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-full left-0 right-0 mb-2 bg-gradient-to-br from-white/90 to-gray-100/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl max-h-64 overflow-y-auto scrollbar-thin"
        >
          <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50">
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
                className="w-full text-left p-2 rounded-lg hover:bg-gradient-to-r from-cyan-50/50 to-blue-50/50 dark:hover:from-gray-700/50 dark:hover:to-gray-800/50 text-sm text-gray-700 dark:text-gray-300 transition-all duration-150 text-over-background"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recording error message */}
      {recordingError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 p-3 bg-gradient-to-r from-red-100/90 to-red-200/90 dark:from-red-900/90 dark:to-red-800/90 backdrop-blur-sm text-red-700 dark:text-red-200 rounded-lg text-sm flex items-start space-x-2 border border-red-200/50 dark:border-red-800/50 shadow-md"
        >
          <div className="flex-shrink-0 mt-0.5">
            {recordingError.includes('network') || recordingError.includes('Network') ? 
              <WifiOff className="h-4 w-4" /> : 
              <MicOff className="h-4 w-4" />
            }
          </div>
          <div className="flex-1">
            <span className="font-medium">Voice recording error:</span> {recordingError}
            <div className="flex items-center space-x-2 mt-2">
              {(recordingError.includes('permission') || recordingError.includes('Permission')) && (
                <button 
                  onClick={requestMicrophonePermission}
                  className="text-xs underline text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
                >
                  Request permission
                </button>
              )}
              {(recordingError.includes('network') || recordingError.includes('Network')) && (
                <button 
                  onClick={retrySpeechRecognition}
                  className="flex items-center text-xs underline text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Network status indicator */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 p-2 bg-gradient-to-r from-yellow-100/90 to-yellow-200/90 dark:from-yellow-900/90 dark:to-yellow-800/90 backdrop-blur-sm text-yellow-700 dark:text-yellow-200 rounded-lg text-sm flex items-center space-x-2 border border-yellow-200/50 dark:border-yellow-800/50 shadow-md"
        >
          <WifiOff className="h-4 w-4" />
          <span>Network offline. Voice recording requires an internet connection.</span>
        </motion.div>
      )}

      {/* Main input container */}
      <div className="bg-gradient-to-br from-white/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-ocean-500/10 dark:shadow-ocean-900/20 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2 p-4">
          {/* Suggestion button */}
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 shadow-md ${
              showSuggestions
                ? 'bg-gradient-to-br from-ocean-500 to-blue-600 text-white'
                : 'bg-gradient-to-br from-gray-100/80 to-gray-200/80 hover:from-gray-200/80 hover:to-gray-300/80 dark:from-gray-700/80 dark:to-gray-800/80 dark:hover:from-gray-600/80 dark:hover:to-gray-700/80 text-gray-600 dark:text-gray-300'
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
                max-h-32 scrollbar-thin text-over-background
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              style={{ minHeight: '24px', maxHeight: '128px' }}
            />
            
            {/* Clear button */}
            {message && (
              <button
                type="button"
                onClick={clearMessage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shadow-sm"
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
            disabled={disabled || !isOnline}
            className={`
              flex-shrink-0 p-2 rounded-lg transition-all duration-200 shadow-md
              ${isRecording 
                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white animate-pulse' 
                : 'bg-gradient-to-br from-gray-100/80 to-gray-200/80 hover:from-gray-200/80 hover:to-gray-300/80 dark:from-gray-700/80 dark:to-gray-800/80 dark:hover:from-gray-600/80 dark:hover:to-gray-700/80 text-gray-600 dark:text-gray-300'
              }
              ${(disabled || !isOnline) ? 'opacity-50 cursor-not-allowed' : ''}
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
              flex-shrink-0 p-2 rounded-lg transition-all duration-200 shadow-md
              ${!disabled && message.trim()
                ? 'bg-gradient-to-br from-ocean-500 to-blue-600 hover:from-ocean-600 hover:to-blue-700 text-white'
                : 'bg-gradient-to-br from-gray-300/80 to-gray-400/80 dark:from-gray-600/80 dark:to-gray-700/80 text-gray-500 dark:text-gray-400 cursor-not-allowed'
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
            <span className={`transition-colors flex items-center space-x-1 ${
              disabled ? 'text-red-500' : 'text-green-500'
            }`}>
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span>{isOnline ? '● Online' : '● Offline'}</span>
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
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
          className="absolute bottom-full left-0 right-0 mb-3 bg-gradient-to-br from-white/95 to-cyan-50/95 dark:from-gray-800/95 dark:to-slate-800/95 backdrop-blur-2xl border border-cyan-200/50 dark:border-cyan-800/50 rounded-2xl shadow-2xl max-h-72 overflow-y-auto scrollbar-thin"
        >
          <div className="p-4 border-b border-cyan-200/30 dark:border-cyan-800/30">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                Suggested Questions
              </span>
            </div>
          </div>
          <div className="p-3 space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-3 rounded-xl hover:bg-gradient-to-r from-cyan-50/70 to-blue-50/70 dark:hover:from-gray-700/70 dark:hover:to-slate-700/70 text-sm text-gray-700 dark:text-gray-300 transition-all duration-200 text-over-background border border-transparent hover:border-cyan-200/30 dark:hover:border-cyan-800/30"
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
          className="mb-3 p-4 bg-gradient-to-r from-red-100/95 to-red-200/95 dark:from-red-900/95 dark:to-red-800/95 backdrop-blur-lg text-red-700 dark:text-red-200 rounded-2xl text-sm flex items-start space-x-3 border border-red-300/50 dark:border-red-700/50 shadow-xl"
        >
          <div className="flex-shrink-0 mt-0.5">
            {recordingError.includes('network') || recordingError.includes('Network') ? 
              <WifiOff className="h-5 w-5" /> : 
              <MicOff className="h-5 w-5" />
            }
          </div>
          <div className="flex-1">
            <span className="font-bold">Voice recording error:</span> {recordingError}
            <div className="flex items-center space-x-3 mt-3">
              {(recordingError.includes('permission') || recordingError.includes('Permission')) && (
                <button 
                  onClick={requestMicrophonePermission}
                  className="text-xs font-semibold underline text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 px-2 py-1 rounded-lg bg-red-200/50 dark:bg-red-800/50"
                >
                  Request permission
                </button>
              )}
              {(recordingError.includes('network') || recordingError.includes('Network')) && (
                <button 
                  onClick={retrySpeechRecognition}
                  className="flex items-center text-xs font-semibold underline text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 px-2 py-1 rounded-lg bg-red-200/50 dark:bg-red-800/50"
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
          className="mb-3 p-3 bg-gradient-to-r from-yellow-100/95 to-yellow-200/95 dark:from-yellow-900/95 dark:to-yellow-800/95 backdrop-blur-lg text-yellow-700 dark:text-yellow-200 rounded-2xl text-sm flex items-center space-x-3 border border-yellow-300/50 dark:border-yellow-700/50 shadow-xl"
        >
          <WifiOff className="h-5 w-5" />
          <span>Network offline. Voice recording requires an internet connection.</span>
        </motion.div>
      )}

      {/* Main input container */}
      <div className="bg-gradient-to-br from-white/80 to-cyan-50/80 dark:from-gray-800/80 dark:to-slate-800/80 backdrop-blur-2xl rounded-3xl border border-cyan-200/40 dark:border-cyan-800/40 shadow-2xl shadow-cyan-500/20 dark:shadow-cyan-900/30 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3 p-5">
          {/* Suggestion button */}
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className={`flex-shrink-0 p-3 rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105 ${
              showSuggestions
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-500/30'
                : 'bg-gradient-to-br from-white/80 to-gray-100/80 hover:from-cyan-50/80 hover:to-blue-50/80 dark:from-gray-700/80 dark:to-gray-800/80 dark:hover:from-gray-600/80 dark:hover:to-gray-700/80 text-gray-700 dark:text-gray-300 shadow-gray-300/20 dark:shadow-gray-900/20'
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
                max-h-36 scrollbar-thin text-over-background text-lg
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              style={{ minHeight: '28px', maxHeight: '144px' }}
            />
            
            {/* Clear button */}
            {message && (
              <button
                type="button"
                onClick={clearMessage}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm shadow-sm"
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
              flex-shrink-0 p-3 rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105
              ${isRecording 
                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white animate-pulse shadow-red-500/30' 
                : 'bg-gradient-to-br from-white/80 to-gray-100/80 hover:from-cyan-50/80 hover:to-blue-50/80 dark:from-gray-700/80 dark:to-gray-800/80 dark:hover:from-gray-600/80 dark:hover:to-gray-700/80 text-gray-700 dark:text-gray-300 shadow-gray-300/20 dark:shadow-gray-900/20'
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
              flex-shrink-0 p-3 rounded-xl transition-all duration-300 shadow-lg
              ${!disabled && message.trim()
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-cyan-500/30'
                : 'bg-gradient-to-br from-gray-300/80 to-gray-400/80 dark:from-gray-600/80 dark:to-gray-700/80 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-gray-300/20 dark:shadow-gray-900/20'
              }
            `}
            title="Send message"
          >
            <Send className="h-5 w-5" />
          </motion.button>
        </form>

        {/* Input hints */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>
              Press Enter to send, Shift+Enter for new line
            </span>
            <span className={`transition-colors flex items-center space-x-1 font-medium ${
              disabled ? 'text-red-500' : 'text-green-500'
            }`}>
              {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              <span>{isOnline ? '● Online' : '● Offline'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Character count */}
      {message.length > 500 && (
        <div className="mt-2 text-right">
          <span className={`text-xs font-semibold ${
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
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Clock, BarChart3, Copy, Check } from 'lucide-react';
import PlotDisplay from './PlotDisplay';

const Message = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.type === 'user';
  const isError = message.isError;

  console.log('Message component rendered', { messageId: message.id, hasPlotUrl: !!message.plotUrl, plotUrl: message.plotUrl });

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatContent = (content) => {
    // Simple markdown-like formatting
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono">$1</code>') // Code
      .replace(/\n/g, '<br>'); // Line breaks

    return formatted;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-xs sm:max-w-md lg:max-w-3xl ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Message bubble */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`
            relative px-5 py-4 rounded-2xl shadow-xl backdrop-blur-xl border
            ${isUser 
              ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-br-sm border-cyan-600/30' 
              : isError
                ? 'bg-gradient-to-br from-red-100/90 to-red-200/90 dark:from-red-900/90 dark:to-red-800/90 text-red-800 dark:text-red-200 border-red-300/50 dark:border-red-700/50 rounded-bl-sm'
                : 'bg-gradient-to-br from-white/90 to-gray-100/90 dark:from-gray-800/90 dark:to-gray-900/90 text-gray-900 dark:text-gray-100 rounded-bl-sm border-cyan-200/40 dark:border-cyan-800/40'
            }
          `}
        >
          {/* Message content */}
          <div 
            className="prose prose-sm max-w-none dark:prose-invert text-over-background"
            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
          />

          {/* Data summary for data queries */}
          {message.dataSummary && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-cyan-200/30 dark:border-cyan-800/30"
            >
              <div className="flex items-center space-x-2 mb-3">
                <BarChart3 className="h-5 w-5 text-cyan-500" />
                <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">Data Summary</span>
              </div>
              <div className="text-sm space-y-2">
                {message.dataSummary.records_found && (
                  <p className="text-over-background flex items-center">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></span>
                    {message.dataSummary.records_found.toLocaleString()} measurements found
                  </p>
                )}
                {message.dataSummary.profiles && (
                  <p className="text-over-background flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                    {message.dataSummary.profiles.toLocaleString()} unique profiles
                  </p>
                )}
                {message.dataSummary.date_range && (
                  <p className="text-over-background flex items-center">
                    <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                    Data from {message.dataSummary.date_range[0]} to {message.dataSummary.date_range[1]}
                  </p>
                )}
                {message.dataSummary.depth_range && (
                  <p className="text-over-background flex items-center">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                    Depth range: {message.dataSummary.depth_range[0]?.toFixed(1)}m - {message.dataSummary.depth_range[1]?.toFixed(1)}m
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Copy button for assistant messages */}
          {!isUser && (
            <button
              onClick={() => copyToClipboard(message.content)}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm shadow-sm border border-white/30"
              title="Copy message"
            >
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-white" />}
            </button>
          )}
        </motion.div>

        {/* Plot visualization */}
        {message.plotUrl && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4"
          >
            <PlotDisplay plotUrl={message.plotUrl} />
          </motion.div>
        )}

        {/* Message metadata */}
        <div className={`flex items-center space-x-3 mt-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div className={`flex items-center space-x-1.5 ${isUser ? 'order-2' : 'order-1'}`}>
            {isUser ? (
              <User className="h-4 w-4 text-cyan-500" />
            ) : (
              <Bot className="h-4 w-4 text-cyan-500" />
            )}
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-over-background">
              {isUser ? 'You' : 'FloatChat'}
            </span>
          </div>
          
          <div className={`flex items-center space-x-1.5 ${isUser ? 'order-1' : 'order-2'}`}>
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-500 text-over-background">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>

          {/* Query type indicator */}
          {message.queryType && message.queryType !== 'general' && (
            <div className={`${isUser ? 'order-0' : 'order-3'}`}>
              <span className={`
                text-xs px-2.5 py-1 rounded-full font-semibold backdrop-blur-sm shadow-sm border
                ${message.queryType === 'data_query' 
                  ? 'bg-gradient-to-r from-green-100/80 to-emerald-100/80 text-green-700 dark:from-green-900/80 dark:to-emerald-900/80 dark:text-green-300 border-green-300/30 dark:border-green-700/30'
                  : 'bg-gradient-to-r from-blue-100/80 to-cyan-100/80 text-blue-700 dark:from-blue-900/80 dark:to-cyan-900/80 dark:text-blue-300 border-blue-300/30 dark:border-blue-700/30'
                }
              `}>
                {message.queryType === 'data_query' ? 'Data Analysis' : 'Explanation'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Download, Maximize2, AlertCircle, RefreshCw } from 'lucide-react';

const PlotDisplay = ({ plotUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Reset loading state when plotUrl changes
  useEffect(() => {
    console.log('PlotDisplay: plotUrl changed', plotUrl);
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [plotUrl]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const retryLoad = () => {
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    setHasError(false);
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const openInNewTab = () => {
    if (plotUrl && plotUrl.startsWith('data:text/html;base64,')) {
      try {
        const base64Data = plotUrl.replace('data:text/html;base64,', '');
        const decodedHtml = atob(base64Data);
        // Create a new window and write the HTML content directly
        const newWindow = window.open('', '_blank');
        newWindow.document.write(decodedHtml);
        newWindow.document.close();
      } catch (error) {
        console.error('Error opening in new tab:', error);
      }
    } else {
      window.open(plotUrl, '_blank');
    }
  };

  const downloadPlot = () => {
    if (plotUrl && plotUrl.startsWith('data:text/html;base64,')) {
      try {
        const base64Data = plotUrl.replace('data:text/html;base64,', '');
        const decodedHtml = atob(base64Data);
        // Create a Blob from the HTML content and download it
        const blob = new Blob([decodedHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `floatchat_plot_${Date.now()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading plot:', error);
      }
    } else {
      // Create a temporary link to download the plot
      const link = document.createElement('a');
      link.href = plotUrl;
      link.download = `floatchat_plot_${Date.now()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!plotUrl) return null;

  return (
    <>
      {/* Main plot container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-ocean-500/10 dark:shadow-ocean-900/20 overflow-hidden"
      >
        {/* Plot header */}
        <div className="flex items-center justify-between p-3 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-600/50">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Interactive Visualization
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={openFullscreen}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Fullscreen view"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            
            <button
              onClick={openInNewTab}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
            
            <button
              onClick={downloadPlot}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Download plot"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Plot content */}
        <div className="relative h-96 bg-white dark:bg-gray-900/80">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="flex flex-col items-center space-y-3">
                <div className="spinner"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Loading visualization...
                </span>
              </div>
            </div>
          )}

          {hasError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="flex flex-col items-center space-y-3 text-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Failed to load visualization
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Try opening in a new tab or refreshing the page
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={retryLoad}
                    className="flex items-center text-sm text-ocean-600 hover:text-ocean-700 dark:text-ocean-400 dark:hover:text-ocean-300"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Retry
                  </button>
                  <button
                    onClick={openInNewTab}
                    className="text-sm text-ocean-600 hover:text-ocean-700 dark:text-ocean-400 dark:hover:text-ocean-300"
                  >
                    Open in new tab
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Render iframe with the plot URL (either base64 data URI or regular URL)
            <iframe
              key={retryCount}
              src={plotUrl}
              className="w-full h-full border-0"
              title="Data Visualization"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin allow-top-navigation allow-popups allow-popups-to-escape-sandbox allow-downloads allow-forms"
            />
          )}
        </div>
      </motion.div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeFullscreen}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-lg shadow-2xl w-full h-full max-w-7xl max-h-full overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fullscreen header */}
            <div className="flex items-center justify-between p-4 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-600/50">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Visualization - Fullscreen
              </h3>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={openInNewTab}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-5 w-5" />
                </button>
                
                <button
                  onClick={closeFullscreen}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title="Close fullscreen"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Fullscreen content */}
            <div className="relative flex-1 h-[calc(100%-60px)]">
              <iframe
                key={`fullscreen-${retryCount}`}
                src={plotUrl}
                className="w-full h-full border-0"
                title="Data Visualization - Fullscreen"
                sandbox="allow-scripts allow-same-origin allow-top-navigation allow-popups allow-popups-to-escape-sandbox allow-downloads allow-forms"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default PlotDisplay;
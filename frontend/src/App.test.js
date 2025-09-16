import React from 'react';

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            FloatChat
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Ocean Data AI Assistant
          </p>
          <div className="mt-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
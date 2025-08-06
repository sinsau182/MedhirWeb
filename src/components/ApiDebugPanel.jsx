import React from 'react';
import { useApiDebug } from '../hooks/useApiDebug';

const ApiDebugPanel = ({ isVisible = false }) => {
  const { debugResults, isRunning, runDebug, clearResults } = useApiDebug();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">API Debug Panel</h3>
        <button
          onClick={clearResults}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <button
        onClick={runDebug}
        disabled={isRunning}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isRunning ? 'Running Tests...' : 'Run API Tests'}
      </button>

      {debugResults && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Configuration:</h4>
          <div className="text-sm bg-gray-100 p-2 rounded mb-3">
            <div>API URL: {debugResults.config?.apiURL}</div>
            <div>Environment: {debugResults.config?.env}</div>
          </div>

          <h4 className="font-medium mb-2">Test Results:</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {debugResults.tests?.map((test, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm ${
                  test.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                <div className="font-medium">{test.name}</div>
                <div className="text-xs">
                  {test.success ? (
                    <span>✅ {test.message}</span>
                  ) : (
                    <span>❌ {test.error}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiDebugPanel; 
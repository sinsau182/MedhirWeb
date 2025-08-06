import { useState, useCallback } from 'react';
import { debugApiConnectivity } from '../utils/apiDebug';

export const useApiDebug = () => {
  const [debugResults, setDebugResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDebug = useCallback(async () => {
    setIsRunning(true);
    try {
      const results = await debugApiConnectivity();
      setDebugResults(results);
      return results;
    } catch (error) {
      console.error('Debug failed:', error);
      setDebugResults({ error: error.message });
    } finally {
      setIsRunning(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setDebugResults(null);
  }, []);

  return {
    debugResults,
    isRunning,
    runDebug,
    clearResults
  };
}; 
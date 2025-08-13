import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setItem, 
  removeItem, 
  clearAll,
  updateUserPreferences,
  addRecentItem,
  setTheme,
  updateLastVisitedPage,
  selectUserPreferences,
  selectRecentItems,
  selectTheme,
  selectLastVisitedPage
} from '@/redux/slices/sessionStorageSlice';
import { toast } from 'sonner';

/**
 * Custom hook for using the sessionStorage slice
 * @returns {Object} Object containing sessionStorage methods and selectors
 */
const useSessionStorage = () => {
  const dispatch = useDispatch();
  
  // Selectors
  const userPreferences = useSelector(selectUserPreferences);
  const recentItems = useSelector(selectRecentItems);
  const theme = useSelector(selectTheme);
  const lastVisitedPage = useSelector(selectLastVisitedPage);
  
  /**
   * Set an item in sessionStorage
   * @param {string} key - The key to store the value under
   * @param {any} value - The value to store
   * @param {boolean} encrypt - Whether to encrypt the value (default: true)
   */
  const setSessionItem = useCallback((key, value, encrypt = true) => {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
      dispatch(setItem({ key, value, encrypt }));
    } catch (error) {
      toast.error('Error setting session storage item:', error);
    }
  }, [dispatch]);
  
  /**
   * Get an item from sessionStorage
   * @param {string} key - The key to retrieve
   * @param {any} defaultValue - Default value if key doesn't exist
   */
  const getSessionItem = useCallback((key, defaultValue = null) => {
    try {
      const item = sessionStorage.getItem(key);
      if (!item) return defaultValue;
      
      // Try to parse as JSON first, if it fails, return the raw string
      try {
        return JSON.parse(item);
      } catch (parseError) {
        // If JSON parsing fails, return the raw string value
        // This handles cases where values like company IDs are stored as plain strings
        return item;
      }
    } catch (error) {
      toast.error('Error getting session storage item:', error);
      return defaultValue;
    }
  }, []);
  
  /**
   * Remove an item from sessionStorage
   * @param {string} key - The key to remove
   */
  const removeSessionItem = useCallback((key) => {
    try {
      sessionStorage.removeItem(key);
      dispatch(removeItem({ key }));
    } catch (error) {
      toast.error('Error removing session storage item:', error);
    }
  }, [dispatch]);
  
  /**
   * Clear all items from sessionStorage
   */
  const clearSessionStorage = useCallback(() => {
    try {
      sessionStorage.clear();
      dispatch(clearAll());
    } catch (error) {
      toast.error('Error clearing session storage:', error);
    }
  }, [dispatch]);
  
  /**
   * Update user preferences
   * @param {Object} preferences - The preferences to update
   */
  const updatePreferences = (preferences) => {
    dispatch(updateUserPreferences(preferences));
  };
  
  /**
   * Add a recent item
   * @param {Object} item - The item to add
   */
  const addRecent = (item) => {
    dispatch(addRecentItem(item));
  };
  
  /**
   * Set the theme
   * @param {string} theme - The theme to set
   */
  const setAppTheme = (theme) => {
    dispatch(setTheme(theme));
  };
  
  /**
   * Update the last visited page
   * @param {string} page - The page to set as last visited
   */
  const updateLastPage = (page) => {
    dispatch(updateLastVisitedPage(page));
  };
  
  return {
    // Methods
    setSessionItem,
    getSessionItem,
    removeSessionItem,
    clearSessionStorage,
    updatePreferences,
    addRecent,
    setAppTheme,
    updateLastPage,
    
    // Selectors
    userPreferences,
    recentItems,
    theme,
    lastVisitedPage,
  };
};

export default useSessionStorage; 
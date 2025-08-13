import { createSlice } from '@reduxjs/toolkit';
import CryptoJS from 'crypto-js';

// Encryption key - in a real app, this should be stored securely and not hardcoded
// Consider using environment variables or a secure key management service
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'your-secure-encryption-key';

// Helper function to encrypt data
const encryptData = (data) => {
  try {
    const jsonStr = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonStr, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

// Helper function to decrypt data
const decryptData = (encryptedData) => {
  try {
    if (!encryptedData) return null;
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// Helper function to safely get item from sessionStorage
const getItemFromSessionStorage = (key, defaultValue = null) => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const encryptedItem = sessionStorage.getItem(key);
    if (!encryptedItem) return defaultValue;
    
    // Check if the item is encrypted (starts with U2F)
    if (encryptedItem.startsWith('U2F')) {
      return decryptData(encryptedItem);
    }
    
    // For backward compatibility with non-encrypted items
    // Try to parse as JSON first, if it fails, return the raw string
    try {
      return JSON.parse(encryptedItem);
    } catch (parseError) {
      // If JSON parsing fails, return the raw string value
      // This handles cases where values like company IDs are stored as plain strings
      return encryptedItem;
    }
  } catch (error) {
    console.error(`Error getting item ${key} from sessionStorage:`, error);
    return defaultValue;
  }
};

// Helper function to safely set item in sessionStorage
const setItemInSessionStorage = (key, value, encrypt = true) => {
  if (typeof window === 'undefined') return;
  
  try {
    let serializedValue;
    
    if (encrypt) {
      serializedValue = encryptData(value);
    } else {
      serializedValue = JSON.stringify(value);
    }
    
    if (serializedValue) {
      sessionStorage.setItem(key, serializedValue);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error setting item ${key} in sessionStorage:`, error);
    return false;
  }
};

// Helper function to safely remove item from sessionStorage
const removeItemFromSessionStorage = (key) => {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item ${key} from sessionStorage:`, error);
    return false;
  }
};

// Helper function to safely clear all items from sessionStorage
const clearSessionStorage = () => {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
    return false;
  }
};

// Initial state with some common session items
const initialState = {
  userPreferences: getItemFromSessionStorage('userPreferences', {}),
  recentItems: getItemFromSessionStorage('recentItems', []),
  theme: getItemFromSessionStorage('theme', 'light'),
  lastVisitedPage: getItemFromSessionStorage('lastVisitedPage', '/'),
  sessionStartTime: getItemFromSessionStorage('sessionStartTime', Date.now()),
};

const sessionStorageSlice = createSlice({
  name: 'sessionStorage',
  initialState,
  reducers: {
    // Set a specific item in sessionStorage and update Redux state
    setItem: (state, action) => {
      const { key, value, encrypt = true } = action.payload;
      setItemInSessionStorage(key, value, encrypt);
      state[key] = value;
    },
    
    // Get a specific item from sessionStorage and update Redux state
    getItem: (state, action) => {
      const { key, defaultValue } = action.payload;
      const value = getItemFromSessionStorage(key, defaultValue);
      state[key] = value;
    },
    
    // Remove a specific item from sessionStorage and update Redux state
    removeItem: (state, action) => {
      const { key } = action.payload;
      removeItemFromSessionStorage(key);
      delete state[key];
    },
    
    // Clear all items from sessionStorage and reset Redux state
    clearAll: (state) => {
      clearSessionStorage();
      Object.keys(state).forEach(key => {
        delete state[key];
      });
    },
    
    // Update user preferences
    updateUserPreferences: (state, action) => {
      const preferences = action.payload;
      const updatedPreferences = { ...state.userPreferences, ...preferences };
      setItemInSessionStorage('userPreferences', updatedPreferences, true);
      state.userPreferences = updatedPreferences;
    },
    
    // Add a recent item
    addRecentItem: (state, action) => {
      const item = action.payload;
      const updatedItems = [item, ...state.recentItems.filter(i => i.id !== item.id)].slice(0, 10);
      setItemInSessionStorage('recentItems', updatedItems, true);
      state.recentItems = updatedItems;
    },
    
    // Set theme
    setTheme: (state, action) => {
      const theme = action.payload;
      setItemInSessionStorage('theme', theme, true);
      state.theme = theme;
    },
    
    // Update last visited page
    updateLastVisitedPage: (state, action) => {
      const page = action.payload;
      setItemInSessionStorage('lastVisitedPage', page, true);
      state.lastVisitedPage = page;
    },
  },
});

// Export actions
export const {
  setItem,
  getItem,
  removeItem,
  clearAll,
  updateUserPreferences,
  addRecentItem,
  setTheme,
  updateLastVisitedPage,
} = sessionStorageSlice.actions;

// Export reducer
export default sessionStorageSlice.reducer;

// Export selectors
export const selectUserPreferences = (state) => state.sessionStorage.userPreferences;
export const selectRecentItems = (state) => state.sessionStorage.recentItems;
export const selectTheme = (state) => state.sessionStorage.theme;
export const selectLastVisitedPage = (state) => state.sessionStorage.lastVisitedPage;
export const selectSessionStartTime = (state) => state.sessionStorage.sessionStartTime; 

export { getItemFromSessionStorage };
export { setItemInSessionStorage };
export { removeItemFromSessionStorage };
export { clearSessionStorage };
export { encryptData };
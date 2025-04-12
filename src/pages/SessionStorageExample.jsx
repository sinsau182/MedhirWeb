import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setItem, 
  getItem, 
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

const SessionStorageExample = () => {
  const dispatch = useDispatch();
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  
  // Select data from Redux store
  const userPreferences = useSelector(selectUserPreferences);
  const recentItems = useSelector(selectRecentItems);
  const theme = useSelector(selectTheme);
  const lastVisitedPage = useSelector(selectLastVisitedPage);
  
  // Example of setting a custom item
  const handleSetItem = () => {
    if (key && value) {
      dispatch(setItem({ key, value: JSON.parse(value) }));
      setKey('');
      setValue('');
    }
  };
  
  // Example of getting a custom item
  const handleGetItem = () => {
    if (key) {
      dispatch(getItem({ key, defaultValue: null }));
    }
  };
  
  // Example of removing a custom item
  const handleRemoveItem = () => {
    if (key) {
      dispatch(removeItem({ key }));
      setKey('');
    }
  };
  
  // Example of clearing all items
  const handleClearAll = () => {
    dispatch(clearAll());
  };
  
  // Example of updating user preferences
  const handleUpdatePreferences = () => {
    const newPreferences = {
      fontSize: 'medium',
      notifications: true,
      language: 'en'
    };
    dispatch(updateUserPreferences(newPreferences));
  };
  
  // Example of adding a recent item
  const handleAddRecentItem = () => {
    const newItem = {
      id: Date.now(),
      name: 'Example Item',
      timestamp: new Date().toISOString()
    };
    dispatch(addRecentItem(newItem));
  };
  
  // Example of setting theme
  const handleSetTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };
  
  // Example of updating last visited page
  const handleUpdateLastVisitedPage = () => {
    const newPage = '/dashboard';
    dispatch(updateLastVisitedPage(newPage));
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">SessionStorage Redux Example</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Custom Items</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Key</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter key"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Value (JSON)</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder='{"example": "value"}'
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSetItem}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Set Item
            </button>
            <button
              onClick={handleGetItem}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Get Item
            </button>
            <button
              onClick={handleRemoveItem}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Remove Item
            </button>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear All
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Predefined Actions</h2>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={handleUpdatePreferences}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Update Preferences
            </button>
            <button
              onClick={handleAddRecentItem}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Add Recent Item
            </button>
            <button
              onClick={handleSetTheme}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Toggle Theme
            </button>
            <button
              onClick={handleUpdateLastVisitedPage}
              className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
            >
              Update Last Page
            </button>
          </div>
          
          <h3 className="text-lg font-medium mb-2">Current State</h3>
          <div className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
            <pre className="text-sm">
              {JSON.stringify({
                userPreferences,
                recentItems,
                theme,
                lastVisitedPage
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionStorageExample; 
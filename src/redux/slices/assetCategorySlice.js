
//export default assetCategorySlice.reducer; ////
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import getConfig from 'next/config';
import { getItemFromSessionStorage } from './sessionStorageSlice';
const { publicRuntimeConfig } = getConfig();

const API_BASE = publicRuntimeConfig.apiURL + "/api/asset-settings/categories";

// Debug function to log API configuration
const logApiConfig = () => {
  console.log('API Configuration:', {
    apiURL: publicRuntimeConfig.apiURL,
    API_BASE: API_BASE,
    env: publicRuntimeConfig.env
  });
};

/**
 * AVAILABLE ASSET CATEGORY ENDPOINTS (Based on AssetSettingController.java):
 * 
 * 1. GET /api/asset-settings/categories
 *    - Fetch all categories with sub-categories included
 *    - Used by: fetchAssetCategories()
 * 
 * 2. GET /api/asset-settings/categories/{categoryId}
 *    - Fetch a specific category with sub-categories included
 *    - Used by: fetchAssetCategory()
 * 
 * 3. POST /api/asset-settings/categories
 *    - Create a new category
 *    - Used by: addAssetCategory()
 * 
 * 4. PATCH /api/asset-settings/categories/{categoryId}
 *    - Update a category
 *    - Used by: updateAssetCategory()
 * 
 * 5. PATCH /api/asset-settings/categories/batch
 *    - Batch update categories
 *    - Used by: batchUpdateAssetCategories()
 * 
 * 6. DELETE /api/asset-settings/categories/{categoryId}
 *    - Delete a category
 *    - Used by: deleteAssetCategory()
 * 
 * 7. GET /api/asset-settings/categories/{categoryId}/sub-categories
 *    - Get all sub-categories for a specific category
 *    - Used by: fetchSubCategoriesByCategory()
 * 
 * 8. GET /api/asset-settings/sub-categories/{subCategoryId}
 *    - Get a specific sub-category by ID
 *    - Used by: fetchSubCategoryById()
 * 
 * 9. POST /api/asset-settings/categories/{categoryId}/sub-categories
 *    - Add a sub-category to a category
 *    - Used by: addSubCategory()
 * 
 * 10. PATCH /api/asset-settings/sub-categories/{subCategoryId}
 *     - Update a sub-category
 *     - Used by: updateSubCategory()
 * 
 * 11. DELETE /api/asset-settings/sub-categories/{subCategoryId}
 *     - Delete a sub-category
 *     - Used by: deleteSubCategory()
 * 
 * ADDITIONAL ASSET ENDPOINTS (Based on AssetController.java):
 * 
 * 12. GET /api/assets
 *     - Get all assets
 *     - Used by: fetchAllAssets()
 * 
 * 13. GET /api/assets/detailed
 *     - Get all assets with detailed information
 *     - Used by: fetchAllAssetsDetailed()
 * 
 * 14. GET /api/assets/{id}
 *     - Get asset by MongoDB ID
 *     - Used by: fetchAssetById()
 * 
 * 15. GET /api/assets/asset/{assetId}
 *     - Get asset by Asset ID (auto-generated ID like D-03-3001)
 *     - Used by: fetchAssetByAssetId()
 * 
 * 16. GET /api/assets/asset/{assetId}/detailed
 *     - Get asset by Asset ID with detailed information
 *     - Used by: fetchAssetByAssetIdDetailed()
 * 
 * 17. GET /api/assets/category/{categoryId}
 *     - Get assets by category ID
 *     - Used by: fetchAssetsByCategory()
 * 
 * 18. GET /api/assets/{assetId}/with-custom-forms
 *     - Get asset with custom form data
 *     - Used by: fetchAssetWithCustomForms()
 * 
 * 19. PATCH /api/assets/{assetId}/custom-fields
 *     - Update asset custom fields
 *     - Used by: updateAssetCustomFields()
 * 
 * 20. GET /api/assets/{assetId}/validate
 *     - Validate asset against category requirements
 *     - Used by: validateAsset()
 * 
 * CUSTOM FORM ENDPOINTS (Based on CustomFormController.java):
 * 
 * 21. GET /api/asset-settings/custom-forms
 *     - Get custom forms by company and optional category
 *     - Used by: fetchCustomForms()
 * 
 * 22. GET /api/asset-settings/custom-forms/{formId}
 *     - Get custom form by ID
 *     - Used by: fetchCustomFormById()
 * 
 * 23. POST /api/asset-settings/custom-forms
 *     - Create custom form
 *     - Used by: createCustomForm()
 * 
 * 24. PUT /api/asset-settings/custom-forms/{formId}
 *     - Update custom form
 *     - Used by: updateCustomForm()
 * 
 * 25. DELETE /api/asset-settings/custom-forms/{formId}
 *     - Delete custom form
 *     - Used by: deleteCustomForm()
 * 
 * 26. GET /api/asset-settings/custom-forms/{formId}/fields
 *     - Get form fields
 *     - Used by: fetchFormFields()
 * 
 * 27. POST /api/asset-settings/custom-forms/{formId}/fields
 *     - Add field to form
 *     - Used by: addFieldToForm()
 * 
 * 28. PUT /api/asset-settings/custom-forms/{formId}/fields/{fieldId}
 *     - Update field
 *     - Used by: updateField()
 * 
 * 29. DELETE /api/asset-settings/custom-forms/{formId}/fields/{fieldId}
 *     - Delete field
 *     - Used by: deleteField()
 * 
 * 30. PUT /api/asset-settings/custom-forms/{formId}/assign
 *     - Assign form to category
 *     - Used by: assignFormToCategory()
 * 
 * 31. DELETE /api/asset-settings/custom-forms/{formId}/assign
 *     - Unassign form from category
 *     - Used by: unassignFormFromCategory()
 * 
 * 32. GET /api/asset-settings/custom-forms/category/{categoryId}
 *     - Get forms by category
 *     - Used by: fetchFormsByCategory()
 * 
 * 33. GET /api/asset-settings/custom-forms/{formId}/preview
 *     - Preview form
 *     - Used by: previewForm()
 * 
 * 34. POST /api/asset-settings/custom-forms/{formId}/duplicate
 *     - Duplicate form
 *     - Used by: duplicateForm()
 * 
 * 35. PATCH /api/asset-settings/custom-forms/{formId}/toggle-status
 *     - Toggle form status
 *     - Used by: toggleFormStatus()
 * 
 * 36. POST /api/asset-settings/custom-forms/{formId}/submit
 *     - Submit form data
 *     - Used by: submitFormData()
 * 
 * 37. GET /api/asset-settings/custom-forms/{formId}/data/{assetId}
 *     - Get form data for asset
 *     - Used by: fetchFormDataForAsset()
 * 
 * 38. GET /api/asset-settings/custom-forms/data/asset/{assetId}
 *     - Get all form data for asset
 *     - Used by: fetchAllFormDataForAsset()
 * 
 * 39. DELETE /api/asset-settings/custom-forms/data/{dataId}
 *     - Delete form data
 *     - Used by: deleteFormData()
 */

// Health check function to verify API server connectivity
export const checkApiHealth = async () => {
  try {
    const baseUrl = publicRuntimeConfig.apiURL;
    console.log('Checking API health at:', baseUrl);
    
    // Try multiple health check endpoints
    const healthEndpoints = ['/health', '/api/health', '/actuator/health', '/'];
    
    for (const endpoint of healthEndpoints) {
      try {
        const response = await axios.get(`${baseUrl}${endpoint}`, { 
          timeout: 3000,
          validateStatus: function (status) {
            return status < 500; // Accept any response less than 500 as "server is running"
          }
        });
        
        console.log(`API Health Check Response from ${endpoint}:`, response.status);
        return { isHealthy: true, status: response.status, endpoint };
      } catch (endpointError) {
        console.log(`Health check failed for ${endpoint}:`, endpointError.message);
        continue; // Try next endpoint
      }
    }
    
    // If all endpoints fail, check if server is reachable at all
    try {
      const response = await axios.get(baseUrl, { 
        timeout: 3000,
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log('API server is reachable but no health endpoint found:', response.status);
      return { isHealthy: true, status: response.status, endpoint: 'root' };
    } catch (rootError) {
      console.error('API server is not reachable:', rootError.message);
      return { 
        isHealthy: false, 
        error: rootError.message,
        code: rootError.code 
      };
    }
  } catch (error) {
    console.error('API Health Check Failed:', {
      message: error.message,
      code: error.code,
      url: error.config?.url
    });
    return { 
      isHealthy: false, 
      error: error.message,
      code: error.code 
    };
  }
};

// Fetch all categories with sub-categories
export const fetchAssetCategories = createAsyncThunk(
  'assetCategories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      logApiConfig();
      console.log('Fetching asset categories from:', API_BASE);
      
      // First, try to check if the API server is running
      try {
        const healthCheck = await checkApiHealth();
        if (!healthCheck.isHealthy) {
          console.warn('API server is not running, returning empty array');
          return [];
        }
      } catch (healthError) {
        console.warn('Health check failed, proceeding with request anyway');
      }
      
      const response = await axios.get(API_BASE, { 
        headers,
        timeout: 10000, // 10 second timeout
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        }
      });
      
      console.log('Raw API response:', response.data);
      
      // Handle the API response structure: { success: true, data: [...] }
      const data = response.data?.data || response.data;
      
      // Ensure sub-categories are properly structured based on API documentation
      const categoriesWithSubCategories = data.map(category => {
        console.log('Processing category:', category);
        
        const processedCategory = {
          ...category,
          // Ensure subCategories is always an array and properly structured
          subCategories: Array.isArray(category.subCategories) 
            ? category.subCategories.map(subCat => {
                console.log('Processing subcategory:', subCat);
                return {
                  ...subCat,
                  // Use the correct field names from API
                  subCategoryId: subCat.subCategoryId || subCat.id,
                  subCategoryCode: subCat.subCategoryCode || subCat.name?.substring(0, 3).toUpperCase() || '',
                  name: subCat.name || '',
                  id: subCat.id || subCat.subCategoryId,
                  // Ensure we have all required fields
                  categoryId: category.categoryId || category.id,
                  isActive: subCat.isActive !== undefined ? subCat.isActive : true
                };
              })
            : [],
          categoryCode: category.categoryCode || category.name?.substring(0, 3).toUpperCase() || '',
          categoryId: category.categoryId || category.id
        };
        
        console.log('Processed category:', processedCategory);
        return processedCategory;
      });
      
      console.log('Processed categories with subcategories:', categoriesWithSubCategories);
      return categoriesWithSubCategories;
    } catch (error) {
      console.error('Redux: Error fetching asset categories:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // If it's a network error (server not running), return empty array instead of error
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        console.warn('API server appears to be down, returning empty array');
        return [];
      }
      
      // Provide more specific error messages for other errors
      let errorMessage = 'Failed to fetch asset categories';
      if (error.response?.status === 404) {
        errorMessage = 'API endpoint not found - check server configuration';
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized - check authentication token';
      } else if (error.response?.status === 403) {
        errorMessage = 'Forbidden - check permissions';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Utility function to get sub-categories by category ID
// Since there's no direct endpoint for this, we'll filter from the fetched categories
export const getSubCategoriesByCategoryId = (categoryId, categories) => {
  const category = categories.find(cat => 
    cat.categoryId === categoryId || cat.id === categoryId
  );
  return category ? category.subCategories || [] : [];
};

// Add a new category
export const addAssetCategory = createAsyncThunk(
  'assetCategories/add',
  async (category, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      console.log('Adding asset category:', category);
      console.log('API Base URL:', API_BASE);
      
      // First, try to check if the API server is running
      try {
        const healthCheck = await checkApiHealth();
        if (!healthCheck.isHealthy) {
          console.warn('API server is not running, cannot add category');
          return rejectWithValue('API server is not available');
        }
      } catch (healthError) {
        console.warn('Health check failed, proceeding with request anyway');
      }
      
      const response = await axios.post(API_BASE, category, { 
        headers,
        timeout: 10000, // 10 second timeout
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        }
      });
      
      const data = response.data?.data || response.data;
      return {
        ...data,
        subCategories: [],
        categoryCode: data.categoryCode || category.name?.substring(0, 3).toUpperCase() || ''
      };
    } catch (error) {
      console.error('Redux: Error adding asset category:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // If it's a network error (server not running), return specific error
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        console.warn('API server appears to be down');
        return rejectWithValue('API server is not available');
      }
      
      // Provide more specific error messages for other errors
      let errorMessage = 'Failed to add asset category';
      if (error.response?.status === 404) {
        errorMessage = 'API endpoint not found - check server configuration';
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized - check authentication token';
      } else if (error.response?.status === 403) {
        errorMessage = 'Forbidden - check permissions';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Update a category
export const updateAssetCategory = createAsyncThunk(
  'assetCategories/update',
  async ({ categoryId, assetData }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      console.log('Updating asset category:', { categoryId, assetData });
      console.log('API URL:', `${API_BASE}/${categoryId}`);
      
      // First, try to check if the API server is running
      try {
        const healthCheck = await checkApiHealth();
        if (!healthCheck.isHealthy) {
          console.warn('API server is not running, cannot update category');
          return rejectWithValue('API server is not available');
        }
      } catch (healthError) {
        console.warn('Health check failed, proceeding with request anyway');
      }
      
      const response = await axios.patch(`${API_BASE}/${categoryId}`, assetData, { 
        headers,
        timeout: 10000, // 10 second timeout
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        }
      });
      
      const data = response.data?.data || response.data;
      return {
        ...data,
        categoryId: categoryId,
        categoryCode: data.categoryCode || assetData.name?.substring(0, 3).toUpperCase() || ''
      };
    } catch (error) {
      console.error('Redux: Error updating asset category:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // If it's a network error (server not running), return specific error
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        console.warn('API server appears to be down');
        return rejectWithValue('API server is not available');
      }
      
      // Provide more specific error messages for other errors
      let errorMessage = 'Failed to update asset category';
      if (error.response?.status === 404) {
        errorMessage = 'API endpoint not found - check server configuration';
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized - check authentication token';
      } else if (error.response?.status === 403) {
        errorMessage = 'Forbidden - check permissions';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Batch update categories
export const batchUpdateAssetCategories = createAsyncThunk(
  'assetCategories/batchUpdate',
  async (categories, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.patch(`${API_BASE}/batch`, categories, { headers });
      
      const data = response.data?.data?.categories || response.data;
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to batch update categories');
    }
  }
);

// Delete a category
export const deleteAssetCategory = createAsyncThunk(
  'assetCategories/delete',
  async (categoryId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${API_BASE}/${categoryId}`, { headers });
      return categoryId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

// Add sub-category to category
export const addSubCategory = createAsyncThunk(
  'assetCategories/addSubCategory',
  async ({ categoryId, subCategoryData }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(`${API_BASE}/${categoryId}/sub-categories`, subCategoryData, { headers });
      
      console.log('Add subcategory API response:', response.data);
      console.log('Full response object:', response);
      
      // Handle the API response structure: { message: "...", subCategory: {...} }
      const data = response.data?.subCategory || response.data;
      
      console.log('Extracted data from response:', data);
      
      // Ensure we have all required fields for the subcategory
      const subCategory = {
        ...data,
        subCategoryId: data.subCategoryId || data.id,
        subCategoryCode: data.subCategoryCode || subCategoryData.name?.substring(0, 3).toUpperCase() || '',
        name: data.name || subCategoryData.name || '',
        id: data.id || data.subCategoryId,
        categoryId: categoryId,
        isActive: data.isActive !== undefined ? data.isActive : true
      };
      
      console.log('Processed subcategory for state:', subCategory);
      
      return {
        categoryId,
        subCategory
      };
    } catch (error) {
      console.error('Error adding subcategory:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to add sub-category');
    }
  }
);

// Update sub-category
export const updateSubCategory = createAsyncThunk(
  'assetCategories/updateSubCategory',
  async ({ categoryId, subCategoryId, subCategoryData }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // Based on backend: PATCH /api/asset-settings/sub-categories/{subCategoryId}
      const response = await axios.patch(`${publicRuntimeConfig.apiURL}/api/asset-settings/sub-categories/${subCategoryId}`, subCategoryData, { headers });
      
      console.log('Update subcategory API response:', response.data);
      
      // Handle the API response structure
      const data = response.data?.subCategory || response.data;
      
      return {
        categoryId,
        subCategory: {
          ...data,
          subCategoryId: subCategoryId,
          subCategoryCode: data.subCategoryCode || subCategoryData.name?.substring(0, 3).toUpperCase() || '',
          name: data.name || subCategoryData.name || '',
          id: data.id || subCategoryId
        }
      };
    } catch (error) {
      console.error('Error updating subcategory:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update sub-category');
    }
  }
);

// Delete sub-category
export const deleteSubCategory = createAsyncThunk(
  'assetCategories/deleteSubCategory',
  async ({ categoryId, subCategoryId }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Use the correct endpoint: DELETE /api/asset-settings/sub-categories/{subCategoryId}
      await axios.delete(`${publicRuntimeConfig.apiURL}/api/asset-settings/sub-categories/${subCategoryId}`, { headers });
      
      return { categoryId, subCategoryId };
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete sub-category');
    }
  }
);

// Fetch sub-categories for a specific category
export const fetchSubCategoriesByCategory = createAsyncThunk(
  'assetCategories/fetchSubCategoriesByCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_BASE}/${categoryId}/sub-categories`, { headers });
      
      console.log('Fetch subcategories by category API response:', response.data);
      
      // Handle the API response structure: { success: true, data: [...] }
      const data = response.data?.data || response.data;
      
      // Ensure sub-categories are properly structured
      const subCategories = Array.isArray(data) ? data.map(subCat => ({
        ...subCat,
        subCategoryId: subCat.subCategoryId || subCat.id,
        subCategoryCode: subCat.subCategoryCode || subCat.name?.substring(0, 3).toUpperCase() || '',
        name: subCat.name || '',
        id: subCat.id || subCat.subCategoryId,
        categoryId: categoryId,
        isActive: subCat.isActive !== undefined ? subCat.isActive : true
      })) : [];
      
      console.log('Processed subcategories for category:', subCategories);
      
      return {
        categoryId,
        subCategories
      };
    } catch (error) {
      console.error('Error fetching subcategories by category:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sub-categories');
    }
  }
);

// Fetch a specific sub-category by ID
export const fetchSubCategoryById = createAsyncThunk(
  'assetCategories/fetchSubCategoryById',
  async (subCategoryId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${publicRuntimeConfig.apiURL}/api/asset-settings/sub-categories/${subCategoryId}`, { headers });
      
      console.log('Fetch subcategory by ID API response:', response.data);
      
      // Handle the API response structure
      const data = response.data?.data || response.data;
      
      // Ensure sub-category is properly structured
      const subCategory = {
        ...data,
        subCategoryId: data.subCategoryId || data.id,
        subCategoryCode: data.subCategoryCode || data.name?.substring(0, 3).toUpperCase() || '',
        name: data.name || '',
        id: data.id || data.subCategoryId,
        isActive: data.isActive !== undefined ? data.isActive : true
      };
      
      console.log('Processed subcategory by ID:', subCategory);
      
      return subCategory;
    } catch (error) {
      console.error('Error fetching subcategory by ID:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sub-category');
    }
  }
);

const assetCategorySlice = createSlice({
  name: 'assetCategories',
  initialState: {
    categories: [],
    loading: false,
    error: null,
    addingSubCategory: false,
    updatingSubCategory: false,
    deletingSubCategory: false,
    fetchingSubCategories: false,
    fetchingSubCategory: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Local state management for inline editing
    updateCategoryLocal: (state, action) => {
      const { categoryId, field, value } = action.payload;
      console.log('updateCategoryLocal called with:', { categoryId, field, value });
      
      const category = state.categories.find(cat => 
        cat.categoryId === categoryId || cat.id === categoryId
      );
      
      console.log('Found category for local update:', category);
      
      if (category) {
        category[field] = value;
        if (field === 'name') {
          category.categoryCode = value?.substring(0, 3).toUpperCase() || '';
        }
        console.log('Updated category locally:', category);
      } else {
        console.warn('Category not found for local update:', categoryId);
      }
    },
    updateSubCategoryLocal: (state, action) => {
      const { categoryId, subCategoryId, field, value } = action.payload;
      console.log('updateSubCategoryLocal called with:', { categoryId, subCategoryId, field, value });
      
      const category = state.categories.find(cat => 
        cat.categoryId === categoryId || cat.id === categoryId
      );
      
      console.log('Found category for local update:', category);
      
      if (category && category.subCategories) {
        const subCategory = category.subCategories.find(sub => 
          sub.subCategoryId === subCategoryId || sub.id === subCategoryId
        );
        
        console.log('Found subcategory for local update:', subCategory);
        
        if (subCategory) {
          subCategory[field] = value;
          if (field === 'name') {
            subCategory.subCategoryCode = value?.substring(0, 3).toUpperCase() || '';
          }
          console.log('Updated subcategory locally:', subCategory);
        } else {
          console.warn('Subcategory not found for local update:', subCategoryId);
        }
      } else {
        console.warn('Category or subcategories not found for local update:', { categoryId, subCategoryId });
      }
    },
    addSubCategoryLocal: (state, action) => {
      const { categoryId, subCategory } = action.payload;
      console.log('addSubCategoryLocal called with:', { categoryId, subCategory });
      
      const category = state.categories.find(cat => 
        cat.categoryId === categoryId || cat.id === categoryId
      );
      
      console.log('Found category for local addition:', category);
      
      if (category) {
        if (!category.subCategories) {
          category.subCategories = [];
        }
        
        const newSubCategory = {
          ...subCategory,
          id: Date.now() + Math.random(), // Temporary ID for UI
          editing: subCategory.editing || false
        };
        
        category.subCategories.push(newSubCategory);
        console.log('Added subcategory locally:', newSubCategory);
        console.log('Updated category subcategories:', category.subCategories);
      } else {
        console.warn('Category not found for local subcategory addition:', categoryId);
      }
    },
    removeSubCategoryLocal: (state, action) => {
      const { categoryId, subCategoryId } = action.payload;
      console.log('removeSubCategoryLocal called with:', { categoryId, subCategoryId });
      
      const category = state.categories.find(cat => 
        cat.categoryId === categoryId || cat.id === categoryId
      );
      
      console.log('Found category for local removal:', category);
      
      if (category && category.subCategories) {
        const beforeCount = category.subCategories.length;
        category.subCategories = category.subCategories.filter(sub => 
          sub.subCategoryId !== subCategoryId && sub.id !== subCategoryId
        );
        const afterCount = category.subCategories.length;
        console.log(`Removed subcategory locally. Before: ${beforeCount}, After: ${afterCount}`);
      } else {
        console.warn('Category or subcategories not found for local removal:', { categoryId, subCategoryId });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchAssetCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('fetchAssetCategories.pending - setting loading to true');
      })
      .addCase(fetchAssetCategories.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Setting categories in Redux state:', action.payload);
        console.log('Categories structure in Redux state:', action.payload?.map(cat => ({
          id: cat.id,
          categoryId: cat.categoryId,
          name: cat.name,
          subCategoriesCount: cat.subCategories?.length || 0,
          subCategories: cat.subCategories
        })));
        state.categories = action.payload;
      })
      .addCase(fetchAssetCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log('fetchAssetCategories.rejected - setting loading to false, error:', action.payload);
      })
      
      // Add category
      .addCase(addAssetCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('addAssetCategory.pending - setting loading to true');
      })
      .addCase(addAssetCategory.fulfilled, (state, action) => {
        state.loading = false;
        console.log('addAssetCategory.fulfilled called with:', action.payload);
        state.categories.push(action.payload);
        console.log('Added new category to state. Total categories:', state.categories.length);
      })
      .addCase(addAssetCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log('addAssetCategory.rejected - setting loading to false, error:', action.payload);
      })
      
      // Update category
      .addCase(updateAssetCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('updateAssetCategory.pending - setting loading to true');
      })
      .addCase(updateAssetCategory.fulfilled, (state, action) => {
        state.loading = false;
        console.log('updateAssetCategory.fulfilled called with:', action.payload);
        
        const index = state.categories.findIndex(cat => 
          cat.categoryId === action.payload.categoryId || cat.id === action.payload.categoryId
        );
        
        console.log('Found category index for update:', index);
        
        if (index !== -1) {
          state.categories[index] = { ...state.categories[index], ...action.payload };
          console.log('Updated category in state');
        } else {
          console.warn('Category not found for update:', action.payload.categoryId);
        }
      })
      .addCase(updateAssetCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log('updateAssetCategory.rejected - setting loading to false, error:', action.payload);
      })
      
      // Batch update categories
      .addCase(batchUpdateAssetCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('batchUpdateAssetCategories.pending - setting loading to true');
      })
      .addCase(batchUpdateAssetCategories.fulfilled, (state, action) => {
        state.loading = false;
        console.log('batchUpdateAssetCategories.fulfilled called with:', action.payload);
        
        if (Array.isArray(action.payload)) {
          state.categories = action.payload;
          console.log('Updated categories with batch data. Total categories:', state.categories.length);
        } else {
          console.warn('batchUpdateAssetCategories.fulfilled received non-array payload:', action.payload);
        }
      })
      .addCase(batchUpdateAssetCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log('batchUpdateAssetCategories.rejected - setting loading to false, error:', action.payload);
      })
      
      // Delete category
      .addCase(deleteAssetCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('deleteAssetCategory.pending - setting loading to true');
      })
      .addCase(deleteAssetCategory.fulfilled, (state, action) => {
        state.loading = false;
        console.log('deleteAssetCategory.fulfilled called with categoryId:', action.payload);
        
        const beforeCount = state.categories.length;
        state.categories = state.categories.filter(cat => 
          cat.categoryId !== action.payload && cat.id !== action.payload
        );
        const afterCount = state.categories.length;
        console.log(`Removed category from state. Before: ${beforeCount}, After: ${afterCount}`);
      })
      .addCase(deleteAssetCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log('deleteAssetCategory.rejected - setting loading to false, error:', action.payload);
      })
      
      // Add sub-category
      .addCase(addSubCategory.pending, (state) => {
        state.addingSubCategory = true;
        state.error = null;
        console.log('addSubCategory.pending - setting addingSubCategory to true');
      })
      .addCase(addSubCategory.fulfilled, (state, action) => {
        state.addingSubCategory = false;
        const { categoryId, subCategory } = action.payload;
        console.log('Adding subcategory to state:', { categoryId, subCategory });
        console.log('Current state categories before update:', state.categories.map(c => ({ id: c.id, categoryId: c.categoryId, name: c.name, subCategoriesCount: c.subCategories?.length || 0 })));
        
        // Find the category using multiple possible ID fields
        const category = state.categories.find(cat => 
          cat.categoryId === categoryId || 
          cat.id === categoryId ||
          cat.categoryId === subCategory.categoryId ||
          cat.id === subCategory.categoryId
        );
        
        console.log('Found category for subcategory addition:', category);
        
        if (category) {
          if (!category.subCategories) {
            category.subCategories = [];
          }
          
          console.log('Category subcategories before update:', category.subCategories);
          
          // Check if subcategory already exists to avoid duplicates
          const existingIndex = category.subCategories.findIndex(sub => 
            sub.subCategoryId === subCategory.subCategoryId || 
            sub.id === subCategory.subCategoryId ||
            sub.subCategoryId === subCategory.id ||
            sub.id === subCategory.id
          );
          
          if (existingIndex !== -1) {
            // Update existing subcategory
            category.subCategories[existingIndex] = {
              ...category.subCategories[existingIndex],
              ...subCategory
            };
            console.log('Updated existing subcategory in state');
          } else {
            // Add new subcategory
            category.subCategories.push(subCategory);
            console.log('Added new subcategory to state');
          }
          
          console.log('Updated category with subcategories:', category);
          console.log('Category subcategories after update:', category.subCategories);
        } else {
          console.warn('Category not found for subcategory addition:', categoryId, 'Available categories:', state.categories.map(c => ({ id: c.id, categoryId: c.categoryId, name: c.name })));
        }
      })
      .addCase(addSubCategory.rejected, (state, action) => {
        state.addingSubCategory = false;
        state.error = action.payload;
        console.log('addSubCategory.rejected - setting addingSubCategory to false, error:', action.payload);
      })
      
      // Update sub-category
      .addCase(updateSubCategory.pending, (state) => {
        state.updatingSubCategory = true;
        state.error = null;
        console.log('updateSubCategory.pending - setting updatingSubCategory to true');
      })
      .addCase(updateSubCategory.fulfilled, (state, action) => {
        state.updatingSubCategory = false;
        const { categoryId, subCategory } = action.payload;
        console.log('updateSubCategory.fulfilled called with:', { categoryId, subCategory });
        
        const category = state.categories.find(cat => 
          cat.categoryId === categoryId || cat.id === categoryId
        );
        
        console.log('Found category for subcategory update:', category);
        
        if (category && category.subCategories) {
          const index = category.subCategories.findIndex(sub => 
            sub.subCategoryId === subCategory.subCategoryId || sub.id === subCategory.subCategoryId
          );
          console.log('Found subcategory index for update:', index);
          
          if (index !== -1) {
            category.subCategories[index] = subCategory;
            console.log('Updated subcategory in state');
          } else {
            console.warn('Subcategory not found for update:', subCategory.subCategoryId);
          }
        } else {
          console.warn('Category or subcategories not found for update:', { categoryId, subCategoryId: subCategory.subCategoryId });
        }
      })
      .addCase(updateSubCategory.rejected, (state, action) => {
        state.updatingSubCategory = false;
        state.error = action.payload;
        console.log('updateSubCategory.rejected - setting updatingSubCategory to false, error:', action.payload);
      })
      
      // Delete sub-category
      .addCase(deleteSubCategory.pending, (state) => {
        state.deletingSubCategory = true;
        state.error = null;
        console.log('deleteSubCategory.pending - setting deletingSubCategory to true');
      })
      .addCase(deleteSubCategory.fulfilled, (state, action) => {
        state.deletingSubCategory = false;
        const { categoryId, subCategoryId } = action.payload;
        console.log('deleteSubCategory.fulfilled called with:', { categoryId, subCategoryId });
        
        const category = state.categories.find(cat => 
          cat.categoryId === categoryId || cat.id === categoryId
        );
        
        console.log('Found category for subcategory deletion:', category);
        
        if (category && category.subCategories) {
          const beforeCount = category.subCategories.length;
          category.subCategories = category.subCategories.filter(sub => 
            sub.subCategoryId !== subCategoryId && sub.id !== subCategoryId
          );
          const afterCount = category.subCategories.length;
          console.log(`Removed subcategory from state. Before: ${beforeCount}, After: ${afterCount}`);
        } else {
          console.warn('Category or subcategories not found for deletion:', { categoryId, subCategoryId });
        }
      })
      .addCase(deleteSubCategory.rejected, (state, action) => {
        state.deletingSubCategory = false;
        state.error = action.payload;
        console.log('deleteSubCategory.rejected - setting deletingSubCategory to false, error:', action.payload);
      })
      
      // Fetch sub-categories by category
      .addCase(fetchSubCategoriesByCategory.pending, (state) => {
        state.fetchingSubCategories = true;
        state.error = null;
        console.log('fetchSubCategoriesByCategory.pending - setting fetchingSubCategories to true');
      })
      .addCase(fetchSubCategoriesByCategory.fulfilled, (state, action) => {
        state.fetchingSubCategories = false;
        const { categoryId, subCategories } = action.payload;
        console.log('fetchSubCategoriesByCategory.fulfilled called with:', { categoryId, subCategories });
        
        // Update the category's subCategories in the state
        const category = state.categories.find(cat => 
          cat.categoryId === categoryId || cat.id === categoryId
        );
        
        if (category) {
          category.subCategories = subCategories;
          console.log('Updated category subcategories in state:', category);
        } else {
          console.warn('Category not found for subcategories update:', categoryId);
        }
      })
      .addCase(fetchSubCategoriesByCategory.rejected, (state, action) => {
        state.fetchingSubCategories = false;
        state.error = action.payload;
        console.log('fetchSubCategoriesByCategory.rejected - setting fetchingSubCategories to false, error:', action.payload);
      })
      
      // Fetch sub-category by ID
      .addCase(fetchSubCategoryById.pending, (state) => {
        state.fetchingSubCategory = true;
        state.error = null;
        console.log('fetchSubCategoryById.pending - setting fetchingSubCategory to true');
      })
      .addCase(fetchSubCategoryById.fulfilled, (state, action) => {
        state.fetchingSubCategory = false;
        const subCategory = action.payload;
        console.log('fetchSubCategoryById.fulfilled called with:', subCategory);
        
        // This could be used to update a specific subcategory in the state
        // For now, we'll just log it since it's a single subcategory fetch
        console.log('Fetched subcategory by ID:', subCategory);
      })
      .addCase(fetchSubCategoryById.rejected, (state, action) => {
        state.fetchingSubCategory = false;
        state.error = action.payload;
        console.log('fetchSubCategoryById.rejected - setting fetchingSubCategory to false, error:', action.payload);
      });
  },
});

export const { 
  clearError, 
  updateCategoryLocal, 
  updateSubCategoryLocal, 
  addSubCategoryLocal, 
  removeSubCategoryLocal 
} = assetCategorySlice.actions;

export default assetCategorySlice.reducer; 
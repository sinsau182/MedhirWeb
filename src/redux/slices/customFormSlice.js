import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import getConfig from 'next/config';
import { getItemFromSessionStorage } from './sessionStorageSlice';
const { publicRuntimeConfig } = getConfig();

const CUSTOM_FORM_API_BASE = publicRuntimeConfig.apiURL + "/api/asset-settings/custom-forms";

/**
 * CUSTOM FORM ENDPOINTS (Based on CustomFormController.java):
 * 
 * 1. GET /api/asset-settings/custom-forms
 *    - Get custom forms by company and optional category
 *    - Used by: fetchCustomForms()
 * 
 * 2. GET /api/asset-settings/custom-forms/{formId}
 *    - Get custom form by ID
 *    - Used by: fetchCustomFormById()
 * 
 * 3. POST /api/asset-settings/custom-forms
 *    - Create custom form
 *    - Used by: createCustomForm()
 * 
 * 4. PUT /api/asset-settings/custom-forms/{formId}
 *    - Update custom form
 *    - Used by: updateCustomForm()
 * 
 * 5. DELETE /api/asset-settings/custom-forms/{formId}
 *    - Delete custom form
 *    - Used by: deleteCustomForm()
 * 
 * 6. GET /api/asset-settings/custom-forms/{formId}/fields
 *    - Get form fields
 *    - Used by: fetchFormFields()
 * 
 * 7. POST /api/asset-settings/custom-forms/{formId}/fields
 *    - Add field to form
 *    - Used by: addFieldToForm()
 * 
 * 8. PUT /api/asset-settings/custom-forms/{formId}/fields/{fieldId}
 *    - Update field
 *    - Used by: updateField()
 * 
 * 9. DELETE /api/asset-settings/custom-forms/{formId}/fields/{fieldId}
 *    - Delete field
 *    - Used by: deleteField()
 * 
 * 10. PUT /api/asset-settings/custom-forms/{formId}/assign
 *     - Assign form to category
 *     - Used by: assignFormToCategory()
 * 
 * 11. DELETE /api/asset-settings/custom-forms/{formId}/assign
 *     - Unassign form from category
 *     - Used by: unassignFormFromCategory()
 * 
 * 12. GET /api/asset-settings/custom-forms/category/{categoryId}
 *     - Get forms by category
 *     - Used by: fetchFormsByCategory()
 * 
 * 13. GET /api/asset-settings/custom-forms/{formId}/preview
 *     - Preview form
 *     - Used by: previewForm()
 * 
 * 14. POST /api/asset-settings/custom-forms/{formId}/duplicate
 *     - Duplicate form
 *     - Used by: duplicateForm()
 * 
 * 15. PATCH /api/asset-settings/custom-forms/{formId}/toggle-status
 *     - Toggle form status
 *     - Used by: toggleFormStatus()
 * 
 * 16. POST /api/asset-settings/custom-forms/{formId}/submit
 *     - Submit form data
 *     - Used by: submitFormData()
 * 
 * 17. GET /api/asset-settings/custom-forms/{formId}/data/{assetId}
 *     - Get form data for asset
 *     - Used by: fetchFormDataForAsset()
 * 
 * 18. GET /api/asset-settings/custom-forms/data/asset/{assetId}
 *     - Get all form data for asset
 *     - Used by: fetchAllFormDataForAsset()
 * 
 * 19. DELETE /api/asset-settings/custom-forms/data/{dataId}
 *     - Delete form data
 *     - Used by: deleteFormData()
 */

// Fetch custom forms by company and optional category
export const fetchCustomForms = createAsyncThunk(
  'customForms/fetchAll',
  async ({ companyId, categoryId = null }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      let url = `${CUSTOM_FORM_API_BASE}?companyId=${companyId}`;
      if (categoryId) {
        url += `&categoryId=${categoryId}`;
      }
      
      const response = await axios.get(url, { headers });
      
      console.log('Fetch custom forms response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching custom forms:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch custom forms');
    }
  }
);

// Fetch custom form by ID
export const fetchCustomFormById = createAsyncThunk(
  'customForms/fetchById',
  async (formId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${CUSTOM_FORM_API_BASE}/${formId}`, { headers });
      
      console.log('Fetch custom form by ID response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching custom form by ID:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch custom form');
    }
  }
);

// Create custom form
export const createCustomForm = createAsyncThunk(
  'customForms/create',
  async (formDTO, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.post(CUSTOM_FORM_API_BASE, formDTO, { 
        headers: { 
          ...headers,
          'Content-Type': 'application/json'
        } 
      });
      
      console.log('Create custom form response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating custom form:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to create custom form');
    }
  }
);

// Update custom form
export const updateCustomForm = createAsyncThunk(
  'customForms/update',
  async ({ formId, formDTO }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.put(`${CUSTOM_FORM_API_BASE}/${formId}`, formDTO, { 
        headers: { 
          ...headers,
          'Content-Type': 'application/json'
        } 
      });
      
      console.log('Update custom form response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating custom form:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update custom form');
    }
  }
);

// Delete custom form
export const deleteCustomForm = createAsyncThunk(
  'customForms/delete',
  async (formId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.delete(`${CUSTOM_FORM_API_BASE}/${formId}`, { headers });
      
      console.log('Delete custom form response:', formId);
      return formId;
    } catch (error) {
      console.error('Error deleting custom form:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete custom form');
    }
  }
);

// Fetch form fields
export const fetchFormFields = createAsyncThunk(
  'customForms/fetchFields',
  async (formId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${CUSTOM_FORM_API_BASE}/${formId}/fields`, { headers });
      
      console.log('Fetch form fields response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching form fields:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch form fields');
    }
  }
);

// Add field to form
export const addFieldToForm = createAsyncThunk(
  'customForms/addField',
  async ({ formId, fieldDTO }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.post(`${CUSTOM_FORM_API_BASE}/${formId}/fields`, fieldDTO, { 
        headers: { 
          ...headers,
          'Content-Type': 'application/json'
        } 
      });
      
      console.log('Add field to form response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding field to form:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to add field to form');
    }
  }
);

// Update field
export const updateField = createAsyncThunk(
  'customForms/updateField',
  async ({ formId, fieldId, fieldDTO }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.put(`${CUSTOM_FORM_API_BASE}/${formId}/fields/${fieldId}`, fieldDTO, { 
        headers: { 
          ...headers,
          'Content-Type': 'application/json'
        } 
      });
      
      console.log('Update field response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating field:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update field');
    }
  }
);

// Delete field
export const deleteField = createAsyncThunk(
  'customForms/deleteField',
  async ({ formId, fieldId }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.delete(`${CUSTOM_FORM_API_BASE}/${formId}/fields/${fieldId}`, { headers });
      
      console.log('Delete field response:', { formId, fieldId });
      return { formId, fieldId };
    } catch (error) {
      console.error('Error deleting field:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete field');
    }
  }
);

// Batch field operations
export const addFieldsBatch = createAsyncThunk(
  'customForms/addFieldsBatch',
  async ({ formId, fieldDTOs }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.post(`${CUSTOM_FORM_API_BASE}/${formId}/fields/batch`, fieldDTOs, { 
        headers: { 
          ...headers,
          'Content-Type': 'application/json'
        } 
      });
      
      console.log('Add fields batch response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding fields batch:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to add fields batch');
    }
  }
);

export const updateFieldsBatch = createAsyncThunk(
  'customForms/updateFieldsBatch',
  async ({ formId, fieldDTOs }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.put(`${CUSTOM_FORM_API_BASE}/${formId}/fields/batch`, fieldDTOs, { 
        headers: { 
          ...headers,
          'Content-Type': 'application/json'
        } 
      });
      
      console.log('Update fields batch response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating fields batch:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update fields batch');
    }
  }
);

// Assign form to category
export const assignFormToCategory = createAsyncThunk(
  'customForms/assignToCategory',
  async ({ formId, categoryId }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.put(`${CUSTOM_FORM_API_BASE}/${formId}/assign`, { categoryId }, { 
        headers: { 
          ...headers,
          'Content-Type': 'application/json'
        } 
      });
      
      console.log('Assign form to category response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error assigning form to category:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to assign form to category');
    }
  }
);

// Unassign form from category
export const unassignFormFromCategory = createAsyncThunk(
  'customForms/unassignFromCategory',
  async (formId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.delete(`${CUSTOM_FORM_API_BASE}/${formId}/assign`, { headers });
      
      console.log('Unassign form from category response:', formId);
      return formId;
    } catch (error) {
      console.error('Error unassigning form from category:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to unassign form from category');
    }
  }
);

// Fetch forms by category
export const fetchFormsByCategory = createAsyncThunk(
  'customForms/fetchByCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${CUSTOM_FORM_API_BASE}/category/${categoryId}`, { headers });
      
      console.log('Fetch forms by category response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching forms by category:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch forms by category');
    }
  }
);

// Preview form
export const previewForm = createAsyncThunk(
  'customForms/preview',
  async (formId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${CUSTOM_FORM_API_BASE}/${formId}/preview`, { headers });
      
      console.log('Preview form response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error previewing form:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to preview form');
    }
  }
);

// Duplicate form
export const duplicateForm = createAsyncThunk(
  'customForms/duplicate',
  async (formId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.post(`${CUSTOM_FORM_API_BASE}/${formId}/duplicate`, {}, { headers });
      
      console.log('Duplicate form response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error duplicating form:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to duplicate form');
    }
  }
);

// Toggle form status
export const toggleFormStatus = createAsyncThunk(
  'customForms/toggleStatus',
  async (formId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.patch(`${CUSTOM_FORM_API_BASE}/${formId}/toggle-status`, {}, { headers });
      
      console.log('Toggle form status response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error toggling form status:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle form status');
    }
  }
);

// Submit form data
export const submitFormData = createAsyncThunk(
  'customForms/submitData',
  async ({ formId, assetId, createdBy, fieldData, files = {} }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const formData = new FormData();
      formData.append('assetId', assetId);
      formData.append('createdBy', createdBy);
      
      // Add field data
      Object.keys(fieldData).forEach(key => {
        formData.append(key, fieldData[key]);
      });
      
      // Add files
      Object.keys(files).forEach(key => {
        formData.append(key, files[key]);
      });
      
      const response = await axios.post(`${CUSTOM_FORM_API_BASE}/${formId}/submit`, formData, { 
        headers: { 
          ...headers,
          'Content-Type': 'multipart/form-data'
        } 
      });
      
      console.log('Submit form data response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error submitting form data:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to submit form data');
    }
  }
);

// Fetch form data for asset
export const fetchFormDataForAsset = createAsyncThunk(
  'customForms/fetchDataForAsset',
  async ({ formId, assetId }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${CUSTOM_FORM_API_BASE}/${formId}/data/${assetId}`, { headers });
      
      console.log('Fetch form data for asset response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching form data for asset:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch form data for asset');
    }
  }
);

// Fetch all form data for asset
export const fetchAllFormDataForAsset = createAsyncThunk(
  'customForms/fetchAllDataForAsset',
  async (assetId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${CUSTOM_FORM_API_BASE}/data/asset/${assetId}`, { headers });
      
      console.log('Fetch all form data for asset response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching all form data for asset:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all form data for asset');
    }
  }
);

// Delete form data
export const deleteFormData = createAsyncThunk(
  'customForms/deleteData',
  async (dataId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.delete(`${CUSTOM_FORM_API_BASE}/data/${dataId}`, { headers });
      
      console.log('Delete form data response:', dataId);
      return dataId;
    } catch (error) {
      console.error('Error deleting form data:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete form data');
    }
  }
);

const customFormSlice = createSlice({
  name: 'customForms',
  initialState: {
    forms: [],
    currentForm: null,
    formFields: [],
    formData: [],
    formPreview: null,
    loading: false,
    error: null,
    creatingForm: false,
    updatingForm: false,
    deletingForm: false,
    addingField: false,
    updatingField: false,
    deletingField: false,
    submittingData: false,
    previewingForm: false,
    duplicatingForm: false,
    togglingStatus: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentForm: (state) => {
      state.currentForm = null;
    },
    setCurrentForm: (state, action) => {
      state.currentForm = action.payload;
    },
    clearFormFields: (state) => {
      state.formFields = [];
    },
    clearFormData: (state) => {
      state.formData = [];
    },
    clearFormPreview: (state) => {
      state.formPreview = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch custom forms
      .addCase(fetchCustomForms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomForms.fulfilled, (state, action) => {
        state.loading = false;
        state.forms = action.payload;
      })
      .addCase(fetchCustomForms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch custom form by ID
      .addCase(fetchCustomFormById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomFormById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentForm = action.payload;
      })
      .addCase(fetchCustomFormById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create custom form
      .addCase(createCustomForm.pending, (state) => {
        state.creatingForm = true;
        state.error = null;
      })
      .addCase(createCustomForm.fulfilled, (state, action) => {
        state.creatingForm = false;
        if (action.payload) {
          state.forms.push(action.payload);
        }
      })
      .addCase(createCustomForm.rejected, (state, action) => {
        state.creatingForm = false;
        state.error = action.payload;
      })
      
      // Update custom form
      .addCase(updateCustomForm.pending, (state) => {
        state.updatingForm = true;
        state.error = null;
      })
      .addCase(updateCustomForm.fulfilled, (state, action) => {
        state.updatingForm = false;
        const index = state.forms.findIndex(form => form.id === action.payload.formId);
        if (index !== -1) {
          state.forms[index] = action.payload.form;
        }
        if (state.currentForm && state.currentForm.id === action.payload.formId) {
          state.currentForm = action.payload.form;
        }
      })
      .addCase(updateCustomForm.rejected, (state, action) => {
        state.updatingForm = false;
        state.error = action.payload;
      })
      
      // Delete custom form
      .addCase(deleteCustomForm.pending, (state) => {
        state.deletingForm = true;
        state.error = null;
      })
      .addCase(deleteCustomForm.fulfilled, (state, action) => {
        state.deletingForm = false;
        state.forms = state.forms.filter(form => form.id !== action.payload);
        if (state.currentForm && state.currentForm.id === action.payload) {
          state.currentForm = null;
        }
      })
      .addCase(deleteCustomForm.rejected, (state, action) => {
        state.deletingForm = false;
        state.error = action.payload;
      })
      
      // Fetch form fields
      .addCase(fetchFormFields.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormFields.fulfilled, (state, action) => {
        state.loading = false;
        state.formFields = action.payload;
      })
      .addCase(fetchFormFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add field to form
      .addCase(addFieldToForm.pending, (state) => {
        state.addingField = true;
        state.error = null;
      })
      .addCase(addFieldToForm.fulfilled, (state, action) => {
        state.addingField = false;
        if (action.payload.field) {
          state.formFields.push(action.payload.field);
        }
      })
      .addCase(addFieldToForm.rejected, (state, action) => {
        state.addingField = false;
        state.error = action.payload;
      })
      
      // Update field
      .addCase(updateField.pending, (state) => {
        state.updatingField = true;
        state.error = null;
      })
      .addCase(updateField.fulfilled, (state, action) => {
        state.updatingField = false;
        const index = state.formFields.findIndex(field => field.id === action.payload.fieldId);
        if (index !== -1 && action.payload.field) {
          state.formFields[index] = action.payload.field;
        }
      })
      .addCase(updateField.rejected, (state, action) => {
        state.updatingField = false;
        state.error = action.payload;
      })
      
      // Delete field
      .addCase(deleteField.pending, (state) => {
        state.deletingField = true;
        state.error = null;
      })
      .addCase(deleteField.fulfilled, (state, action) => {
        state.deletingField = false;
        state.formFields = state.formFields.filter(field => field.id !== action.payload.fieldId);
      })
      .addCase(deleteField.rejected, (state, action) => {
        state.deletingField = false;
        state.error = action.payload;
      })
      
      // Add fields batch
      .addCase(addFieldsBatch.pending, (state) => {
        state.addingField = true;
        state.error = null;
      })
      .addCase(addFieldsBatch.fulfilled, (state, action) => {
        state.addingField = false;
        if (action.payload.fields) {
          state.formFields.push(...action.payload.fields);
        }
      })
      .addCase(addFieldsBatch.rejected, (state, action) => {
        state.addingField = false;
        state.error = action.payload;
      })
      
      // Update fields batch
      .addCase(updateFieldsBatch.pending, (state) => {
        state.updatingField = true;
        state.error = null;
      })
      .addCase(updateFieldsBatch.fulfilled, (state, action) => {
        state.updatingField = false;
        // Update multiple fields - this would require more complex logic
        // For now, just refresh the fields list
      })
      .addCase(updateFieldsBatch.rejected, (state, action) => {
        state.updatingField = false;
        state.error = action.payload;
      })
      
      // Assign form to category
      .addCase(assignFormToCategory.pending, (state) => {
        state.updatingForm = true;
        state.error = null;
      })
      .addCase(assignFormToCategory.fulfilled, (state, action) => {
        state.updatingForm = false;
        const index = state.forms.findIndex(form => form.id === action.payload.formId);
        if (index !== -1 && action.payload.form) {
          state.forms[index] = action.payload.form;
        }
        if (state.currentForm && state.currentForm.id === action.payload.formId) {
          state.currentForm = action.payload.form;
        }
      })
      .addCase(assignFormToCategory.rejected, (state, action) => {
        state.updatingForm = false;
        state.error = action.payload;
      })
      
      // Unassign form from category
      .addCase(unassignFormFromCategory.pending, (state) => {
        state.updatingForm = true;
        state.error = null;
      })
      .addCase(unassignFormFromCategory.fulfilled, (state, action) => {
        state.updatingForm = false;
        // Update the form to remove category assignment
        const index = state.forms.findIndex(form => form.id === action.payload);
        if (index !== -1) {
          state.forms[index].categoryId = null;
        }
        if (state.currentForm && state.currentForm.id === action.payload) {
          state.currentForm.categoryId = null;
        }
      })
      .addCase(unassignFormFromCategory.rejected, (state, action) => {
        state.updatingForm = false;
        state.error = action.payload;
      })
      
      // Fetch forms by category
      .addCase(fetchFormsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.forms = action.payload;
      })
      .addCase(fetchFormsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Preview form
      .addCase(previewForm.pending, (state) => {
        state.previewingForm = true;
        state.error = null;
      })
      .addCase(previewForm.fulfilled, (state, action) => {
        state.previewingForm = false;
        state.formPreview = action.payload;
      })
      .addCase(previewForm.rejected, (state, action) => {
        state.previewingForm = false;
        state.error = action.payload;
      })
      
      // Duplicate form
      .addCase(duplicateForm.pending, (state) => {
        state.duplicatingForm = true;
        state.error = null;
      })
      .addCase(duplicateForm.fulfilled, (state, action) => {
        state.duplicatingForm = false;
        if (action.payload.form) {
          state.forms.push(action.payload.form);
        }
      })
      .addCase(duplicateForm.rejected, (state, action) => {
        state.duplicatingForm = false;
        state.error = action.payload;
      })
      
      // Toggle form status
      .addCase(toggleFormStatus.pending, (state) => {
        state.togglingStatus = true;
        state.error = null;
      })
      .addCase(toggleFormStatus.fulfilled, (state, action) => {
        state.togglingStatus = false;
        const index = state.forms.findIndex(form => form.id === action.payload.formId);
        if (index !== -1 && action.payload.form) {
          state.forms[index] = action.payload.form;
        }
        if (state.currentForm && action.payload.form) {
          state.currentForm = action.payload.form;
        }
      })
      .addCase(toggleFormStatus.rejected, (state, action) => {
        state.togglingStatus = false;
        state.error = action.payload;
      })
      
      // Submit form data
      .addCase(submitFormData.pending, (state) => {
        state.submittingData = true;
        state.error = null;
      })
      .addCase(submitFormData.fulfilled, (state, action) => {
        state.submittingData = false;
        if (action.payload.data) {
          state.formData.push(action.payload.data);
        }
      })
      .addCase(submitFormData.rejected, (state, action) => {
        state.submittingData = false;
        state.error = action.payload;
      })
      
      // Fetch form data for asset
      .addCase(fetchFormDataForAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormDataForAsset.fulfilled, (state, action) => {
        state.loading = false;
        // Update or add the form data
        const existingIndex = state.formData.findIndex(data => 
          data.formId === action.meta.arg.formId && data.assetId === action.meta.arg.assetId
        );
        if (existingIndex !== -1) {
          state.formData[existingIndex] = action.payload;
        } else {
          state.formData.push(action.payload);
        }
      })
      .addCase(fetchFormDataForAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch all form data for asset
      .addCase(fetchAllFormDataForAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFormDataForAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.formData = action.payload;
      })
      .addCase(fetchAllFormDataForAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete form data
      .addCase(deleteFormData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFormData.fulfilled, (state, action) => {
        state.loading = false;
        state.formData = state.formData.filter(data => data.id !== action.payload);
      })
      .addCase(deleteFormData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearCurrentForm, 
  setCurrentForm, 
  clearFormFields, 
  clearFormData, 
  clearFormPreview 
} = customFormSlice.actions;

export default customFormSlice.reducer; 
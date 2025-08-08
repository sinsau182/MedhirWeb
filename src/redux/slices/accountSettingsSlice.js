import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

// Async thunk to fetch account settings
export const fetchAccountSettings = createAsyncThunk(
    "accountSettings/fetchAccountSettings",
    async (companyId, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            
            const response = await fetch(`${publicRuntimeConfig.apiURL}/api/settings/account/company/${companyId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch account settings");
        }
    }
);

// Async thunk to create default account settings
export const createDefaultAccountSettings = createAsyncThunk(
    "accountSettings/createDefaultAccountSettings",
    async ({ companyId, customDefaults }, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            
            const response = await fetch(`${publicRuntimeConfig.apiURL}/api/settings/account/document-numbering/company/${companyId}/create-default`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(customDefaults || {})
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        
        } catch (error) {
            return rejectWithValue(error.message || "Failed to create default account settings");
        }
    }
);

// Async thunk to update account settings
export const updateAccountSettings = createAsyncThunk(
    "accountSettings/updateAccountSettings",
    async ({ companyId, settings }, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            
            const response = await fetch(`${publicRuntimeConfig.apiURL}/api/settings/account/company/${companyId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(settings)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        
        } catch (error) {
            return rejectWithValue(error.message || "Failed to update account settings");
        }
    }
);

// Async thunk to get next receipt number (generates and increments)
export const getNextReceiptNumberFromSettings = createAsyncThunk(
    "accountSettings/getNextReceiptNumber",
    async (companyId, { rejectWithValue, dispatch }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            
            const response = await fetch(`${publicRuntimeConfig.apiURL}/api/settings/account/document-numbering/company/${companyId}/generate-receipt-number`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // Document numbering settings not found, create default settings first
                    try {
                        await dispatch(createDefaultAccountSettings({ companyId })).unwrap();
                        // Retry the receipt number generation
                        const retryResponse = await fetch(`${publicRuntimeConfig.apiURL}/api/settings/account/document-numbering/company/${companyId}/generate-receipt-number`, {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        });
                        
                        if (!retryResponse.ok) {
                            throw new Error(`HTTP error! status: ${retryResponse.status}`);
                        }
                        
                        const retryData = await retryResponse.json();
                        return retryData;
                    } catch (createError) {
                        return rejectWithValue("Failed to create default settings: " + createError.message);
                    }
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            const data = await response.json();
            return data;
        
        } catch (error) {
            return rejectWithValue(error.message || "Failed to get next receipt number");
        }
    }
);

// Async thunk to preview next receipt number (no increment)
export const previewNextReceiptNumberFromSettings = createAsyncThunk(
    "accountSettings/previewNextReceiptNumber",
    async (companyId, { rejectWithValue, dispatch }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            
            const response = await fetch(`${publicRuntimeConfig.apiURL}/api/settings/account/document-numbering/company/${companyId}/preview-receipt-number`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // Document numbering settings not found, create default settings first
                    try {
                        await dispatch(createDefaultAccountSettings({ companyId })).unwrap();
                        // Retry the receipt number preview
                        const retryResponse = await fetch(`${publicRuntimeConfig.apiURL}/api/settings/account/document-numbering/company/${companyId}/preview-receipt-number`, {
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        });
                        
                        if (!retryResponse.ok) {
                            throw new Error(`HTTP error! status: ${retryResponse.status}`);
                        }
                        
                        const retryData = await retryResponse.json();
                        return retryData;
                    } catch (createError) {
                        return rejectWithValue("Failed to create default settings: " + createError.message);
                    }
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            const data = await response.json();
            return data;
        
        } catch (error) {
            return rejectWithValue(error.message || "Failed to preview next receipt number");
        }
    }
);

// Async thunk to get next invoice number (POST, increments)
export const getNextInvoiceNumberFromSettings = createAsyncThunk(
    "accountSettings/getNextInvoiceNumber",
    async (companyId, { rejectWithValue, dispatch }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            
            const response = await fetch(`${publicRuntimeConfig.apiURL}/api/settings/account/document-numbering/company/${companyId}/generate-invoice-number`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // Document numbering settings not found, create default settings first
                    try {
                        await dispatch(createDefaultAccountSettings({ companyId })).unwrap();
                        // Retry the invoice number generation
                        const retryResponse = await fetch(`${publicRuntimeConfig.apiURL}/api/settings/account/document-numbering/company/${companyId}/generate-invoice-number`, {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        });
                        
                        if (!retryResponse.ok) {
                            throw new Error(`HTTP error! status: ${retryResponse.status}`);
                        }
                        
                        const retryData = await retryResponse.json();
                        return retryData;
                    } catch (createError) {
                        return rejectWithValue("Failed to create default settings: " + createError.message);
                    }
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            const data = await response.json();
            return data;
        
        } catch (error) {
            return rejectWithValue(error.message || "Failed to get next invoice number");
        }
    }
);

// Async thunk to preview next invoice number (GET, no increment)
export const previewNextInvoiceNumberFromSettings = createAsyncThunk(
    "accountSettings/previewNextInvoiceNumber",
    async (companyId, { rejectWithValue, dispatch }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            
            const response = await fetch(`${publicRuntimeConfig.apiURL}/api/settings/account/document-numbering/company/${companyId}/preview-invoice-number`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // Document numbering settings not found, create default settings first
                    try {
                        await dispatch(createDefaultAccountSettings({ companyId })).unwrap();
                        // Retry the invoice number preview
                        const retryResponse = await fetch(`${publicRuntimeConfig.apiURL}/api/settings/account/document-numbering/company/${companyId}/preview-invoice-number`, {
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        });
                        
                        if (!retryResponse.ok) {
                            throw new Error(`HTTP error! status: ${retryResponse.status}`);
                        }
                        
                        const retryData = await retryResponse.json();
                        return retryData;
                    } catch (createError) {
                        return rejectWithValue("Failed to create default settings: " + createError.message);
                    }
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            const data = await response.json();
            return data;
        
        } catch (error) {
            return rejectWithValue(error.message || "Failed to preview next invoice number");
        }
    }
);

const accountSettingsSlice = createSlice({
    name: "accountSettings",
    initialState: {
        documentSettings: {
            logo: null,
            terms: 'Payment is due within 30 days of the invoice date.',
            invoicePrefix: 'INV-',
            invoiceStartNumber: 1001,
            invoiceCurrentNumber: 1001,
            poPrefix: 'PO-',
            poStartNumber: 1001,
            poCurrentNumber: 1001,
            receiptPrefix: 'RCPT-',
            receiptStartNumber: 1001,
            receiptCurrentNumber: 1001,
        },
        taxRates: [
            { id: 'gst5', name: 'GST 5%', rate: 5 },
            { id: 'gst12', name: 'GST 12%', rate: 12 },
            { id: 'gst18', name: 'GST 18%', rate: 18 },
        ],
        nextReceiptNumber: null,
        previewReceiptNumber: null,
        nextInvoiceNumber: null,
        previewInvoiceNumber: null,
        loading: false,
        error: null,
        lastUpdated: null
    },
    reducers: {
        clearAccountSettings: (state) => {
            state.documentSettings = {
                logo: null,
                terms: 'Payment is due within 30 days of the invoice date.',
                invoicePrefix: 'INV-',
                invoiceStartNumber: 1001,
                invoiceCurrentNumber: 1001,
                poPrefix: 'PO-',
                poStartNumber: 1001,
                poCurrentNumber: 1001,
                receiptPrefix: 'RCPT-',
                receiptStartNumber: 1001,
                receiptCurrentNumber: 1001,
            };
            state.taxRates = [
                { id: 'gst5', name: 'GST 5%', rate: 5 },
                { id: 'gst12', name: 'GST 12%', rate: 12 },
                { id: 'gst18', name: 'GST 18%', rate: 18 },
            ];
            state.loading = false;
            state.error = null;
            state.lastUpdated = null;
        },
        updateDocumentSettings: (state, action) => {
            state.documentSettings = { ...state.documentSettings, ...action.payload };
            state.lastUpdated = new Date().toISOString();
        },
        updateTaxRates: (state, action) => {
            state.taxRates = action.payload;
            state.lastUpdated = new Date().toISOString();
        },
        addTaxRate: (state, action) => {
            state.taxRates.push(action.payload);
            state.lastUpdated = new Date().toISOString();
        },
        removeTaxRate: (state, action) => {
            state.taxRates = state.taxRates.filter(tax => tax.id !== action.payload);
            state.lastUpdated = new Date().toISOString();
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch account settings
            .addCase(fetchAccountSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAccountSettings.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.documentSettings = {
                        ...state.documentSettings,
                        ...action.payload
                    };
                }
            })
            .addCase(fetchAccountSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create default account settings
            .addCase(createDefaultAccountSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createDefaultAccountSettings.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.documentSettings = {
                        ...state.documentSettings,
                        ...action.payload
                    };
                }
            })
            .addCase(createDefaultAccountSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update account settings
            .addCase(updateAccountSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAccountSettings.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.documentSettings = {
                        ...state.documentSettings,
                        ...action.payload
                    };
                }
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(updateAccountSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get next receipt number
            .addCase(getNextReceiptNumberFromSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getNextReceiptNumberFromSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.nextReceiptNumber = action.payload.nextReceiptNumber;
            })
            .addCase(getNextReceiptNumberFromSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Preview next receipt number
            .addCase(previewNextReceiptNumberFromSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
                    .addCase(previewNextReceiptNumberFromSettings.fulfilled, (state, action) => {
            state.loading = false;
            state.previewReceiptNumber = action.payload.nextReceiptNumber;
        })
        .addCase(previewNextReceiptNumberFromSettings.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        // Invoice numbering thunks
        .addCase(getNextInvoiceNumberFromSettings.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getNextInvoiceNumberFromSettings.fulfilled, (state, action) => {
            state.loading = false;
            state.nextInvoiceNumber = action.payload.nextInvoiceNumber;
        })
        .addCase(getNextInvoiceNumberFromSettings.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(previewNextInvoiceNumberFromSettings.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(previewNextInvoiceNumberFromSettings.fulfilled, (state, action) => {
            state.loading = false;
            state.previewInvoiceNumber = action.payload.nextInvoiceNumber;
        })
        .addCase(previewNextInvoiceNumberFromSettings.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    }
});

export const { 
    clearAccountSettings, 
    updateDocumentSettings, 
    updateTaxRates, 
    addTaxRate, 
    removeTaxRate 
} = accountSettingsSlice.actions;

export default accountSettingsSlice.reducer; 
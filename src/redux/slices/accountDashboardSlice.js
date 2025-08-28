import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPayments } from './paymentSlice';
import { fetchReceipts } from './receiptSlice';
import { fetchInvoices } from './invoiceSlice';
import { fetchBills } from './BillSlice';

export const fetchAccountDashboardData = createAsyncThunk(
  'accountDashboard/fetchAccountDashboardData',
  async (companyId, { dispatch, rejectWithValue }) => {
    try {
      // Fetch all data in parallel
      const [payments, receipts, invoices, bills] = await Promise.all([
        dispatch(fetchPayments(companyId)).unwrap(),
        dispatch(fetchReceipts(companyId)).unwrap(),
        dispatch(fetchInvoices(companyId)).unwrap(),
        dispatch(fetchBills(companyId)).unwrap(),
      ]);
      return { payments, receipts, invoices, bills };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard data');
    }
  }
);

const accountDashboardSlice = createSlice({
  name: 'accountDashboard',
  initialState: {
    payments: [],
    receipts: [],
    invoices: [],
    bills: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.payments;
        state.receipts = action.payload.receipts;
        state.invoices = action.payload.invoices;
        state.bills = action.payload.bills;
      })
      .addCase(fetchAccountDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default accountDashboardSlice.reducer;
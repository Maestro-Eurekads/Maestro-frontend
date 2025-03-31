import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import clientService from './clientService';

// Initial state
const initialState = {
  data: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  error: '',

  getCreateClientData: null,
  getCreateClientIsError: false,
  getCreateClientIsSuccess: false,
  getCreateClientIsLoading: false,
  getCreateClientMessage: '', 
};

// Create Client
export const createClient = createAsyncThunk('client/createClient', async (inputs, thunkAPI) => { 
  try {
    const response = await clientService.createClient(inputs);
    // After successful creation, fetch updated client list
    await thunkAPI.dispatch(getCreateClient());
    return response; 
  } catch (error: unknown) { 
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { response?: { data?: { error?: { details?: { errors?: any[] }; message?: string } } } }; 
      const errors:any = axiosError.response?.data?.error?.details?.errors || axiosError.response?.data?.error?.message || []; 
      return thunkAPI.rejectWithValue(errors);  
    }
    return thunkAPI.rejectWithValue(['An unknown error occurred']);
  }
});

// Get clients list
export const getCreateClient = createAsyncThunk('client/getCreateClient', async (data, thunkAPI) => {
  try {
    const response = await clientService.getCreateClient();
    return response;
  } catch (error) { 
    const errors = error.response?.data?.error?.details?.errors || error.response?.data?.error?.message || error.message || []; 
    return thunkAPI.rejectWithValue(errors);
  }
});

// Slice
export const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    reset: (state) => { // Debugging
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';

      state.getCreateClientIsLoading = false;
      state.getCreateClientIsSuccess = false;
      state.getCreateClientIsError = false;
      state.getCreateClientMessage = '';
    },
  },
  // Extra Reducers
  extraReducers: (builder) => {
    builder
      // Create Client
      .addCase(createClient.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.data = action.payload;
      })
      .addCase(createClient.rejected, (state, action: any) => {
        state.isLoading = false;
        state.isError = true;
        state.message = Array.isArray(action.payload)
          ? action.payload.join('\n')
          : JSON.stringify(action.payload);
        state.data = null;
      })

      // Get Create Client
      .addCase(getCreateClient.pending, (state) => {
        state.getCreateClientIsLoading = true;
      })
      .addCase(getCreateClient.fulfilled, (state, action: any) => {
        state.getCreateClientIsLoading = false;
        state.getCreateClientIsSuccess = true;
        state.getCreateClientData = action.payload;
      })
      .addCase(getCreateClient.rejected, (state, action:any) => {
        state.getCreateClientIsLoading = false;
        state.getCreateClientIsSuccess = false;
        state.getCreateClientIsError = true;
        state.getCreateClientMessage = action.payload;
      });
  },
});

export const { reset } = clientSlice.actions;
export default clientSlice.reducer;
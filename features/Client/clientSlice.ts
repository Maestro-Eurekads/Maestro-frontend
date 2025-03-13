import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import clientService from './clientService';
 
 
 
 

// Define the shape of your state
interface ClientState {
  data: any | null;
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  message: string;
  error: string;

 
  getCreateClientData: CreateClientResponse | null;  
  getCreateClientIsError: boolean;
  getCreateClientIsSuccess: boolean;
  getCreateClientIsLoading: boolean;
  getCreateClientMessage: string;
  getCreateClientError: string;
}

// Define expected API response type
interface CreateClientResponse {
  id: string;
  username: string;
  email: string;
}

// Initial state
const initialState: ClientState = {
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
  getCreateClientError: '',
};

// Create Client
export const createClient = createAsyncThunk<
  any, 
  any, 
  { rejectValue: string[] }
>('client/createClient', async (inputs, thunkAPI) => { 
  try {
    const response = await clientService.createClient(inputs);
    return response; 
		} catch (error: unknown) { 
			 if (typeof error === 'object' && error !== null && 'response' in error) {
					const axiosError = error as { response?: { data?: { error?: { details?: { errors?: any[] }; message?: string } } } }; 
      const errors:any = axiosError.response?.data?.error?.details?.errors || axiosError.response?.data?.error?.message || []; 
      return thunkAPI.rejectWithValue(errors);  
				}
			 }
    return thunkAPI.rejectWithValue(['An unknown error occurred']);
});

// Sign-up user
export const getCreateClient = createAsyncThunk<
  CreateClientResponse,
  any,
  { rejectValue: string[] }
>('client/getCreateClient', async (data, thunkAPI) => {
  try {
    const response = await clientService.getCreateClient(data);
    return response;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { response?: { data?: { error?: { details?: { errors?: any[] }; message?: string } } } };
					const errors = axiosError.response?.data?.error?.details?.errors || axiosError.response?.data?.error?.message || [];
					
					console.log('axiosError-axiosError',axiosError)
      
      const errorArray = Array.isArray(errors) ? errors : [errors];  
      const errorMessages = errorArray.map((err: { path?: string[]; message?: string }) => {
        const path = err.path?.join('.') || 'unknown';
        return `${path}${err.message ? `: ${err.message}` : ''}`;
      });

      return thunkAPI.rejectWithValue(errorMessages);
    }
    return thunkAPI.rejectWithValue(['An unknown error occurred']);
  }
});

// Slice
export const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    reset: (state) => {
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
    .addCase(createClient.fulfilled, (state, action: PayloadAction<any>) => {
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
      state.getCreateClientData = Array.isArray(action.payload)
        ? action.payload.join('\n')
        : JSON.stringify(action.payload);
    })
    .addCase(getCreateClient.rejected, (state, action: PayloadAction<string[] | undefined>) => {
      state.getCreateClientIsLoading = false;
      state.getCreateClientIsError = true;
      state.getCreateClientMessage = Array.isArray(action.payload)
        ? action.payload.join('\n')
        : JSON.stringify(action.payload);
      state.getCreateClientData = null;
    });
},

});

export const { reset } = clientSlice.actions;
export default clientSlice.reducer;
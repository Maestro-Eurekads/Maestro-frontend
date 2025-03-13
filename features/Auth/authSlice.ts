import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from './authService';

// Define the shape of your state
interface AuthState {
  data: LoginResponse | null;  
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  message: string;
  error: string;

  // Sign-up-specific state
  signUpData: SignUpResponse | null;  
  signUpIsError: boolean;
  signUpIsSuccess: boolean;
  signUpIsLoading: boolean;
  signUpMessage: string;
  signUpError: string;
}

interface LoginResponse {
    jwt: string;  
  token: string;  
  user: {
    data: string;
    id: string;
    username: string;
  };
}

interface SignUpResponse {
  id: string;
  username: string;
  email: string;
}

// Initial state
const initialState: AuthState = {
  data: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  error: '',

  signUpData: null,
  signUpIsError: false,
  signUpIsSuccess: false,
  signUpIsLoading: false,
  signUpMessage: '',
  signUpError: '',
};

// Define the shape of your payloads
interface LoginPayload {
  username: string;
  password: string;
}

interface SignUpPayload {
  username: string;
  email: string;
  password: string;
}

// Login user
export const login = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: string[] } // Reject with an array of error messages
>('auth/login', async (user: LoginPayload, thunkAPI) => {
  try {// @ts-expect-error error might not occur
    const response = await authService.login(user);
    return response;
     // @ts-expect-error error might not occur
  } catch (error: never) {
    // Extract errors from the response, if available
    const errors = error.response?.data?.error?.details?.errors || error.response?.data?.error?.message ||[]; 
     // Map errors into a user-friendly array of strings 
    const errorMessages = Array.isArray(errors)
      ? errors.map((err: { path?: string[]; message: string }) => {
          const path = err.path?.join('.') || 'unknown';
          return `${path}: ${err.message}`;
        })
      : ['An unknown error occurred'];

    // Reject with formatted error messages
    return thunkAPI.rejectWithValue(errorMessages);
  }
});


 

// Sign-up user
export const signUp = createAsyncThunk<
  SignUpResponse,
  SignUpPayload,
  { rejectValue: string[] } // Reject with an array of error messages
>('auth/signUp', async (data: SignUpPayload, thunkAPI) => {
  try {// @ts-expect-error error might not occur
    const response = await authService.signUp(data);
    return response;
    
    // @ts-expect-error error might not occur
  } catch (error: never) {   
    const errors =
    error.response?.data?.error?.details?.errors ||
    error.response?.data?.error?.message ||
      [];
     // Ensure errors is an array for safe mapping
  const errorArray = Array.isArray(errors) ? errors : [errors];  
    const errorMessages = errorArray.map((err: never) => {
    // @ts-expect-error error might not occur
      const path = err.path?.join('.') ||errors;
          // @ts-expect-error error might not occur
      return `${path}${err.message ? `: ${err.message}` : ''}`

    });

    return thunkAPI.rejectWithValue(errorMessages);
  }
});


// Slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';

      state.signUpIsLoading = false;
      state.signUpIsSuccess = false;
      state.signUpIsError = false;
      state.signUpMessage = '';

      
    },
    // Add logout functionality
    logout: (state) => { 
      state.data = null; // Clear user data
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.data = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.join('\n') || 'Failed to login';
        state.data = null;
      })

     // Sign-up
    .addCase(signUp.pending, (state) => {
      state.signUpIsLoading = true;
    })
    .addCase(signUp.fulfilled, (state, action: PayloadAction<SignUpResponse>) => {
      state.signUpIsLoading = false;
      state.signUpIsSuccess = true;
      state.signUpData = action.payload;
    })
    .addCase(signUp.rejected, (state, action: PayloadAction<string[] | undefined>) => {
      state.signUpIsLoading = false;
      state.signUpIsError = true; 
      state.signUpMessage = action.payload?.join('\n') || 'Failed to sign up';
      state.signUpData = null;
    });
  },
});

export const { reset, logout } = authSlice.actions;
export default authSlice.reducer;

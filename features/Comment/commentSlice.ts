import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import commentService from './commentService';

 
 
 
// Initial state
const initialState = {
  data: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  error: '',

 
};

// Create Comment
export const getComment:any = createAsyncThunk('comment/getComment', async (commentId, thunkAPI) => { 
  try {
    const response = await commentService.getComment(commentId);
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
 

// Slice
export const clientSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    reset: (state) => { // Debugging
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';

    
     
    },
  },
 // Extra Reducers
extraReducers: (builder) => {
  builder
    // Create Client
    .addCase(getComment.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(getComment.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.data = action?.payload?.data;
    })
    .addCase(getComment.rejected, (state, action: any) => {
      state.isLoading = false;
      state.isError = true;
      state.message = Array.isArray(action.payload)
        ? action.payload.join('\n')
        : JSON.stringify(action.payload);
      state.data = null;
    })

    
},

});

export const { reset } = clientSlice.actions;
export default clientSlice.reducer;
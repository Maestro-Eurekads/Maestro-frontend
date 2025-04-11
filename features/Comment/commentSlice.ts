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

  dataApprove: null,
  isErrorApprove: false,
  isSuccessApprove: false,
  isLoadingApprove: false,
  messageApprove: '',
  errorApprove: '',
 
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

// Create Comment
export const getSignedApproval:any = createAsyncThunk('comment/getSignedApproval', async (id: string | number, thunkAPI) => { 
  try {
    const response = await commentService.getSignedApproval(id);
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

     state.isLoadingApprove = false;
      state.isSuccessApprove = false;
      state.isErrorApprove = false;
      state.messageApprove = '';
     
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

    // Get Signed Approval
     .addCase(getSignedApproval.pending, (state) => {
      state.isLoadingApprove = true;
    })
    .addCase(getSignedApproval.fulfilled, (state, action) => {
      state.isLoadingApprove = false;
      state.isSuccessApprove = true;
      state.dataApprove = action?.payload?.data;
    })
    .addCase(getSignedApproval.rejected, (state, action: any) => {
      state.isLoadingApprove = false;
      state.isErrorApprove = true;
      state.messageApprove = Array.isArray(action.payload)
        ? action.payload.join('\n')
        : JSON.stringify(action.payload);
      state.dataApprove = null;
    })
},

});

export const { reset } = clientSlice.actions;
export default clientSlice.reducer;
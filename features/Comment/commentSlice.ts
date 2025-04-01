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

  // getCreateClientData: null,
  // getCreateClientIsError: false,
  // getCreateClientIsSuccess: false,
  // getCreateClientIsLoading: false,
  // getCreateClientMessage: '', 
};

// Create Comment
export const getComment = createAsyncThunk('comment/getComment', async (inputs, thunkAPI) => { 
  try {
    const response = await commentService.getComment(inputs);
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
// export const getCreateClient = createAsyncThunk('client/getCreateClient', async (data, thunkAPI) => {
//   try {
//     const response = await commentService.getCreateClient();
//     return response;
//   } catch (error) { 
//       const errors = error.response?.data?.error?.details?.errors || error.response?.data?.error?.message || error.message || []; 
	 
//     return thunkAPI.rejectWithValue( errors);
//   }
// });

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

      // state.getCreateClientIsLoading = false;
      // state.getCreateClientIsSuccess = false;
      // state.getCreateClientIsError = false;
      // state.getCreateClientMessage = '';
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

    // Get Create Client
    // .addCase(getCreateClient.pending, (state) => {
    //   state.getCreateClientIsLoading = true;
    // })
    // .addCase(getCreateClient.fulfilled, (state, action: any) => {
    //   state.getCreateClientIsLoading = false;
    //   state.getCreateClientIsSuccess = true;
    //   state.getCreateClientData = action.payload
    // })
    // .addCase(getCreateClient.rejected, (state, action:any) => {
    //   state.getCreateClientIsLoading = false;
    //    state.getCreateClientIsSuccess = false;
    //   state.getCreateClientIsError = true;
    //   state.getCreateClientMessage = action.payload 
    // });
},

});

export const { reset } = clientSlice.actions;
export default clientSlice.reducer;
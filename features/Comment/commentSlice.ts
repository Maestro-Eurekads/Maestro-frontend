import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import commentService from "./commentService";
import { getServerSession } from "next-auth";
import { authOptions } from "utils/auth";

// Initial state
const initialState = {
  data: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
  error: "",

  dataApprove: null,
  isErrorApprove: false,
  isSuccessApprove: false,
  isLoadingApprove: false,
  messageApprove: "",
  errorApprove: "",

  generalComments: null,
  isLoadingGeneralComments: false,
  isSuccessGeneralComments: false,
  isErrorGeneralComments: false,
  messageGeneralComments: "",

  campaignDetails: null,
  isLoadingCampaign: false,
  isSuccessCampaign: false,
  isErrorCampaign: false,
  messageCampaign: "",
};

// Create Comment
export const getComment: any = createAsyncThunk(
  "comment/getComment",
  async ({ commentId, jwt }: { commentId: string; jwt: string }, thunkAPI) => {
     
    try {
      const response = await commentService.getComment(commentId, jwt);
      return response;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: {
              error?: { details?: { errors?: any[] }; message?: string };
            };
          };
        };
        const errors: any =
          axiosError.response?.data?.error?.details?.errors ||
          axiosError.response?.data?.error?.message ||
          [];
        return thunkAPI.rejectWithValue(errors);
      }
    }
    return thunkAPI.rejectWithValue(["An unknown error occurred"]);
  }
);

// Create Comment
export const getSignedApproval: any = createAsyncThunk(
  "comment/getSignedApproval",
  async ({ id, jwt }: { id: string | number; jwt: string }, thunkAPI) => {
    try {
      const response = await commentService.getSignedApproval(id, jwt);
      return response;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: {
              error?: { details?: { errors?: any[] }; message?: string };
            };
          };
        };
        const errors: any =
          axiosError.response?.data?.error?.details?.errors ||
          axiosError.response?.data?.error?.message ||
          [];
        return thunkAPI.rejectWithValue(errors);
      }
    }
    return thunkAPI.rejectWithValue(["An unknown error occurred"]);
  }
);

export const getGeneralComment: any = createAsyncThunk(
  "comment/getGeneralComment",
  async ({ commentId, jwt }: { commentId: string; jwt: string }, thunkAPI) => {
    try {
      const response = await commentService.getGeneralComment(commentId, jwt);
      return response;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: {
              error?: { details?: { errors?: any[] }; message?: string };
            };
          };
        };
        const errors: any =
          axiosError.response?.data?.error?.details?.errors ||
          axiosError.response?.data?.error?.message ||
          [];
        return thunkAPI.rejectWithValue(errors);
      }
    }
    return thunkAPI.rejectWithValue(["An unknown error occurred"]);
  }
);

// Get Campaign By ID
export const getCampaignById: any = createAsyncThunk(
  "comment/getCampaignById",
  async (
    {
      clientId,
      campaignId,
      jwt,
    }: { clientId: string; campaignId: string; jwt: string },
    thunkAPI
  ) => {
    try {
      const response = await commentService.getCampaignById(
        clientId,
        campaignId,
        jwt
      );
      return response;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: {
              error?: { details?: { errors?: any[] }; message?: string };
            };
          };
        };
        const errors: any =
          axiosError.response?.data?.error?.details?.errors ||
          axiosError.response?.data?.error?.message ||
          [];
        return thunkAPI.rejectWithValue(errors);
      }
    }
    return thunkAPI.rejectWithValue(["An unknown error occurred"]);
  }
);

// Slice
export const clientSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    reset: (state) => {
      // Debugging
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
      state.data = null;

      state.isLoadingApprove = false;
      state.isSuccessApprove = false;
      state.isErrorApprove = false;
      state.messageApprove = "";

      state.isLoadingGeneralComments = false;
      state.isSuccessGeneralComments = false;
      state.isErrorGeneralComments = false;
      state.messageGeneralComments = "";

      state.isLoadingCampaign = false;
      state.isSuccessCampaign = false;
      state.isErrorCampaign = false;
      state.messageCampaign = "";
      state.campaignDetails = null;
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
          ? action.payload.join("\n")
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
          ? action.payload.join("\n")
          : JSON.stringify(action.payload);
        state.dataApprove = null;
      })

      // Get General Comments
      .addCase(getGeneralComment.pending, (state) => {
        state.isLoadingGeneralComments = true;
      })
      .addCase(getGeneralComment.fulfilled, (state, action) => {
        state.isLoadingGeneralComments = false;
        state.isSuccessGeneralComments = true;
        state.generalComments = action?.payload?.data;
      })
      .addCase(getGeneralComment.rejected, (state, action: any) => {
        state.isLoadingGeneralComments = false;
        state.isErrorGeneralComments = true;
        state.messageGeneralComments = Array.isArray(action.payload)
          ? action.payload.join("\n")
          : JSON.stringify(action.payload);
        state.generalComments = null;
      })

      // Get Campaign by ID
      .addCase(getCampaignById.pending, (state) => {
        state.isLoadingCampaign = true;
      })
      .addCase(getCampaignById.fulfilled, (state, action) => {
        state.isLoadingCampaign = false;
        state.isSuccessCampaign = true;
        state.campaignDetails = action?.payload?.data;
      })
      .addCase(getCampaignById.rejected, (state, action: any) => {
        state.isLoadingCampaign = false;
        state.isErrorCampaign = true;
        state.messageCampaign = Array.isArray(action.payload)
          ? action.payload.join("\n")
          : JSON.stringify(action.payload);
        state.campaignDetails = null;
      });
  },
});

export const { reset } = clientSlice.actions;
export default clientSlice.reducer;

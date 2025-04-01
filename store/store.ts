 
import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../features/Auth/authSlice";   
import clientSlice  from "../features/Client/clientSlice"; 
import commentSlice from "features/Comment/commentSlice";
 

export const store = configureStore({
  reducer: {
    auth: authSlice,
    client:  clientSlice,
    comment:  commentSlice,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

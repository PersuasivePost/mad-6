import { configureStore } from "@reduxjs/toolkit";
import eventReducer from "./eventSlice";

// Configure the Redux store
export const store = configureStore({
  reducer: {
    events: eventReducer,
  },
});

// Export types for TypeScript support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

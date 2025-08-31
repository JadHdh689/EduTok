// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { type AuthState } from '../features/auth/authSlice';

// Explicit root state so selectors never see `unknown`
export interface RootState {
  auth: AuthState;
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type AppDispatch = typeof store.dispatch;

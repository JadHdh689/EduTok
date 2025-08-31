// src/components/features/auth/authSlice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { AuthAPI, tokenStore, type Tokens } from '../../services/api';

export interface AuthState {
  tokens: Tokens | null;
  loading: boolean;
  error?: string;
}

const initialState: AuthState = {
  tokens: tokenStore.load(),
  loading: false,
};

export const signInThunk = createAsyncThunk<
  Tokens,
  { username: string; password: string },
  { rejectValue: string }
>('auth/signIn', async (payload, { rejectWithValue }) => {
  try {
    const t = await AuthAPI.signIn(payload.username, payload.password);
    return t;
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || e.message || 'Login failed');
  }
});

export const signOutThunk = createAsyncThunk('auth/signOut', async () => {
  try {
    await AuthAPI.signOut();
  } catch {
    /* ignore */
  }
  tokenStore.save(null);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<Tokens | null>) {
      state.tokens = action.payload;
      tokenStore.save(action.payload);
    },
    setError(state, action: PayloadAction<string | undefined>) {
      state.error = action.payload;
    },
  },
  extraReducers: (b) => {
    b.addCase(signInThunk.pending, (s) => {
      s.loading = true;
      s.error = undefined;
    })
      .addCase(signInThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.tokens = a.payload;
      })
      .addCase(signInThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = (a.payload as string) || 'Login failed';
      })
      .addCase(signOutThunk.fulfilled, (s) => {
        s.tokens = null;
        s.error = undefined;
      });
  },
});

export const { setTokens, setError } = authSlice.actions;
export default authSlice.reducer;

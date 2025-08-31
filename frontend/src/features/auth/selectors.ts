import type { RootState } from '../../store';

export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthed = (state: RootState) => Boolean(state.auth.tokens);

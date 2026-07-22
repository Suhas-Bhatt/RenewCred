import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Admin } from "@/lib/types";

// Design decision: the JWT access token lives only in Redux memory (never
// localStorage) to limit XSS blast radius; the refresh token is an httpOnly
// cookie the browser sends automatically. On a hard reload, the app calls
// /auth/refresh once to re-hydrate the access token from that cookie.
interface AuthState {
  admin: Admin | null;
  accessToken: string | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
}

export const initialAuthState: AuthState = {
  admin: null,
  accessToken: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ admin: Admin; accessToken: string }>) {
      state.admin = action.payload.admin;
      state.accessToken = action.payload.accessToken;
      state.status = "authenticated";
    },
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      state.status = "authenticated";
    },
    setUnauthenticated(state) {
      state.status = "unauthenticated";
    },
    logout(state) {
      state.admin = null;
      state.accessToken = null;
      state.status = "unauthenticated";
    },
  },
});

export const { setCredentials, setAccessToken, setUnauthenticated, logout } = authSlice.actions;
export default authSlice.reducer;

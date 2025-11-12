
import { createSlice } from '@reduxjs/toolkit';

// Safe localStorage reader: try JSON.parse, but return raw string when parsing fails
const safeLocalGet = (key) => {
  try {
    const v = localStorage.getItem(key);
    if (v === null || typeof v === 'undefined') return null;
    try { return JSON.parse(v); } catch { return v; }
  } catch (err) {
    return null;
  }
};

const initialState = {
  user: safeLocalGet('user'),
  token: safeLocalGet('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", JSON.stringify(action.payload));
    },
      
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      localStorage.clear();
    },
  },
});

export const { setUser, setToken, clearAuth } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export default authSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { disconnectSocket } from "../../utils/socket";

const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

const normalizeUser = (user) => {
  if (!user) return null;

  return {
    ...user,
    _id: user._id || user.id,
    id: user.id || user._id,
  };
};

const initialState = {
  user: storedUser ? normalizeUser(JSON.parse(storedUser)) : null,
  token: storedToken || null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const login = createAsyncThunk("auth/login", async (userData, thunkAPI) => {
  try {
    const response = await api.post("/auth/login", userData);

    if (!response.data?.token) {
      return thunkAPI.rejectWithValue("No token received from server");
    }

    const cleanToken = response.data.token.trim();
    const user = normalizeUser(response.data.user);

    localStorage.setItem("token", cleanToken);
    localStorage.setItem("user", JSON.stringify(user));

    return {
      token: cleanToken,
      user,
    };
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getMe = createAsyncThunk("auth/getMe", async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return thunkAPI.rejectWithValue("No active session");
    }

    const response = await api.get("/auth/me");
    const user = normalizeUser(response.data.data);
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (error) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    const message =
      error.response?.data?.error || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  disconnectSocket();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    setUser: (state, action) => {
      state.user = normalizeUser(action.payload);
      localStorage.setItem("user", JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message =
          action.payload.message ||
          "Registration successful. Waiting for admin approval.";
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.token = null;
      })
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.token = localStorage.getItem("token");
      })
      .addCase(getMe.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isSuccess = false;
      });
  },
});

export const { reset, setUser } = authSlice.actions;
export default authSlice.reducer;

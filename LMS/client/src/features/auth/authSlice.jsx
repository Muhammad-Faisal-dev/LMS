import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Get user from localStorage
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

const initialState = {
  user: user || null,
  token: token || null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// Register user
export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          (error.response.data.error || error.response.data.message)) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const response = await api.post("/auth/login", userData);

      if (response.data && response.data.token) {
        // Ensure token doesn't have any whitespace or formatting issues
        const cleanToken = response.data.token.trim();
        localStorage.setItem("token", cleanToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return {
          user: response.data.user,
          token: cleanToken,
        };
      }
      return thunkAPI.rejectWithValue("No token received from server");
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          (error.response.data.error || error.response.data.message)) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get current user
export const getMe = createAsyncThunk("auth/getMe", async (_, thunkAPI) => {
  try {
    try {
      // Try to fetch user from API
      const response = await api.get("/auth/me");
      return response.data.data;
    } catch (apiError) {
      console.log(
        "API Error:",
        apiError.response ? apiError.response.data : apiError.message
      );

      // If token is expired or invalid, clear local storage
      if (apiError.response && apiError.response.status === 401) {
        console.log("Authentication failed - clearing credentials");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }

      // If the endpoint returns 404, use stored user data
      if (apiError.response && apiError.response.status === 404) {
        console.log("API endpoint not found, using stored user data");
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (storedUser) {
          return storedUser;
        }
      }

      // Rethrow for other errors
      throw apiError;
    }
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.error) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Logout user
export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
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
      })
      .addCase(getMe.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;

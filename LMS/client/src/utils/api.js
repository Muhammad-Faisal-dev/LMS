import axios from "axios";

// Create an instance of axios with default config
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to automatically add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for common error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration or invalid token
    if (error.response && error.response.status === 401) {
      console.warn("Authentication token invalid or expired");

      // Clear authentication data if unauthorized
      if (
        error.response.data.message === "Invalid token" ||
        error.response.data.message === "Token expired"
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Reload the page to reset application state
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

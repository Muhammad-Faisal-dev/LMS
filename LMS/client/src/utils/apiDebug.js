import axios from "axios";

// Create an instance of axios with default config
const apiDebug = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor with logging
apiDebug.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    console.group(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    console.log("Request headers:", config.headers);

    if (config.data) {
      console.log("Request data:", config.data);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Using auth token from localStorage");
    } else {
      console.warn("No auth token available");
    }

    console.groupEnd();

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor with logging
apiDebug.interceptors.response.use(
  (response) => {
    console.group(
      `API Response: ${response.config.method.toUpperCase()} ${
        response.config.url
      }`
    );
    console.log("Status:", response.status);
    console.log("Response data:", response.data);
    console.groupEnd();
    return response;
  },
  (error) => {
    console.group(
      `API Error: ${error.config?.method?.toUpperCase() || "UNKNOWN"} ${
        error.config?.url || "UNKNOWN"
      }`
    );
    console.log("Error status:", error.response?.status);
    console.log("Error data:", error.response?.data);
    console.log("Error details:", error);
    console.groupEnd();
    return Promise.reject(error);
  }
);

export default apiDebug;

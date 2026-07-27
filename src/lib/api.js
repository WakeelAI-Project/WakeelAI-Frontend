import axios from "axios";

// Local storage of the auth token in-memory to prevent circular dependencies
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

// Create the shared Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Automatically attach the token if it exists
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If backend returns 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Create a friendly error message for authentication failures
      const customError = new Error("Invalid email or password");
      customError.status = 401;
      customError.originalError = error;
      return Promise.reject(customError);
    }
    return Promise.reject(error);
  }
);

export default api;

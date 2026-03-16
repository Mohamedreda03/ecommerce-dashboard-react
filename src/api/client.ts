import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";

export const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true, // Needed for cookie-based refresh token
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach Authorization: Bearer <token>
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 refresh flow
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/login"
    ) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint directly using a new axios instance or plain axios
        // to prevent infinite interceptor loops if /auth/refresh itself returns 401
        const res = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          },
        );

        const newAccessToken = res.data.accessToken;
        useAuthStore.getState().setTokens(newAccessToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // On second 401 (refresh failed), clear store and redirect
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Surface a structured error object on non-2xx responses
    return Promise.reject(error.response?.data || error);
  },
);

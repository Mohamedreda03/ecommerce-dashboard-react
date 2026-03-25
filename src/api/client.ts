import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";

export const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true, // Needed for HTTP-only refresh cookies from NestJS
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

    // Trigger refresh on 401, but NOT on the dashboard login route itself
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/dashboard/login")
    ) {
      originalRequest._retry = true;

      try {
        // Backend reads the HTTP-only refresh cookie automatically
        const res = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = res.data.accessToken;
        useAuthStore.getState().setTokens(newAccessToken);

        // Retry with the fresh token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // On refresh failure, clear store and force login
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error.response?.data || error);
  },
);

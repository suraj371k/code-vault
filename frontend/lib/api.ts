import axios, { AxiosHeaders, InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Request interceptor: attach JWT from localStorage on every request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");

      if (token) {
        if (!config.headers) {
          config.headers = new AxiosHeaders();
        }
        (config.headers as AxiosHeaders).set(
          "Authorization",
          `Bearer ${token}`
        );
      } else {
        console.warn("API Request without token:", config.url);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: on 401 clear stale token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const isAuthPage =
          window.location.pathname.includes("/login") ||
          window.location.pathname.includes("/signup") ||
          window.location.pathname.includes("/callback");

        // Only clear + redirect if we're NOT already on an auth page
        if (!isAuthPage) {
          localStorage.removeItem("auth_token");
          window.location.href = "/login?error=session_expired";
        }
      }
    }
    return Promise.reject(error);
  }
);

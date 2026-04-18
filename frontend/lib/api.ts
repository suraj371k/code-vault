import axios, { AxiosHeaders, InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Paths that are expected to be called without a token (public endpoints).
// Requests to these paths will NOT log a warning when no token is present.
const PUBLIC_PATHS = ["/api/auth/login", "/api/auth/signup", "/api/auth/google"];

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
        // Only warn for protected endpoints — suppress noise for public ones
        const isPublic = PUBLIC_PATHS.some((p) =>
          config.url?.includes(p)
        );
        if (!isPublic) {
          console.warn("API Request without token:", config.url);
        }
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

        const isPaymentPage =
          window.location.pathname.includes("/success") ||
          window.location.pathname.includes("/cancel");

        // Only clear + redirect if we're NOT already on an auth or payment page
        if (!isAuthPage && !isPaymentPage) {
          localStorage.removeItem("auth_token");
          window.location.href = "/login?error=session_expired";
        }
      }
    }
    return Promise.reject(error);
  }
);

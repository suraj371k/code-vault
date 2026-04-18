import axios, { AxiosHeaders, InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");

      if (token) {
        if (!config.headers) {
          config.headers = new AxiosHeaders();
        }

        (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
        
        // Debug log in non-production
        if (process.env.NODE_ENV !== "production") {
          console.log("API Request with token:", {
            url: config.url,
            hasToken: !!token,
            tokenPreview: token.substring(0, 20) + "...",
          });
        }
      } else {
        console.warn("API Request without token:", config.url);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("401 Unauthorized - Token may be invalid or expired");
      
      // Log for debugging
      const token = localStorage.getItem("auth_token");
      console.error("Current token exists:", !!token);
      
      // Optionally clear token and redirect to login
      // Uncomment if you want automatic logout on 401
      // if (typeof window !== "undefined") {
      //   localStorage.removeItem("auth_token");
      //   window.location.href = "/login?error=session_expired";
      // }
    }
    return Promise.reject(error);
  }
);

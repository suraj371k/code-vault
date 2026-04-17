import axios, { AxiosHeaders } from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");

    if (token) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }

      (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
    }
  }

  return config;
});

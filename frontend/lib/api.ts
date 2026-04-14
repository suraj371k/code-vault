import axios from "axios";

export const api = axios.create({
  baseURL: "https://code-snippet-backend-1m8g.onrender.com",
  withCredentials: true,
});

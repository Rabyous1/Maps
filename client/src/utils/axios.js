import axios from "axios";

export const axiosGetJson = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  credentials: "include",
});

export const axiosPrivateFile = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  credentials: "include",
});

export const axiosGetFile = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
  withCredentials: true,
  credentials: "include",
});

axiosGetFile.interceptors.request.use(
  (config) => {
    config.responseType = "blob";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

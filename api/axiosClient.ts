import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { Platform } from "react-native";
import * as Device from "expo-device";
// LƯU Ý: Hãy chắc chắn 5000 là cổng HTTP (không phải HTTPS) của BE
// const BASE_URL = "http://192.168.1.6:5027/api";
// const BASE_URL = "http://192.168.1.18:5027/api"; // Đổi từ 1.6 thành 1.18

const BASE_URL =
  Platform.OS === "android" && !Device.isDevice
    ? "http://10.0.2.2:5027/api" // Emulator Android
    : "http://192.168.1.18:5027/api"; // Máy thật

console.log("➡️ BASE_URL:", BASE_URL);
console.log("📱 Physical Device:", Device.isDevice);

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Api-Key": "iRASRAG_9fB7E2cpqM4eVxLZK8hR3B0D6S1WJmE", // Thêm dòng này để BE không chặn
  },
});

axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: any) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync(
          STORAGE_KEYS.REFRESH_TOKEN,
        );
        const res = await axios.post(
          `${BASE_URL}/auth/refresh-token?refreshToken=${refreshToken}`,
        );
        if (res.data.token) {
          const { accessToken, refreshToken: newRefreshToken } = res.data.token;
          await SecureStore.setItemAsync(
            STORAGE_KEYS.ACCESS_TOKEN,
            accessToken,
          );
          await SecureStore.setItemAsync(
            STORAGE_KEYS.REFRESH_TOKEN,
            newRefreshToken,
          );
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return axiosClient(originalRequest);
        }
      } catch (refreshError: any) {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;

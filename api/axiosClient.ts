import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { Platform } from "react-native";
import * as Device from "expo-device";

// ============================
// BASE_URL
// ============================
const BASE_URL =
  Platform.OS === "android" && !Device.isDevice
    ? "http://10.0.2.2:5027/api"
    : "http://192.168.1.105:5027/api";

console.log("====================================");
console.log("📱 Device Info:");
console.log("➡️ Platform:", Platform.OS);
console.log("➡️ Physical Device:", Device.isDevice);
console.log("➡️ Using BASE_URL:", BASE_URL);
console.log("====================================\n");

// ============================
// AXIOS INSTANCE
// ============================
const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Api-Key": "iRASRAG_9fB7E2cpqM4eVxLZK8hR3B0D6S1WJmE",
  },
});

// ============================
// REQUEST INTERCEPTOR (LOG REQUEST)
// ============================
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);

    console.log("\n🔵 [REQUEST START]");
    console.log("➡️ URL:", BASE_URL + config.url);
    console.log("➡️ METHOD:", config.method?.toUpperCase());
    console.log("➡️ X-Api-Key:", config.headers["X-Api-Key"]);
    console.log("➡️ Authorization:", token ? "Bearer " + token : "NO TOKEN");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("🔵 [REQUEST END]\n");
    return config;
  },
  (error) => {
    console.log("❌ Request Interceptor Error:", error);
    return Promise.reject(error);
  },
);

// ============================
// RESPONSE INTERCEPTOR (LOG RESPONSE)
// ============================
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("🟢 [RESPONSE SUCCESS]", response.config.url);
    console.log("➡️ STATUS:", response.status);
    return response;
  },
  async (error: any) => {
    const originalRequest = error.config;

    console.log("\n🔴 [RESPONSE ERROR]");
    console.log("❌ URL:", originalRequest?.url);
    console.log("❌ STATUS:", error.response?.status);
    console.log("❌ RESPONSE DATA:", error.response?.data);

    // ============================
    // HANDLE 401 -> REFRESH TOKEN
    // ============================
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("🟡 401 DETECTED → TRYING REFRESH TOKEN...");
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(
          STORAGE_KEYS.REFRESH_TOKEN,
        );

        console.log("➡️ Refresh Token:", refreshToken);

        const res = await axios.post(
          `${BASE_URL}/auth/refresh-token?refreshToken=${refreshToken}`,
        );

        console.log("🟢 REFRESH RESPONSE:", res.data);

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

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          console.log("🟢 REFRESH TOKEN SUCCESS — RETRY ORIGINAL REQUEST\n");

          return axiosClient(originalRequest);
        }
      } catch (refreshError: any) {
        console.log("🔴 REFRESH TOKEN FAILED:", refreshError.response?.data);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      }
    }

    console.log("🔴 FINAL ERROR RETURNED TO CALLER\n");
    return Promise.reject(error);
  },
);

export default axiosClient;

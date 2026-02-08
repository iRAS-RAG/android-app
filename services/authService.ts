import authApi from "../api/authApi";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "../constants/storageKeys";

const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });

      // Theo cấu trúc BE của bạn: { token: { accessToken, refreshToken }, message }
      if (response.data && response.data.token) {
        const { accessToken, refreshToken } = response.data.token;
        await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        await SecureStore.setItemAsync(
          STORAGE_KEYS.REFRESH_TOKEN,
          refreshToken,
        );

        // Bạn có thể giải mã JWT hoặc gọi thêm API lấy User Profile tại đây
        return response.data;
      }
      return null;
    } catch (error: any) {
      console.log("Login error:", error);
      if (error.response) {
        console.log("Error response data:", error.response.data);
        console.log("Error response status:", error.response.status);
      }
      throw error.response?.data?.message || "Đăng nhập thất bại";
    }
  },

  logout: async () => {
    const refreshToken = await SecureStore.getItemAsync(
      STORAGE_KEYS.REFRESH_TOKEN,
    );
    if (refreshToken) await authApi.logout(refreshToken);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  },
};

export default authService;

import authApi from "../api/authApi";
import axiosClient from "../api/axiosClient";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "../constants/storageKeys";

const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      if (response.data && response.data.token) {
        const { accessToken, refreshToken } = response.data.token;
        await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        await SecureStore.setItemAsync(
          STORAGE_KEYS.REFRESH_TOKEN,
          refreshToken,
        );

        // Sau khi đăng nhập, lấy luôn profile để lưu cache nếu cần
        const profile = await authService.getCurrentUserProfile();
        if (profile) {
          await SecureStore.setItemAsync(
            STORAGE_KEYS.USER_DATA,
            JSON.stringify(profile),
          );
        }
        return response.data;
      }
      return null;
    } catch (error: any) {
      throw error;
    }
  },

  // GỌI API THẬT /api/users/me
  getCurrentUserProfile: async () => {
    try {
      const response = await axiosClient.get("/users/me");
      return response.data.data; // Trả về object: { firstName, lastName, roleName... }
    } catch (error) {
      console.log("Lỗi lấy thông tin người dùng:", error);
      return null;
    }
  },

  logout: async () => {
    const refreshToken = await SecureStore.getItemAsync(
      STORAGE_KEYS.REFRESH_TOKEN,
    );
    if (refreshToken) await authApi.logout(refreshToken);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
  },

  async requestPasswordReset(email: string) {
    try {
      const response = await authApi.requestPasswordReset(email);
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || "Không thể gửi yêu cầu.";
    }
  },

  async resetPassword(data: {
    email: string;
    code: string;
    newPassword: string;
    confirmNewPassword: string;
  }) {
    try {
      const payload = {
        Email: data.email,
        Code: data.code,
        NewPassword: data.newPassword,
        ConfirmNewPassword: data.confirmNewPassword,
      };
      const response = await authApi.resetPassword(payload);
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || "Đặt lại mật khẩu thất bại.";
    }
  },
};

export default authService;

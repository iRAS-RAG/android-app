// services/authService.ts
import authApi from "../api/authApi";
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
        return response.data;
      }
      return null;
    } catch (error: any) {
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

  async requestPasswordReset(email: string) {
    try {
      const response = await authApi.requestPasswordReset(email);
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || "Không thể gửi yêu cầu.";
    }
  },

  // THÊM PHƯƠNG THỨC NÀY ĐỂ XỬ LÝ LỖI TYPESCRIPT
  async resetPassword(data: {
    email: string;
    code: string; // Đổi từ token -> code
    newPassword: string;
    confirmNewPassword: string; // Thêm trường này
  }) {
    try {
      // Chuyển đổi sang đúng format object mà C# Model đang chờ
      const payload = {
        Email: data.email,
        Code: data.code,
        NewPassword: data.newPassword,
        ConfirmNewPassword: data.confirmNewPassword,
      };

      console.log("===> PAYLOAD GỬI LÊN BE:", payload);
      const response = await authApi.resetPassword(payload);
      return response.data;
    } catch (error: any) {
      console.log("===> CHI TIẾT LỖI TỪ BE:", error.response?.data);
      throw error.response?.data?.errors
        ? "Dữ liệu xác thực không hợp lệ."
        : error.response?.data?.message || "Đặt lại mật khẩu thất bại.";
    }
  },
};

export default authService;

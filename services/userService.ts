import { userApi } from "../api/userApi";

export const userService = {
  /**
   * Đổi mật khẩu người dùng hiện tại
   */
  changePassword: async (data: {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => {
    try {
      const response = await userApi.changePassword(data);
      return response.data;
    } catch (error: any) {
      console.error("Lỗi service changePassword:", error);
      // Ném lỗi ra để màn hình ChangePasswordScreen có thể catch và hiển thị Alert
      throw error;
    }
  },

  /**
   * Lấy thông tin profile người dùng
   */
  getCurrentUserProfile: async () => {
    try {
      const response = await userApi.getProfile();
      // Bóc tách dữ liệu tùy theo cấu trúc trả về của Backend (thường là response.data.data)
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Lỗi service getCurrentUserProfile:", error);
      throw error;
    }
  },
};

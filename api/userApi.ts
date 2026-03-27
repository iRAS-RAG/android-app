import axiosClient from "./axiosClient"; // Hoặc import theo đường dẫn file cấu hình axios của bạn

export const userApi = {
  // 1. API Đổi mật khẩu
  changePassword: (data: any) => {
    return axiosClient.put(`/users/me/password`, data);
  },

  // 2. API Lấy thông tin cá nhân (Có thể dùng cho trang Settings)
  getProfile: () => {
    return axiosClient.get(`/users/me`);
  },

  // 3. API Cập nhật thông tin cá nhân
  updateProfile: (data: any) => {
    return axiosClient.put(`/users/me`, data);
  },
};

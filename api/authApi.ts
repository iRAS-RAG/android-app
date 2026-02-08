// api/authApi.ts
import axiosClient from "./axiosClient";

const authApi = {
  login: (data: any) => axiosClient.post("/auth/login", data),

  requestPasswordReset: (email: string) =>
    axiosClient.post(`/auth/request-password-reset?email=${email}`),

  // Phương thức này sẽ gửi body chứa email, token(otp) và mật khẩu mới
  resetPassword: (data: any) => axiosClient.post("/auth/reset-password", data),

  logout: (refreshToken: string) =>
    axiosClient.post(`/auth/logout?refreshToken=${refreshToken}`),
};

export default authApi;

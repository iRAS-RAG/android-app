import axiosClient from "./axiosClient";

const authApi = {
  login: (data: any) => {
    return axiosClient.post("/auth/login", data);
  },
  requestPasswordReset: (email: string) => {
    return axiosClient.post(`/auth/request-password-reset?email=${email}`);
  },
  resetPassword: (data: any) => {
    return axiosClient.post("/auth/reset-password", data);
  },
  logout: (refreshToken: string) => {
    return axiosClient.post(`/auth/logout?refreshToken=${refreshToken}`);
  },
};

export default authApi;

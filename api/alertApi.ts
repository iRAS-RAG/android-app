import axiosClient from "./axiosClient";

export const alertApi = {
  // Gọi đến AlertController: GetAllAlerts
  getAllAlerts: (page = 1, pageSize = 10) => {
    return axiosClient.get(`/alerts?page=${page}&pageSize=${pageSize}`);
  },

  // Gọi đến AlertController: GetAlertById
  getAlertById: (id: string) => {
    return axiosClient.get(`/alerts/${id}`);
  },

  // Gọi đến CorrectiveActionController: GetAllCorrectiveActions
  // Lấy các hướng dẫn xử lý AI
  getCorrectiveActions: (page = 1, pageSize = 10) => {
    return axiosClient.get(
      `/corrective-actions?page=${page}&pageSize=${pageSize}`,
    );
  },

  // Cập nhật trạng thái (Dùng UpdateAlert)
  updateAlert: (id: string, data: any) => {
    return axiosClient.put(`/alerts/${id}`, data);
  },
};

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

  // Cập nhật trạng thái qua PATCH (đồng bộ web)
  updateStatus: (id: string, status: "Acknowledged" | "Dismissed") => {
    return axiosClient.patch(`/alerts/${id}/status`, { status });
  },

  // Giữ lại cho backward compat nếu cần PUT full update
  updateAlert: (id: string, data: any) => {
    return axiosClient.put(`/alerts/${id}`, data);
  },
};

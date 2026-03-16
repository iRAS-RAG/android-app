import axiosClient from "./axiosClient";

export const maintenanceApi = {
  // 1. Lưu nhật ký (Hành động khắc phục)
  createCorrectiveAction: (data: any) => {
    return axiosClient.post("/corrective-actions", data);
  },
  // --- THÊM 3 HÀM NÀY ĐỂ HỖ TRỢ CHỈNH SỬA ---
  getCorrectiveActions: () => {
    return axiosClient.get("/corrective-actions", {
      params: { page: 1, pageSize: 100 },
    });
  },
  getCorrectiveActionById: (id: string) => {
    return axiosClient.get(`/corrective-actions/${id}`);
  },
  updateCorrectiveAction: (id: string, data: any) => {
    return axiosClient.put(`/corrective-actions/${id}`, data);
  },

  // 2. Lấy danh sách thiết bị
  getControlDevices: () => {
    return axiosClient.get("/hardwares/control-devices", {
      params: { page: 1, pageSize: 100 },
    });
  },
  getSensors: () => {
    return axiosClient.get("/hardwares/sensors", {
      params: { page: 1, pageSize: 100 },
    });
  },

  // 3. Lấy user hiện tại
  getCurrentUser: () => {
    return axiosClient.get("/users/me");
  },
};

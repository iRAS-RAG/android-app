import axiosClient from "./axiosClient";

export const batchApi = {
  // Lấy danh sách lô nuôi (có phân trang/lọc)
  getBatches: (params?: any) => {
    return axiosClient.get("/batches", { params });
  },

  // Lấy chi tiết 1 lô nuôi
  getBatchById: (id: string) => {
    return axiosClient.get(`/batches/${id}`);
  },

  // Các API vận hành (Dành cho tab Operations)
  logMortality: (id: string, data: { quantity: number; date: string }) => {
    return axiosClient.post(`/batches/${id}/mortality`, data);
  },

  getFeedingLogs: (id: string, params?: any) => {
    return axiosClient.get(`/batches/${id}/feeding-logs`, { params });
  },

  recordFeeding: (id: string, data: { amount: number }) => {
    return axiosClient.post(`/batches/${id}/feeding`, data);
  },
  getMortalityLogs: (params?: any) => {
    return axiosClient.get("/mortality-logs", { params });
  },

  // Lấy danh sách giai đoạn của vụ nuôi (dùng để hiển thị giai đoạn hiện tại khi cho ăn)
  getBatchStages: (id: string) => {
    return axiosClient.get(`/batches/${id}/stages`);
  },
};

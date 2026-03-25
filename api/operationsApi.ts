// api/operationsApi.ts
import axiosClient from "./axiosClient";

export const operationsApi = {
  getFeedTypes: () => {
    return axiosClient.get("/feed-types", {
      params: { page: 1, pageSize: 100 },
    });
  },

  // SỬA: Lấy nhật ký cho ăn THEO LÔ NUÔI
  getFeedingLogsByBatch: (batchId: string) => {
    return axiosClient.get(`/batches/${batchId}/feeding-logs`, {
      params: { page: 1, pageSize: 100 },
    });
  },

  // SỬA: Ghi nhận cho ăn THEO LÔ NUÔI
  postFeeding: (batchId: string, data: any) => {
    // Xóa dòng cũ: return axiosClient.post("/feeding-logs", data);
    return axiosClient.post(`/batches/${batchId}/feeding`, data);
  },

  getAllTanks: () => axiosClient.get("/tanks"),
  getMortalityLogs: () =>
    axiosClient.get("/mortality-logs", { params: { page: 1, pageSize: 100 } }),
  postMortalityLog: (data: any) => axiosClient.post("/mortality-logs", data),
  putMortalityLog: (id: string, data: any) =>
    axiosClient.put(`/mortality-logs/${id}`, data),
};

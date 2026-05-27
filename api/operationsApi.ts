// api/operationsApi.ts
import axiosClient from "./axiosClient";

export const operationsApi = {
  getFeedTypes: () => {
    return axiosClient.get("/feed-types", {
      params: { page: 1, pageSize: 100 },
    });
  },

  getFeedingLogsByBatch: (batchId: string) => {
    return axiosClient.get(`/batches/${batchId}/feeding-logs`, {
      params: { page: 1, pageSize: 100 },
    });
  },

  postFeeding: (batchId: string, data: any) => {
    return axiosClient.post(`/batches/${batchId}/feeding`, data);
  },

  getAllTanks: () => axiosClient.get("/tanks"),

  getMortalityLogs: () =>
    axiosClient.get("/mortality-logs", { params: { page: 1, pageSize: 100 } }),

  /**
   * Validate trước khi ghi nhận cá chết.
   * Response: { isWithinRange: boolean, message: string }
   * Backend field: lostWeightKg (không phải weight)
   */
  validateMortalityLog: (
    batchId: string,
    data: { quantity: number; lostWeightKg: number; date: string },
  ) => axiosClient.post(`/batches/${batchId}/mortality/validate`, data),

  /**
   * Ghi nhận cá chết theo lô nuôi.
   * Endpoint: POST /batches/{batchId}/mortality
   * Backend field: lostWeightKg (không phải weight)
   */
  postMortalityLog: (
    batchId: string,
    data: { quantity: number; lostWeightKg: number; date: string },
  ) => axiosClient.post(`/batches/${batchId}/mortality`, data),

  putMortalityLog: (id: string, data: any) =>
    axiosClient.put(`/mortality-logs/${id}`, data),
};

import axiosClient from "./axiosClient";

export const dashboardApi = {
  // Đổi từ /fish-tanks thành /tanks để khớp với Backend [Route("api/tanks")]
  getFishTanks: (page = 1, pageSize = 10) => {
    return axiosClient.get(`/tanks?page=${page}&pageSize=${pageSize}`);
  },

  // Giữ nguyên hoặc kiểm tra lại SensorController có Route là "api/sensors" không
  getSensors: (page = 1, pageSize = 10) => {
    return axiosClient.get(`/sensors?page=${page}&pageSize=${pageSize}`);
  },

  // Giữ nguyên hoặc kiểm tra lại CorrectiveActionController có Route là "api/corrective-actions" không
  getAlerts: (page = 1, pageSize = 10) => {
    return axiosClient.get(
      `/corrective-actions?page=${page}&pageSize=${pageSize}`,
    );
  },
};

import axiosClient from "./axiosClient";

export const dashboardApi = {
  // Đổi từ /fish-tanks thành /tanks để khớp với Backend [Route("api/tanks")]
  getFishTanks: (page = 1, pageSize = 10) => {
    return axiosClient.get(`/fish-tanks?page=${page}&pageSize=${pageSize}`);
  },

  // Giữ nguyên hoặc kiểm tra lại SensorController có Route là "api/sensors" không
  getSensors: (page = 1, pageSize = 10) => {
    return axiosClient.get(`/sensors?page=${page}&pageSize=${pageSize}`);
  },

  // Giữ nguyên hoặc kiểm tra lại CorrectiveActionController có Route là "api/corrective-actions" không
  getAlerts: (page = 1, pageSize = 10) => {
    return axiosClient.get(`/alerts?page=${page}&pageSize=${pageSize}`);
  },
  // API lấy lô nuôi để lấy loại cá và số lượng
  // getBatches: (tankId: string) => {
  //   return axiosClient.get(`/batches`, {
  //     params: { FishTankId: tankId, Page: 1, PageSize: 1 },
  //   });
  // },
  getBatchesList: (page = 1, pageSize = 20) => {
    return axiosClient.get(`/batches?page=${page}&pageSize=${pageSize}`);
  },
};

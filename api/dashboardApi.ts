import axiosClient from "./axiosClient";

export const dashboardApi = {
  // Đã có FishTankController
  getFishTanks: (page = 1, pageSize = 10) => {
    return axiosClient.get(`/fish-tanks?page=${page}&pageSize=${pageSize}`);
  },

  // Đã có SensorController
  getSensors: (page = 1, pageSize = 10) => {
    return axiosClient.get(`/sensors?page=${page}&pageSize=${pageSize}`);
  },

  // Đã có CorrectiveActionController
  getAlerts: (page = 1, pageSize = 10) => {
    return axiosClient.get(
      `/corrective-actions?page=${page}&pageSize=${pageSize}`,
    );
  },
};

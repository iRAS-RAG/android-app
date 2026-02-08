import axiosClient from "./axiosClient";

export const tankDetailApi = {
  // Lấy thông tin bể cụ thể (FishTankController)
  getTankInfo: (id: string) => {
    return axiosClient.get(`/fish-tanks/${id}`);
  },

  // Lấy ngưỡng của loài (SpeciesThresholdController)
  getSpeciesThresholds: (page = 1, pageSize = 20) => {
    return axiosClient.get(
      `/species-threshholds?page=${page}&pageSize=${pageSize}`,
    );
  },

  // Lấy danh sách thiết bị điều khiển - Máy bơm (ControlDeviceController)
  getControlDevices: (page = 1, pageSize = 20) => {
    return axiosClient.get(
      `/control-devices?page=${page}&pageSize=${pageSize}`,
    );
  },
};

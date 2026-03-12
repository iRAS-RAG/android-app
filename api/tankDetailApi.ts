import axiosClient from "./axiosClient";

export const tankDetailApi = {
  // Lấy thông tin cơ bản & camera của bể (FishTankController)
  getTankInfo: (id: string) => {
    return axiosClient.get(`/tanks/${id}`);
  },

  // Lấy dữ liệu cảm biến MỚI NHẤT (Nhiệt độ, pH, Oxy) [Route: api/tanks/{id}/latest-data]
  getLatestData: (id: string) => {
    return axiosClient.get(`/tanks/${id}/latest-data`);
  },

  // Lấy lịch sử cảm biến cho biểu đồ [Route: api/sensors/{id}/logs]
  getSensorLogs: (sensorId: string, page = 1, pageSize = 20) => {
    return axiosClient.get(`/sensors/${sensorId}/logs`, {
      params: { Page: page, PageSize: pageSize },
    });
  },

  // Lấy danh sách thiết bị điều khiển (HardwareController) [Route: api/hardware/control-devices]
  getControlDevices: (tankId: string) => {
    return axiosClient.get(`/hardware/control-devices`, {
      params: { FishTankId: tankId }, // Truyền TankId để lọc thiết bị của bể này
    });
  },

  // Lấy ngưỡng của loài (SpeciesThresholdController) [Route: api/species-threshholds]
  getSpeciesThresholds: (speciesId: string) => {
    return axiosClient.get(`/species-threshholds`, {
      params: { SpeciesId: speciesId },
    });
  },
};

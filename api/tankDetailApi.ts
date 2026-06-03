import axiosClient from "./axiosClient";

export const tankDetailApi = {
  // Lấy thông tin cơ bản & camera của bể (FishTankController)
  getTankInfo: (id: string) => {
    return axiosClient.get(`/fish-tanks/${id}`);
  },

  // Lấy dữ liệu cảm biến MỚI NHẤT (Nhiệt độ, pH, Oxy) [Route: api/tanks/{id}/latest-data]
  getLatestData: (id: string) => {
    return axiosClient.get(`/fish-tanks/${id}/latest-data`);
  },
  getSensorLogs: (sensorId: string, page = 1, pageSize = 20) => {
    return axiosClient.get(`/hardwares/sensors/${sensorId}/logs`, {
      params: { Page: page, PageSize: pageSize },
    });
  },

  // Lịch sử sensor theo khoảng thời gian + interval (dùng cho filter chart)
  // from, to: ISO string; interval: phút
  getSensorHistory: (
    sensorId: string,
    from: string,
    to: string,
    interval: number,
  ) => {
    return axiosClient.get(`/hardwares/sensors/${sensorId}/history`, {
      params: { from, to, interval },
    });
  },

  // Lấy danh sách thiết bị điều khiển (HardwareController) [Route: api/hardware/control-devices]
  getControlDevices: (tankId: string) => {
    return axiosClient.get(`/hardwares/control-devices`, {
      params: { FishTankId: tankId }, // Truyền TankId để lọc thiết bị của bể này
    });
  },

  // Bật/Tắt thiết bị điều khiển thủ công
  toggleControlDevice: (deviceId: string, state: boolean) => {
    return axiosClient.post(
      `/hardwares/control-devices/${deviceId}/toggle`,
      { state },
    );
  },

  // Lấy ngưỡng của loài (SpeciesThresholdController) [Route: api/species-threshholds]
  getSpeciesThresholds: (speciesId: string) => {
    return axiosClient.get(`/species-threshholds`, {
      params: { SpeciesId: speciesId },
    });
  },
};

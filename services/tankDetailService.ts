import { tankDetailApi } from "../api/tankDetailApi";

export const tankDetailService = {
  getTankFullDetails: async (tankId: string) => {
    try {
      const [tankRes, thresholdsRes, devicesRes] = await Promise.all([
        tankDetailApi.getTankInfo(tankId),
        tankDetailApi.getSpeciesThresholds(),
        tankDetailApi.getControlDevices(),
      ]);

      return {
        // Dữ liệu THẬT từ API
        tankInfo: tankRes.data.data,
        // pump: devicesRes.data.data?.[0], // Lấy thiết bị đầu tiên làm máy bơm mẫu
        pumps: devicesRes.data.data || [],

        // Dữ liệu MOCK (Vì BE chưa có API SensorLog/History)
        metrics: [
          {
            label: "Nhiệt độ",
            value: "28.5",
            unit: "°C",
            time: "2 phút trước",
            icon: "thermometer",
            color: "#EF4444",
          },
          {
            label: "Độ pH",
            value: "7.2",
            unit: "pH",
            time: "1 phút trước",
            icon: "droplet",
            color: "#3B82F6",
          },
          {
            label: "Oxy hòa tan",
            value: "5.8",
            unit: "mg/L",
            time: "5 phút trước",
            icon: "wind",
            color: "#10B981",
          },
        ],
        chartData: {
          labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
          datasets: [{ data: [7.1, 7.3, 7.5, 7.4, 7.6, 7.2] }],
        },
        thresholds: {
          low: "6.5 pH",
          optimal: "7-8",
          high: "8.5 pH",
        },
      };
    } catch (error) {
      console.error("Lỗi Tank Detail Service:", error);
      throw error;
    }
  },
};

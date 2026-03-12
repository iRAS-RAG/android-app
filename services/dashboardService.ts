// services/dashboardService.ts
import { dashboardApi } from "../api/dashboardApi";

export const dashboardService = {
  calculateVolume: (radius: number, height: number): number => {
    if (!radius || !height || radius <= 0 || height <= 0) return 0;
    const volume = Math.PI * Math.pow(radius, 2) * height;
    return parseFloat(volume.toFixed(2));
  },

  getDashboardData: async () => {
    try {
      const [tanksRes, alertsRes] = await Promise.all([
        dashboardApi.getFishTanks(1, 20),
        dashboardApi.getAlerts(1, 1),
      ]);

      const tanks = tanksRes.data.data || [];

      const tanksWithBatchData = await Promise.all(
        tanks.map(async (tank: any) => {
          try {
            const batchRes = await dashboardApi.getBatches(tank.id);
            const currentBatch = batchRes.data.data?.[0]; // Lấy lô nuôi mới nhất

            const realVolume = dashboardService.calculateVolume(
              tank.radius,
              tank.height,
            );

            return {
              ...tank,
              speciesName: currentBatch?.speciesName || "Chưa thả cá",
              stageName: currentBatch?.stageName || "", // Giai đoạn sinh trưởng
              batchStatus: currentBatch?.status || "", // Trạng thái lô nuôi

              // Dùng currentQuantity cho thực tế, hoặc initialQuantity để test hiển thị
              // displayQuantity: currentBatch
              //   ? `${currentBatch.currentQuantity.toLocaleString()} ${currentBatch.unitOfMeasure || "con"}`
              //   : "0 con",
              // Đổi sang initialQuantity để test hiển thị số lượng thả ban đầu
              displayQuantity: currentBatch
                ? `${currentBatch.initialQuantity} ${currentBatch.unitOfMeasure || "con"}` // Đổi current thành initial để test
                : "0 con",

              displayVolume:
                realVolume > 0 ? `${realVolume} m³` : "Chưa nhập số liệu",
            };
          } catch (err) {
            return {
              ...tank,
              speciesName: "N/A",
              displayQuantity: "0 con",
              displayVolume: "N/A",
            };
          }
        }),
      );

      return {
        tanks: tanksWithBatchData,
        totalTanks: tanksRes.data.meta?.totalItems || 0,
        totalAlerts: alertsRes.data.meta?.totalItems || 0,
      };
    } catch (error) {
      console.error("Lỗi khi tổng hợp dữ liệu Dashboard:", error);
      throw error;
    }
  },
};

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
      // Gọi song song API lấy Batches, Tanks và Alerts để tiết kiệm thời gian (Tránh lỗi N+1)
      const [batchesRes, tanksRes, alertsRes] = await Promise.all([
        dashboardApi.getBatchesList(1, 20),
        dashboardApi.getFishTanks(1, 100), // Lấy số lượng lớn để đủ data map thể tích
        dashboardApi.getAlerts(1, 1),
      ]);

      const rawBatches = batchesRes.data.data || [];
      const rawTanks = tanksRes.data.data || [];

      // Tạo một Hash Map lưu thông tin bể để tra cứu nhanh thể tích (Volume)
      const tankMap = new Map();
      rawTanks.forEach((tank: any) => {
        tankMap.set(tank.id, tank);
      });

      // Format lại danh sách Lô nuôi
      const formattedBatches = rawBatches.map((batch: any) => {
        const tankInfo = tankMap.get(batch.fishTankId);

        // Tính toán thể tích dựa trên dữ liệu bể cá đã map được
        const realVolume = tankInfo
          ? dashboardService.calculateVolume(tankInfo.radius, tankInfo.height)
          : 0;

        return {
          id: batch.id,
          batchName: batch.name, // Tên lô nuôi (VD: Lô Cá Hồi T1)
          tankId: batch.fishTankId,
          tankName: batch.fishTankName, // Nằm ở bể nào
          speciesName: batch.speciesName,
          stageName: batch.stageName,
          status: batch.status,

          // Ưu tiên hiển thị số lượng hiện tại (CurrentQuantity)
          displayQuantity: `${batch.currentQuantity ?? batch.initialQuantity ?? 0} ${batch.unitOfMeasure || "con"}`,
          displayVolume:
            realVolume > 0
              ? `${realVolume} m³`
              : tankInfo?.volume
                ? `${tankInfo.volume} m³`
                : "Chưa nhập",
        };
      });

      return {
        batches: formattedBatches,
        totalBatches: batchesRes.data.meta?.totalItems || 0,
        totalAlerts: alertsRes.data.meta?.totalItems || 0,
      };
    } catch (error) {
      console.error("Lỗi khi tổng hợp dữ liệu Dashboard:", error);
      throw error;
    }
  },
};

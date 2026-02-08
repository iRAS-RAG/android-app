import { dashboardApi } from "../api/dashboardApi";

export const dashboardService = {
  getDashboardData: async () => {
    try {
      // Gọi song song các API đã có controller backend
      const [tanksRes, sensorsRes, alertsRes] = await Promise.all([
        dashboardApi.getFishTanks(1, 10),
        dashboardApi.getSensors(1, 10),
        dashboardApi.getAlerts(1, 1),
      ]);

      // Map lại dữ liệu theo cấu trúc thực tế từ API (như ảnh Swagger bạn cung cấp)
      return {
        tanks: tanksRes.data.data || [],
        sensors: sensorsRes.data.data || [],
        totalTanks: tanksRes.data.meta?.totalItems || 0,
        totalAlerts: alertsRes.data.meta?.totalItems || 0,
      };
    } catch (error) {
      console.error("Lỗi khi tổng hợp dữ liệu Dashboard:", error);
      throw error;
    }
  },
};

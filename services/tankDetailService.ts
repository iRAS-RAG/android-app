import { tankDetailApi } from "../api/tankDetailApi";

// Định nghĩa Interface dựa trên TankSensorLatestDataDto thực tế
interface SensorLatestData {
  sensorId: string;
  sensorName: string;
  sensorTypeName: string;
  latestValue: number | null;
  unitOfMeasure: string;
  isWarning: boolean;
  recordedAt: string;
  measureType: string;
}

export const tankDetailService = {
  getTankFullDetails: async (tankId: string) => {
    try {
      const [latestDataRes, devicesRes] = await Promise.all([
        tankDetailApi.getLatestData(tankId),
        tankDetailApi.getControlDevices(tankId),
      ]);

      const rawMetrics: SensorLatestData[] = latestDataRes.data?.data || [];

      // LỌC TRÙNG: Chỉ giữ lại cảm biến duy nhất theo tên loại (Sửa lỗi hiện 2 nhiệt độ)
      const latestMetrics = Array.from(
        new Map<string, SensorLatestData>(
          rawMetrics.map((m) => [m.sensorTypeName, m]),
        ).values(),
      );

      const firstSensorId = latestMetrics[0]?.sensorId;

      // Xử lý thông tin bể (Fallback nếu bị lỗi 403 do quyền Worker)
      let tankInfo = { name: "Bể nuôi", farmName: "Hệ thống iRAS" };
      try {
        const tankRes = await tankDetailApi.getTankInfo(tankId);
        if (tankRes.data?.data) tankInfo = tankRes.data.data;
      } catch (e) {
        console.warn("Lỗi 403: Không có quyền Supervisor để lấy TankInfo");
      }

      // Khởi tạo biểu đồ xu hướng dựa trên dữ liệu 'data' và 'createdAt'
      let initialChartData = null;
      if (firstSensorId) {
        try {
          const logsRes = await tankDetailApi.getSensorLogs(firstSensorId);
          const logs = logsRes.data?.data || [];

          if (Array.isArray(logs) && logs.length > 0) {
            const validLogs = logs
              .filter((l: any) => l.data !== null && !isNaN(Number(l.data)))
              .slice(0, 6)
              .reverse();

            if (validLogs.length > 0) {
              initialChartData = {
                labels: validLogs.map(
                  (l: any) => new Date(l.createdAt).getHours() + "h",
                ),
                datasets: [{ data: validLogs.map((l: any) => Number(l.data)) }],
              };
            }
          }
        } catch (e) {
          console.warn("Không thể tải logs cảm biến đầu tiên");
        }
      }

      return {
        tankInfo,
        pumps: (devicesRes.data?.data || []).map((d: any) => ({
          ...d,
          status: d.state, // Map 'state' từ BE sang 'status' của UI
        })),
        metrics: latestMetrics.map((m) => ({
          id: m.sensorId,
          label: m.sensorTypeName,
          value: m.latestValue !== null ? m.latestValue.toString() : "0",
          unit: m.unitOfMeasure,
          color: m.isWarning ? "#EF4444" : "#3B82F6",
          icon: m.sensorTypeName?.includes("Nhiệt độ")
            ? "thermometer"
            : m.sensorTypeName?.includes("pH")
              ? "droplet"
              : "wind",
          time: m.recordedAt ? `${new Date(m.recordedAt).getHours()}h` : "N/A",
        })),
        initialChartData,
      };
    } catch (error) {
      console.error("Lỗi Tank Detail Service:", error);
      throw error;
    }
  },
};

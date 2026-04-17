import { tankDetailApi } from "../api/tankDetailApi";

// Định nghĩa Interface khớp 100% với TankSensorLatestDataValueDto của Backend
interface SensorLatestData {
  sensorId: string;
  sensorName: string;
  sensorTypeName: string;
  unitOfMeasure: string;
  measureType: string;
  latestData: {
    latestAvg: number; // Backend trả về latestAvg thay vì latestValue
    latestMin: number;
    latestMax: number;
    hasWarning: boolean | null; // Backend trả về hasWarning
    recordedAt: string | null;
  } | null;
}

export const tankDetailService = {
  getTankFullDetails: async (tankId: string) => {
    try {
      const [latestDataRes, devicesRes] = await Promise.all([
        tankDetailApi.getLatestData(tankId),
        tankDetailApi.getControlDevices(tankId),
      ]);

      const rawMetrics: SensorLatestData[] = latestDataRes.data?.data || [];

      const latestMetricsMap = new Map<string, SensorLatestData>();
      rawMetrics.forEach((m) => {
        const typeName = m.sensorTypeName;
        if (!latestMetricsMap.has(typeName)) {
          latestMetricsMap.set(typeName, m);
        } else {
          const existing = latestMetricsMap.get(typeName);
          const existingHasData =
            existing?.latestData !== null && existing?.latestData !== undefined;
          const currentHasData =
            m.latestData !== null && m.latestData !== undefined;

          if (!existingHasData && currentHasData) {
            latestMetricsMap.set(typeName, m);
          }
        }
      });
      const latestMetrics = Array.from(latestMetricsMap.values());

      const firstSensorId = latestMetrics[0]?.sensorId;

      let tankInfo = { name: "Bể nuôi", farmName: "Hệ thống iRAS" };
      try {
        const tankRes = await tankDetailApi.getTankInfo(tankId);
        if (tankRes.data?.data) tankInfo = tankRes.data.data;
      } catch (e) {
        console.warn("Lỗi tải thông tin bể (có thể do quyền)");
      }

      let initialChartData = null;
      if (firstSensorId) {
        try {
          const logsRes = await tankDetailApi.getSensorLogs(firstSensorId);
          const logs = logsRes.data?.data || [];

          if (Array.isArray(logs) && logs.length > 0) {
            // SỬA Ở ĐÂY: Dùng l.average thay vì l.data
            const validLogs = logs
              .filter(
                (l: any) => l.average !== null && !isNaN(Number(l.average)),
              )
              .slice(0, 6)
              .reverse();

            if (validLogs.length > 0) {
              initialChartData = {
                labels: validLogs.map(
                  (l: any) =>
                    new Date(l.createdAt || l.periodStart).getHours() + "h",
                ),
                datasets: [
                  { data: validLogs.map((l: any) => Number(l.average)) },
                ],
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
          status: d.state,
        })),
        metrics: latestMetrics.map((m) => {
          const hasData = m.latestData !== null && m.latestData !== undefined;
          // SỬA Ở ĐÂY: Lấy latestAvg
          const val = hasData ? m.latestData?.latestAvg : null;

          return {
            id: m.sensorId,
            label: m.sensorTypeName,
            value: val !== null && val !== undefined ? val.toFixed(1) : "0",
            unit:
              m.unitOfMeasure ||
              (m.sensorTypeName?.includes("Nhiệt độ") ? "°C" : ""),
            // SỬA Ở ĐÂY: Lấy hasWarning
            color: hasData && m.latestData?.hasWarning ? "#EF4444" : "#3B82F6",
            icon: m.sensorTypeName?.includes("Nhiệt độ")
              ? "thermometer"
              : m.sensorTypeName?.includes("pH")
                ? "droplet"
                : "wind",
            time:
              hasData && m.latestData?.recordedAt
                ? `${new Date(m.latestData.recordedAt).getHours()}h`
                : "N/A",
          };
        }),
        initialChartData,
      };
    } catch (error) {
      console.error("Lỗi Tank Detail Service:", error);
      throw error;
    }
  },
};

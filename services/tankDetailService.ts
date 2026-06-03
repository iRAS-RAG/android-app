import { tankDetailApi } from "../api/tankDetailApi";

// Định nghĩa Interface khớp 100% với TankSensorLatestDataValueDto của Backend
interface SensorLatestData {
  sensorId: string;
  sensorName: string;
  sensorTypeName: string;
  unitOfMeasure: string;
  measureType: string;
  minThreshold?: number | null;
  maxThreshold?: number | null;
  latestData: {
    latestAvg: number;
    latestMin: number | null;
    latestMax: number | null;
    hasWarning: boolean | null;
    isWarning?: boolean | null;
    recordedAt: string | null;
    periodStart?: string | null;
  } | null;
}

const getDefaultThresholdForService = (sensorTypeName: string): { min: number; max: number } => {
  const lower = sensorTypeName?.toLowerCase() || "";
  if (lower.includes("nhiệt độ") || lower.includes("temp")) return { min: 26, max: 30 };
  if (lower.includes("ph")) return { min: 6.5, max: 8.5 };
  if (lower.includes("oxy") || lower.includes("do")) return { min: 4, max: 8 };
  return { min: 0, max: 100 };
};

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
      } catch {
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
          const val = hasData ? m.latestData?.latestAvg : null;

          return {
            id: m.sensorId,
            label: m.sensorTypeName,
            value: val !== null && val !== undefined ? val.toFixed(1) : "0",
            unit:
              m.unitOfMeasure ||
              (m.sensorTypeName?.includes("Nhiệt độ") ? "°C" : ""),
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
            // Giá trị min/max đo được trong kỳ (dùng cho "Thấp nhất/Cao nhất hôm nay")
            latestMin: hasData ? (m.latestData?.latestMin ?? null) : null,
            latestMax: hasData ? (m.latestData?.latestMax ?? null) : null,
            // Ngưỡng an toàn từ API, fallback sang default theo loại cảm biến
            minThreshold: m.minThreshold ?? getDefaultThresholdForService(m.sensorTypeName).min,
            maxThreshold: m.maxThreshold ?? getDefaultThresholdForService(m.sensorTypeName).max,
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

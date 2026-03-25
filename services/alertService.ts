import { alertApi } from "../api/alertApi";
import { theme } from "@/theme";

export const alertService = {
  getAlerts: async (page = 1, pageSize = 100) => {
    try {
      // Gọi API thật từ Backend
      const response = await alertApi.getAllAlerts(page, pageSize);

      // Lấy dữ liệu mảng (Swagger trả về data.data hoặc data.data.items)
      const rawData = response.data?.data?.items || response.data?.data || [];

      // Map dữ liệu sang format UI cần
      return rawData.map((item: any) => ({
        id: item.id,
        title: `Cảnh báo ${item.sensorTypeName || "hệ thống"}`,
        desc:
          item.description ||
          `Phát hiện chỉ số bất thường tại ${item.fishTankName || "Bể nuôi"}`,
        value:
          item.value !== undefined && item.value !== null
            ? `${item.value}`
            : "N/A",

        // SỬA Ở ĐÂY: Nối MinThreshold và MaxThreshold lại thành chuỗi
        limit: `${item.minThreshold ?? 0} - ${item.maxThreshold ?? 0}`,

        level: mapSeverity(item.status),
        status: mapStatus(item.status),
        color: mapColor(item.status),
        tank: item.fishTankName || "Bể chưa xác định",
        time: formatTime(item.raisedAt || item.createdAt),
        type: "Sensor",
      }));
    } catch (error) {
      console.error("Lỗi service getAlerts:", error);
      return [];
    }
  },

  getAlertDetail: async (id: string) => {
    try {
      // Gọi API lấy chi tiết 1 cảnh báo
      const response = await alertApi.getAlertById(id);
      const item = response.data?.data || response.data;

      if (!item) return null;

      // 1. Lấy các giá trị (Sửa tên biến cho khớp với JSON trả về từ AlertDto)
      const currentValue = item.value || 0;
      const min = item.minThreshold ?? 0;
      const max = item.maxThreshold ?? 0;

      // 2. Xử lý logic tính Vượt ngưỡng và Ngưỡng an toàn
      let limitText = `${min} - ${max}`;
      let overPercentage = "0%";

      if (currentValue > max && max > 0) {
        limitText = `> ${max}`;
        const percent = ((currentValue - max) / max) * 100;
        overPercentage = `+${Math.round(percent)}%`;
      } else if (currentValue < min && min > 0) {
        limitText = `< ${min}`;
        const percent = ((min - currentValue) / min) * 100;
        overPercentage = `-${Math.round(percent)}%`;
      }

      // 3. Map toàn bộ dữ liệu chi tiết
      return {
        id: item.id,
        title: `Cảnh báo ${item.sensorTypeName || "hệ thống"}`,
        desc:
          item.description ||
          `Phát hiện chỉ số bất thường tại ${item.fishTankName || "Bể nuôi"}`,
        value: currentValue.toString(),
        limit: limitText,
        level: mapSeverity(item.status),
        status: mapStatus(item.status),
        color: mapColor(item.status),
        tank: item.fishTankName || "Bể chưa xác định",
        time: formatTime(item.raisedAt || item.createdAt),
        type: "Sensor",

        // --- ĐỔ DỮ LIỆU ĐÃ TÍNH TOÁN RA UI (Dành cho các ô CompBox) ---
        unit: item.unit || "mg/L",
        optimalValue: `${min} - ${max}`,
        safeLimit: limitText,
        exceededPercent: overPercentage,

        // --- CÁC TRƯỜNG BỔ SUNG CHO TRANG CHI TIẾT VÀ ĐIỀU HƯỚNG ---
        batchName: item.farmingBatchName || "Chưa gán lô nuôi",
        resolvedAt: item.resolvedAt ? formatTime(item.resolvedAt) : null,
        sensorLogId: item.sensorLogId,
        speciesThresholdId: item.speciesThresholdId,

        // TRƯỜNG QUAN TRỌNG ĐỂ NÚT "XEM CHI TIẾT BỂ" CHUYỂN TRANG ĐÚNG:
        fishTankId: item.fishTankId,
      };
    } catch (error) {
      console.error("Lỗi lấy chi tiết cảnh báo:", error);
      return null;
    }
  },

  updateStatus: async (id: string, action: "processing" | "resolved") => {
    try {
      // Backend dùng enum: OPEN, ACKNOWLEDGED, RESOLVED
      const backendStatus =
        action === "processing" ? "ACKNOWLEDGED" : "RESOLVED";

      // Gọi API Update (chỉ gửi trường status lên)
      await alertApi.updateAlert(id, { status: backendStatus });
      return true;
    } catch (error) {
      console.error("Lỗi updateStatus:", error);
      throw error;
    }
  },
};

// --- Helper Functions ---
const mapSeverity = (status: string) => {
  if (status === "OPEN") return "Nguy hiểm";
  if (status === "ACKNOWLEDGED") return "Cảnh báo";
  return "An toàn"; // RESOLVED
};

const mapStatus = (status: string) => {
  if (status === "OPEN") return "Mới";
  if (status === "ACKNOWLEDGED") return "Đang xử lý";
  return "Đã giải quyết"; // RESOLVED
};

const mapColor = (status: string) => {
  if (status === "OPEN") return theme.colors.danger; // Đỏ
  if (status === "ACKNOWLEDGED") return theme.colors.warning; // Vàng
  return theme.colors.success; // Xanh lá
};

const formatTime = (isoString: string) => {
  if (!isoString) return "Vừa xong";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Vừa xong";
    return date.toLocaleString("vi-VN");
  } catch {
    return "Vừa xong";
  }
};

import { alertApi } from "../api/alertApi";
import { theme } from "@/theme";

// --- 1. DỮ LIỆU GIẢ LẬP (MOCK DATA) ---
const MOCK_ALERTS = [
  // --- NGUY HIỂM (ĐỎ) ---
  {
    id: "1",
    type: "NH3",
    title: "Mức NH3 vượt ngưỡng tử vong",
    message: "Nồng độ Amoniac tăng đột biến, cần thay nước gấp.",
    currentValue: "0.85",
    unit: "mg/L",
    threshold: "0.50",
    severity: "danger",
    status: "pending",
    tankName: "Bể A-01",
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: "2",
    type: "Pump",
    title: "Mất kết nối máy bơm sục khí",
    message: "Không nhận được tín hiệu từ bơm #3. Kiểm tra nguồn điện.",
    currentValue: "OFF",
    unit: "",
    threshold: "ON",
    severity: "critical",
    status: "processing",
    tankName: "Bể A-02",
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  // --- CẢNH BÁO (VÀNG) ---
  {
    id: "4",
    type: "DO",
    title: "Oxy hòa tan thấp nhẹ",
    message: "DO đang giảm dần vào buổi trưa, cần bật thêm quạt nước.",
    currentValue: "3.8",
    unit: "mg/L",
    threshold: "4.0",
    severity: "warning",
    status: "pending",
    tankName: "Bể C-12",
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: "5",
    type: "Temp",
    title: "Nhiệt độ nước tăng cao",
    message: "Nhiệt độ mặt nước cao do nắng nóng.",
    currentValue: "33.5",
    unit: "°C",
    threshold: "32.0",
    severity: "warning",
    status: "processing",
    tankName: "Bể A-01",
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  // --- AN TOÀN (XANH) ---
  {
    id: "7",
    type: "Temp",
    title: "Nhiệt độ đã ổn định",
    message: "Hệ thống làm mát đã đưa nhiệt độ về mức chuẩn.",
    currentValue: "28.5",
    unit: "°C",
    threshold: "28-30",
    severity: "safe",
    status: "resolved",
    tankName: "Bể A-03",
    createdAt: new Date(Date.now() - 300 * 60000).toISOString(),
  },
];

export const alertService = {
  getAlerts: async (page = 1, pageSize = 10) => {
    try {
      // --- CHẾ ĐỘ DEV: FORCE MOCK DATA ---
      // Comment dòng gọi API lại để test giao diện
      // const response = await alertApi.getAllAlerts(page, pageSize);
      // const rawData = response.data?.data || [];

      console.log("⚠️ Đang sử dụng Mock Data để test UI");
      const rawData = MOCK_ALERTS; // <--- GÁN TRỰC TIẾP Ở ĐÂY

      // Map dữ liệu sang UI Model
      return rawData.map((item: any) => ({
        id: item.id ? String(item.id) : Math.random().toString(),
        title: item.title || "Cảnh báo hệ thống",
        desc: item.message || item.description || "Mô tả không có sẵn",

        // Logic hiển thị Giá trị
        value:
          item.currentValue !== undefined && item.currentValue !== null
            ? `${item.currentValue} ${item.unit || ""}`
            : "N/A",

        // Logic hiển thị Ngưỡng
        limit: item.threshold ? `${item.threshold} ${item.unit || ""}` : "N/A",

        level: mapSeverity(item.severity),
        status: mapStatus(item.status),
        tank: item.tankName || "Bể chưa xác định",
        time: formatTime(item.createdAt),
        color: mapColor(item.severity),
        type: item.type || "Sensor",
      }));
    } catch (error) {
      console.error("Lỗi service:", error);
      return [];
    }
  },

  updateStatus: async (id: string, newStatus: string) => {
    console.log(`Mock update status: ${id} -> ${newStatus}`);
    return true; // Giả lập update thành công luôn
  },
};

// --- Helper Functions (Giữ nguyên) ---
const mapSeverity = (severity: any) => {
  if (severity === null || severity === undefined) return "Cảnh báo";
  const s = String(severity).toLowerCase();
  if (s.includes("danger") || s.includes("critical") || s === "2")
    return "Nguy hiểm";
  if (s.includes("safe") || s.includes("normal") || s === "0") return "An toàn";
  return "Cảnh báo";
};

const mapStatus = (status: any) => {
  if (status === null || status === undefined) return "Đang xảy ra";
  const s = String(status).toLowerCase();
  if (s.includes("process") || s.includes("pending") || s === "1")
    return "Đang xử lý";
  if (
    s.includes("resolved") ||
    s.includes("done") ||
    s.includes("closed") ||
    s === "2"
  )
    return "Đã giải quyết";
  return "Đang xảy ra";
};

const mapColor = (severity: any) => {
  const level = mapSeverity(severity);
  if (level === "Nguy hiểm") return theme.colors.danger;
  if (level === "An toàn") return theme.colors.success; // Xanh lá
  return theme.colors.warning; // Vàng
};

const formatTime = (isoString: string) => {
  if (!isoString) return "Vừa xong";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Vừa xong";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return "Hôm qua";
  } catch {
    return "Vừa xong";
  }
};

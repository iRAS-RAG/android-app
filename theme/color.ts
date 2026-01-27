// theme/colors.ts
export const colors = {
  // Brand Colors
  primary: "#2A85FF", // AI Blue
  secondary: "#27C4A8", // Aqua/Nước

  // Feedback Colors
  success: "#32D583", // Trạng thái tốt
  warning: "#FFB547", // Cảnh báo (Accent)
  danger: "#F04438", // Nguy hiểm (Critical)

  // Neutral Colors (Thang độ xám)
  textPrimary: "#1F2937", // Text Chính
  textSecondary: "#6B7280", // Text Phụ
  border: "#D1D5DB", // Border
  background: "#E3F2FD", // Background chính
  white: "#FFFFFF",

  // KPI Specific (Dành cho Card Sensor/KPI)
  kpi: {
    temp: { bg: "#E3F2FD", text: "#2A85FF" }, // Xanh Blue
    ph: { bg: "#E8F5E9", text: "#32D583" }, // Xanh lá
    do: { bg: "#FFF3E0", text: "#FFB547" }, // Cam
    critical: { bg: "#FFEBEE", text: "#F04438" }, // Đỏ
    offline: { bg: "#F3F4F6", text: "#9CA3AF" }, // Xám
  },
};

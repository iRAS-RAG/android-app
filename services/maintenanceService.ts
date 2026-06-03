import { maintenanceApi } from "../api/maintenanceApi";
import { alertApi } from "../api/alertApi";

export const maintenanceService = {
  getDevicesForDropdown: async () => {
    try {
      const [devicesRes, sensorsRes] = await Promise.all([
        maintenanceApi.getControlDevices(),
        maintenanceApi.getSensors(),
      ]);

      const devices =
        devicesRes.data?.data?.items || devicesRes.data?.data || [];
      const sensors =
        sensorsRes.data?.data?.items || sensorsRes.data?.data || [];

      return [
        ...devices.map((d: any) => ({
          label: `[Thiết bị] ${d.name}`,
          value: d.id,
        })),
        ...sensors.map((s: any) => ({
          label: `[Cảm biến] ${s.name}`,
          value: s.id,
        })),
      ];
    } catch (error) {
      console.error("Lỗi lấy danh sách thiết bị:", error);
      return [];
    }
  },

  getCurrentUser: async () => {
    try {
      const res = await maintenanceApi.getCurrentUser();
      const user = res.data?.data || res.data;
      if (!user) return null;
      return {
        id: user.id, // BỔ SUNG TRƯỜNG ID NÀY
        name: user.fullName || user.email || "Chưa cập nhật tên",
        roles: user.roles?.join(", ") || "Kỹ thuật viên",
        avatarText: user.fullName?.charAt(0)?.toUpperCase() || "NV",
      };
    } catch (error) {
      console.error("Lỗi lấy thông tin user:", error);
      return null;
    }
  },

  createLog: async (payload: any) => {
    try {
      const res = await maintenanceApi.createCorrectiveAction(payload);
      return res.data;
    } catch (error) {
      console.error("Lỗi lưu nhật ký bảo trì:", error);
      throw error;
    }
  },

  // Tìm xem Cảnh báo này đã có Nhật ký nào chưa
  getLogByAlertId: async (alertId: string) => {
    try {
      const res = await maintenanceApi.getCorrectiveActions();
      const items = res.data?.data?.items || res.data?.data || [];
      // Lọc ra nhật ký thuộc về alertId này
      return items.find((item: any) => item.alertId === alertId) || null;
    } catch (error) {
      return null;
    }
  },

  // Lấy chi tiết 1 nhật ký để fill vào form Sửa
  getLogById: async (logId: string) => {
    try {
      const res = await maintenanceApi.getCorrectiveActionById(logId);
      return res.data?.data || res.data;
    } catch (error) {
      console.error("Lỗi lấy chi tiết log:", error);
      return null;
    }
  },
  // Cập nhật nhật ký
  updateLog: async (logId: string, payload: any) => {
    try {
      const res = await maintenanceApi.updateCorrectiveAction(logId, payload);
      return res.data;
    } catch (error) {
      console.error("Lỗi cập nhật nhật ký:", error);
      throw error;
    }
  },

  // Lấy nhật ký bảo trì theo vụ nuôi:
  // corrective_action.alertId → alert.farmingBatchId
  getLogsByBatch: async (batchId: string) => {
    try {
      // Bước 1: Lấy tất cả alerts, lọc theo farmingBatchId
      const alertsRes = await alertApi.getAllAlerts(1, 100);
      const allAlerts = alertsRes.data?.data?.items || alertsRes.data?.data || [];
      const batchAlertIds = new Set<string>(
        allAlerts
          .filter((a: any) => a.farmingBatchId === batchId)
          .map((a: any) => a.id as string),
      );

      if (batchAlertIds.size === 0) return [];

      // Bước 2: Lấy tất cả corrective actions, lọc theo alertId
      const logsRes = await maintenanceApi.getCorrectiveActions();
      const logs = logsRes.data?.data?.items || logsRes.data?.data || [];

      return logs
        .filter((log: any) => batchAlertIds.has(log.alertId))
        .map((log: any) => ({
          id: log.id,
          alertId: log.alertId,
          actionTaken: log.actionTaken || "",
          notes: log.notes || "",
          rawDate: log.createdAt || log.createdDate,
          time:
            log.createdAt || log.createdDate
              ? new Date(log.createdAt || log.createdDate).toLocaleString("vi-VN")
              : "N/A",
        }))
        .sort(
          (a: any, b: any) =>
            new Date(b.rawDate || 0).getTime() - new Date(a.rawDate || 0).getTime(),
        );
    } catch (error) {
      console.error("Lỗi getLogsByBatch:", error);
      return [];
    }
  },
};

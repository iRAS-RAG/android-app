// services/operationsService.ts
import axiosClient from "@/api/axiosClient";
import { operationsApi } from "../api/operationsApi";

export const operationsService = {
  // 1. Lấy danh sách bể (Đã có API)
  //   getTanksForUI: async () => {
  //     try {
  //       const [tanksRes, logsRes] = await Promise.all([
  //         operationsApi.getAllTanks(),
  //         operationsApi.getFeedingLogs(),
  //       ]);

  //       const tanks = tanksRes.data?.data || [];
  //       const logs = logsRes.data?.data || [];

  //       return tanks.map((t: any) => {
  //         // Tìm bản ghi cho ăn gần nhất của lô nuôi này
  //         const lastLog = logs.find(
  //           (l: any) => l.farmingBatchId === t.activeFarmingBatchId,
  //         );

  //         return {
  //           // QUAN TRỌNG: ID ở đây phải là ID của Lô nuôi (FarmingBatchId)
  //           id: t.activeFarmingBatchId || t.id,
  //           tankName: t.name, // Tên bể
  //           batchName: t.activeFarmingBatchName || `Lô nuôi ${t.name}`, // Tên lô nuôi
  //           crop: t.farmName || "Vụ nuôi hiện tại",
  //           lastFed: lastLog ? `${lastLog.amount}kg` : "Chưa cho ăn",
  //           lastFedAmount: lastLog ? lastLog.amount : 0,
  //           lastLogId: lastLog ? lastLog.id : null,
  //           time: lastLog
  //             ? new Date(lastLog.createdDate).toLocaleTimeString("vi-VN")
  //             : "-",
  //         };
  //       });
  //     } catch (error) {
  //       return [];
  //     }
  //   },
  getAllBatchesForUI: async () => {
    try {
      const res = await axiosClient.get("/batches"); // Gọi trực tiếp FarmingBatchController
      const batches = res.data?.data || [];
      return batches.map((b: any) => ({
        id: b.id, // Đây là FarmingBatchId
        name: b.name, // Tên lô nuôi (ví dụ: Lô nuôi cá rô phi 2024-01)
        tankName: b.fishTankName || "Bể nuôi",
        status: b.status,
      }));
    } catch (error) {
      console.error("Lỗi lấy danh sách lô nuôi:", error);
      return [];
    }
  },
  // 2. Lấy loại thức ăn (Sửa lỗi truy cập data.data từ Swagger)
  getFeedTypesForDropdown: async () => {
    try {
      const res = await operationsApi.getFeedTypes();
      // Swagger cho thấy mảng nằm trong res.data.data
      const rawData = res.data?.data || [];

      return rawData.map((item: any) => ({
        label: item.name,
        value: item.id,
      }));
    } catch (error) {
      console.error("Lỗi lấy FeedTypes:", error);
      return [];
    }
  },

  getFeedingHistory: async () => {
    try {
      const [logsRes, feedsRes] = await Promise.all([
        operationsApi.getFeedingLogs(),
        operationsApi.getFeedTypes(),
      ]);

      const logs = logsRes.data?.data || [];

      /**
       * QUAN TRỌNG: Theo FeedTypeController, kết quả trả về có phân trang.
       * Dữ liệu thực nằm trong data.items (hoặc data.data.items tùy cấu trúc axios của bạn).
       */
      const feedTypes = feedsRes.data?.data?.items || feedsRes.data?.data || [];

      return logs.map((log: any) => {
        // 1. Tìm loại thức ăn khớp ID (Ép kiểu chuỗi để tránh lệch Guid/String)
        const matchedFeed = feedTypes.find(
          (f: any) =>
            String(f.id).toLowerCase() === String(log.feedTypeId).toLowerCase(),
        );

        return {
          id: log.id,
          farmingBatchId: log.farmingBatchId,
          feedTypeId: log.feedTypeId,
          time: log.createdDate
            ? new Date(log.createdDate).toLocaleString("vi-VN")
            : "N/A",
          tank: log.farmingBatchName || "Bể nuôi",

          // 2. Lấy trường 'name' từ DB đã tìm thấy thông qua matchedFeed
          // Nếu không tìm thấy mới dùng giá trị dự phòng
          feedName: matchedFeed?.name || log.feedTypeName || "Thức ăn hỗn hợp",

          amount: log.amount,
          unit: "kg",
          user: "KTV Hệ thống",
        };
      });
    } catch (error) {
      console.error("Lỗi lấy lịch sử:", error);
      return [];
    }
  },
};

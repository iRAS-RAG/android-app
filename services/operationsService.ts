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
      // 1. Lấy danh sách lô nuôi & loại thức ăn cùng lúc
      const [batchesRes, feedsRes] = await Promise.all([
        axiosClient.get("/batches", { params: { page: 1, pageSize: 100 } }),
        operationsApi.getFeedTypes(),
      ]);

      const batches =
        batchesRes.data?.data?.items || batchesRes.data?.data || [];
      const feedTypes = feedsRes.data?.data?.items || feedsRes.data?.data || [];

      // 2. Gọi API lấy lịch sử cho ăn của TỪNG lô nuôi
      const feedingLogsPromises = batches.map(
        (b: any) => operationsApi.getFeedingLogsByBatch(b.id).catch(() => null), // Bỏ qua nếu lô bị lỗi
      );

      const feedingLogsResults = await Promise.all(feedingLogsPromises);

      // 3. Gộp tất cả log lại thành 1 mảng
      let allLogs: any[] = [];
      feedingLogsResults.forEach((res: any) => {
        if (res?.data?.data) {
          const logs = res.data.data.items || res.data.data;
          allLogs = [...allLogs, ...logs];
        }
      });

      // 4. Map dữ liệu để hiển thị
      return allLogs.map((log: any) => {
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
          tank: log.farmingBatchName || "Lô nuôi",
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
  // Thêm hàm lấy lịch sử cá chết
  getMortalityHistory: async () => {
    try {
      const res = await operationsApi.getMortalityLogs();
      const logs = res.data?.data?.items || res.data?.data || [];

      return logs.map((log: any) => ({
        id: log.id,
        batchId: log.batchId,
        tank: log.batchName || "Lô nuôi",
        time: log.date ? new Date(log.date).toLocaleString("vi-VN") : "N/A",
        amount: log.quantity, // Dùng chung trường amount để UI dễ render
        unit: "con",
        user: "KTV Hệ thống",
      }));
    } catch (error) {
      console.error("Lỗi lấy lịch sử cá chết:", error);
      return [];
    }
  },
};

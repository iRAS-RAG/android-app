import { batchApi } from "../api/batchApi";
import { tankDetailApi } from "../api/tankDetailApi"; // Chỉnh lại đường dẫn nếu cần

export const batchService = {
  getBatchDetailOverview: async (batchId: string) => {
    try {
      // 1. Lấy thông tin chi tiết Lô nuôi
      const batchResponse = await batchApi.getBatchById(batchId);
      const batchData = batchResponse.data.data;

      if (!batchData) {
        throw new Error("Không tìm thấy thông tin lô nuôi");
      }

      // 2. Fetch các dữ liệu liên quan song song
      // QUAN TRỌNG: Backend giới hạn PageSize tối đa là 100.
      const [tankRes, feedingRes, mortalityRes] = await Promise.all([
        tankDetailApi.getTankInfo(batchData.fishTankId).catch(() => null),
        batchApi
          .getFeedingLogs(batchId, { Page: 1, PageSize: 100 })
          .catch((e) => {
            console.warn("Lỗi tải lịch sử cám:", e);
            return null;
          }),
        batchApi
          .getMortalityLogs({ BatchId: batchId, Page: 1, PageSize: 100 })
          .catch((e) => {
            console.warn("Lỗi tải lịch sử cá chết:", e);
            return null;
          }),
      ]);

      // Tính dung tích bể
      const tankVolume = tankRes?.data?.data?.volume || 0;

      // Tính tổng cám tiêu thụ (Xử lý an toàn cấu trúc phân trang)
      const rawFeedingData = feedingRes?.data?.data;
      // Đề phòng trường hợp API trả về { items: [...] } thay vì mảng trực tiếp
      const feedingLogs = Array.isArray(rawFeedingData)
        ? rawFeedingData
        : rawFeedingData?.items || [];
      const totalFeed = feedingLogs.reduce(
        (sum: number, log: any) => sum + (log.amount || 0),
        0,
      );

      // Tính tổng số cá chết (Xử lý an toàn cấu trúc phân trang)
      const rawMortalityData = mortalityRes?.data?.data;
      const mortalityLogs = Array.isArray(rawMortalityData)
        ? rawMortalityData
        : rawMortalityData?.items || [];
      const totalDead = mortalityLogs.reduce(
        (sum: number, log: any) => sum + (log.quantity || 0),
        0,
      );

      // Tính toán ngày tuổi (DOC)
      const startDate = new Date(batchData.startDate);
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
      const daysOfCulture = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 3. Trả về format chuẩn cho UI
      return {
        batchInfo: {
          id: batchData.id,
          name: batchData.name,
          speciesName: batchData.speciesName,
          stageName: batchData.stageName,
          tankId: batchData.fishTankId,
          tankName: batchData.fishTankName,
          daysOfCulture: daysOfCulture,
          tankVolume: tankVolume > 0 ? `${tankVolume} m³` : "Chưa cập nhật",
          initialQuantity: batchData.initialQuantity,
          currentQuantity: batchData.currentQuantity,
          totalDead: totalDead,
          totalFeed: totalFeed > 0 ? `${totalFeed.toFixed(1)} kg` : "0 kg",
          status: batchData.status,
        },
      };
    } catch (error) {
      console.error("Lỗi khi tổng hợp dữ liệu Batch Detail:", error);
      throw error;
    }
  },
};

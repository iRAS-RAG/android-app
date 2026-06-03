import { batchApi } from "../api/batchApi";

// Không cần tankDetailApi nữa — tankVolume đã có trong FarmingBatchDto

export const batchService = {
  getBatchDetailOverview: async (batchId: string) => {
    try {
      const batchResponse = await batchApi.getBatchById(batchId);
      const d = batchResponse.data?.data;
      if (!d) throw new Error("Không tìm thấy thông tin lô nuôi");

      // Tải feeding, mortality và stages song song
      const [feedingRes, mortalityRes, stagesRes] = await Promise.all([
        batchApi.getFeedingLogs(batchId, { Page: 1, PageSize: 100 }).catch(() => null),
        batchApi.getMortalityLogs({ BatchId: batchId, Page: 1, PageSize: 100 }).catch(() => null),
        batchApi.getBatchStages(batchId).catch(() => null),
      ]);

      // Tổng cám
      const rawFeeding = feedingRes?.data?.data;
      const feedingLogs = Array.isArray(rawFeeding) ? rawFeeding : rawFeeding?.items || [];
      const totalFeedKg = feedingLogs.reduce((sum: number, l: any) => sum + (l.amount || 0), 0);

      // Tổng cá chết
      const rawMortality = mortalityRes?.data?.data;
      const mortalityLogs = Array.isArray(rawMortality) ? rawMortality : rawMortality?.items || [];
      const totalDead = mortalityLogs.reduce((sum: number, l: any) => sum + (l.quantity || 0), 0);

      // Xác định ngày kết thúc thực tế / dự kiến
      // Backend trả về: ActualHarvestDate và EstimatedHarvestDate (không có EndDate)
      const endDateIso: string | null =
        d.actualHarvestDate || d.estimatedHarvestDate || null;

      // Ngày tuổi:
      //  - Vụ thu hoạch/hủy → tính từ startDate đến actualHarvestDate
      //  - Vụ đang nuôi     → tính từ startDate đến hôm nay
      const startDate = d.startDate ? new Date(d.startDate) : null;
      const isFinished =
        d.status === 2 ||
        String(d.status ?? "").toUpperCase() === "HARVESTED" ||
        String(d.status ?? "").toUpperCase() === "THU HOẠCH" ||
        String(d.status ?? "").toUpperCase() === "TERMINATED";

      let daysOfCulture = 0;
      if (startDate) {
        const endRef = isFinished && endDateIso ? new Date(endDateIso) : new Date();
        daysOfCulture = Math.max(
          0,
          Math.ceil((endRef.getTime() - startDate.getTime()) / 86400000),
        );
      }

      const initial = d.initialQuantity ?? 0;
      const current = d.currentQuantity ?? 0;

      // Tỷ lệ sống:
      //  - Đang nuôi  → currentQuantity / initialQuantity
      //  - Thu hoạch  → actualHarvestCount / initialQuantity (nếu có), fallback về current
      const survivalNumerator =
        isFinished && d.actualHarvestCount != null
          ? d.actualHarvestCount
          : current;
      const survivalRate =
        initial > 0 ? Math.round((survivalNumerator / initial) * 100) : 0;

      const netChange = current - initial;

      // Dung tích bể: lấy trực tiếp từ FarmingBatchDto (không cần gọi thêm API)
      const tankVolumeM3 = d.tankVolume ?? 0;

      // FCR từ API
      const fcr = d.fcr != null ? Number(d.fcr).toFixed(2) : null;

      // Dự kiến / thực tế thu hoạch
      const estimatedHarvestCount = d.estimatedHarvestCount ?? null;
      const actualHarvestCount = d.actualHarvestCount ?? null;

      // Giai đoạn
      const rawStages = stagesRes?.data?.data || stagesRes?.data || [];
      const stages: any[] = Array.isArray(rawStages) ? rawStages : [];

      return {
        batchInfo: {
          id: d.id,
          name: d.name,
          speciesName: d.speciesName,
          stageName: d.stageName,
          tankId: d.fishTankId,
          tankName: d.fishTankName,
          status: d.status,
          startDate: d.startDate || null,
          endDate: endDateIso,
          isFinished,
          daysOfCulture,
          // tankVolume từ batch response (hình trụ, backend đã tính sẵn)
          tankVolume:
            tankVolumeM3 > 0
              ? `${Number(tankVolumeM3).toFixed(2)} m³`
              : "Chưa cập nhật",
          initialQuantity: initial,
          currentQuantity: current,
          netChange,
          survivalRate,
          totalDead,
          totalFeedKg,
          totalFeed: totalFeedKg > 0 ? `${totalFeedKg.toFixed(1)} kg` : "0 kg",
          fcr,
          estimatedHarvestCount,
          actualHarvestCount,
        },
        stages,
      };
    } catch (error) {
      console.error("Lỗi khi tổng hợp dữ liệu Batch Detail:", error);
      throw error;
    }
  },
};

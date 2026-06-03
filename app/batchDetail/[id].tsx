import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  FlatList,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { batchService } from "@/services/batchService";
import { toast } from "@/utils/toast";
import { theme as appTheme } from "@/theme";

const { width } = Dimensions.get("window");
// Full-width card: scrollContent padding = 16px mỗi bên → card = width - 32
const STAGE_CARD_WIDTH = width - 32;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getStatusConfig = (status: string | number) => {
  const s = String(status).toUpperCase().trim();
  if (s === "0" || s === "1" || s === "ACTIVE" || s === "ĐANG NUÔI")
    return { label: "ĐANG NUÔI", bg: "#DCFCE7", text: "#166534", isActive: true };
  if (s === "2" || s === "HARVESTED" || s === "THU HOẠCH" || s === "THU HOACH")
    return { label: "ĐÃ THU HOẠCH", bg: "#F1F5F9", text: "#64748B", isActive: false };
  if (s === "1" || s === "PAUSED" || s === "TẠM DỪNG")
    return { label: "TẠM DỪNG", bg: "#FEF9C3", text: "#854D0E", isActive: false };
  if (s === "3" || s === "TERMINATED" || s === "ĐÃ HỦY")
    return { label: "ĐÃ HỦY", bg: "#FEE2E2", text: "#991B1B", isActive: false };
  return { label: "KHỞI TẠO", bg: "#E0E7FF", text: "#3730A3", isActive: false };
};

const fmtDate = (iso: string | null | undefined) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("vi-VN");
  } catch {
    return "—";
  }
};

const findActiveStage = (stages: any[]) => {
  const now = new Date();
  return (
    stages.find((s) => {
      const start = s.actualStartDate || s.estimatedStartDate;
      const end = s.actualEndDate || s.estimatedEndDate;
      if (!start) return false;
      return new Date(start) <= now && (!end || now < new Date(end));
    }) ?? null
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatWidget = ({
  label,
  value,
  unit,
  icon,
  iconLib = "Ionicons",
  valueColor,
  subtext,
}: any) => {
  const Icon =
    iconLib === "FontAwesome5"
      ? FontAwesome5
      : iconLib === "MaterialCommunityIcons"
        ? MaterialCommunityIcons
        : Ionicons;
  return (
    <View style={styles.widget}>
      <View style={styles.widgetHeader}>
        <Text style={styles.widgetLabel} numberOfLines={2}>
          {label}
        </Text>
        <Icon name={icon} size={18} color={appTheme.colors.primary} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap" }}>
        <Text style={[styles.widgetValue, valueColor && { color: valueColor }]}>
          {value ?? "—"}
        </Text>
        {unit ? <Text style={styles.widgetUnit}> {unit}</Text> : null}
      </View>
      {subtext ? <Text style={styles.widgetSub}>{subtext}</Text> : null}
    </View>
  );
};

const StageCard = ({
  stage,
  isActive,
  isFinished,
}: {
  stage: any;
  isActive: boolean;
  isFinished: boolean;
}) => {
  const startStr = fmtDate(stage.actualStartDate || stage.estimatedStartDate);
  const endStr = fmtDate(stage.actualEndDate || stage.estimatedEndDate);
  const feedNames: string =
    stage.feedTypeNames?.length > 0
      ? stage.feedTypeNames.join(", ")
      : "Chưa xác định";

  const InfoRow = ({
    icon,
    label,
    value,
    valueColor,
  }: {
    icon: string;
    label: string;
    value: string;
    valueColor?: string;
  }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 7,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
      }}
    >
      <Ionicons
        name={icon as any}
        size={15}
        color="#94A3B8"
        style={{ width: 22 }}
      />
      <Text style={{ fontSize: 13, color: "#64748B", width: 120 }}>{label}</Text>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "700",
          color: valueColor || "#1E293B",
          flex: 1,
        }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.stageCard,
        { width: STAGE_CARD_WIDTH },
        isActive && styles.stageCardActive,
        !isActive && isFinished && { opacity: 0.65 },
      ]}
    >
      {/* ── Header ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <View
          style={[
            styles.stageSeqBadge,
            {
              backgroundColor: isActive
                ? appTheme.colors.success
                : "#94A3B8",
            },
          ]}
        >
          <Text style={styles.stageSeqText}>{stage.sequence}</Text>
        </View>
        <Text
          style={[styles.stageName, { flex: 1 }]}
          numberOfLines={2}
        >
          {stage.stageName}
        </Text>
        {isActive && (
          <View style={styles.stageActiveBadge}>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: appTheme.colors.success,
                marginRight: 4,
              }}
            />
            <Text style={styles.stageActiveBadgeText}>Đang diễn ra</Text>
          </View>
        )}
        {isFinished && !isActive && (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              backgroundColor: "#F1F5F9",
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 10, color: "#64748B", fontWeight: "600" }}>
              Đã qua
            </Text>
          </View>
        )}
      </View>

      {/* ── Thông tin chi tiết ── */}
      <InfoRow
        icon="calendar-outline"
        label="Thời gian"
        value={`${startStr} → ${endStr}`}
      />
      <InfoRow
        icon="leaf-outline"
        label="Loại cám"
        value={feedNames}
      />
      {stage.expectedCount != null && (
        <InfoRow
          icon="fish-outline"
          label="Số lượng dự kiến"
          value={`${stage.expectedCount} con`}
          valueColor={appTheme.colors.primary}
        />
      )}
      {stage.estimatedDailyFeedKg != null && (
        <InfoRow
          icon="scale-outline"
          label="Cám/ngày"
          value={`${Number(stage.estimatedDailyFeedKg).toFixed(2)} kg`}
          valueColor={appTheme.colors.primary}
        />
      )}
      {stage.frequencyPerDay != null && (
        <InfoRow
          icon="repeat-outline"
          label="Tần suất"
          value={`${stage.frequencyPerDay} lần/ngày`}
        />
      )}
    </View>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function BatchDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [stages, setStages] = useState<any[]>([]);
  const stageListRef = useRef<FlatList>(null);

  const loadData = async () => {
    if (!id) return;
    try {
      const result = await batchService.getBatchDetailOverview(id);
      setData(result);
      setStages(result.stages || []);
    } catch {
      toast.error("Không thể tải dữ liệu lô nuôi.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Tự scroll đến giai đoạn hiện tại
  useEffect(() => {
    if (stages.length === 0) return;
    const activeIdx = stages.findIndex((s, i) => {
      const now = new Date();
      const start = s.actualStartDate || s.estimatedStartDate;
      const end = s.actualEndDate || s.estimatedEndDate;
      if (!start) return false;
      return new Date(start) <= now && (!end || now < new Date(end));
    });
    if (activeIdx > 0) {
      setTimeout(() => {
        stageListRef.current?.scrollToIndex({
          index: activeIdx,
          animated: true,
          viewPosition: 0.1,
        });
      }, 400);
    }
  }, [stages]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={appTheme.colors.primary} />
      </View>
    );
  }

  if (!data?.batchInfo) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#64748B" }}>Không tìm thấy thông tin lô nuôi.</Text>
        <TouchableOpacity style={{ marginTop: 15 }} onPress={() => router.back()}>
          <Text style={{ color: appTheme.colors.primary, fontWeight: "600" }}>
            Quay lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { batchInfo } = data;
  const statusConfig = getStatusConfig(batchInfo.status);
  const activeStage = statusConfig.isActive ? findActiveStage(stages) : null;

  const handleOperationsPress = () => {
    router.push({
      pathname: "/(tabs)/warehouse",
      params: { batchId: batchInfo.id },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết Lô Nuôi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            tintColor={appTheme.colors.primary}
          />
        }
      >
        {/* ── INFO CARD ── */}
        <View style={styles.infoCard}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.batchTitle}>{batchInfo.name}</Text>
              <View style={{ gap: 5, marginTop: 10 }}>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="fishbowl-outline"
                    size={15}
                    color={appTheme.colors.primary}
                    style={{ marginRight: 7 }}
                  />
                  <Text style={styles.infoRowText}>Vị trí: {batchInfo.tankName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="fish"
                    size={15}
                    color="#64748B"
                    style={{ marginRight: 7 }}
                  />
                  <Text style={styles.infoRowText}>Loài: {batchInfo.speciesName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="layers-outline"
                    size={15}
                    color="#64748B"
                    style={{ marginRight: 7 }}
                  />
                  <Text style={styles.infoRowText}>
                    Giai đoạn: {batchInfo.stageName || "—"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={15}
                    color="#64748B"
                    style={{ marginRight: 7 }}
                  />
                  <Text style={styles.infoRowText}>
                    {fmtDate(batchInfo.startDate)}
                    {batchInfo.endDate ? ` → ${fmtDate(batchInfo.endDate)}` : ""}
                  </Text>
                </View>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <Text style={[styles.statusText, { color: statusConfig.text }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 20 }} />

        {/* ── KẾ HOẠCH GIAI ĐOẠN ── */}
        {stages.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={styles.sectionTitle}>Kế hoạch giai đoạn</Text>
              <Text style={{ fontSize: 12, color: "#64748B" }}>
                {stages.length} giai đoạn
              </Text>
            </View>
            <FlatList
              ref={stageListRef}
              data={stages}
              horizontal
              pagingEnabled
              snapToAlignment="start"
              snapToInterval={STAGE_CARD_WIDTH}
              decelerationRate="fast"
              keyExtractor={(_, i) => String(i)}
              showsHorizontalScrollIndicator={false}
              getItemLayout={(_, index) => ({
                length: STAGE_CARD_WIDTH,
                offset: STAGE_CARD_WIDTH * index,
                index,
              })}
              onScrollToIndexFailed={() => {}}
              renderItem={({ item }) => {
                const isActive =
                  activeStage != null &&
                  (item.id === activeStage.id ||
                    (item.sequence != null &&
                      item.sequence === activeStage.sequence));
                const now = new Date();
                const stageEnd = item.actualEndDate || item.estimatedEndDate;
                const isFinishedStage =
                  !statusConfig.isActive ||
                  (stageEnd ? now > new Date(stageEnd) : false);
                return (
                  <StageCard
                    stage={item}
                    isActive={isActive}
                    isFinished={isFinishedStage}
                  />
                );
              }}
            />
          </View>
        )}

        {/* ── CHỈ SỐ SINH HỌC & VẬN HÀNH ── */}
        <Text style={styles.sectionTitle}>Chỉ số sinh học & Vận hành</Text>

        <View style={styles.grid}>
          {/* 1 */}
          <StatWidget
            label="NGÀY TUỔI"
            value={batchInfo.daysOfCulture}
            unit="ngày"
            icon="time-outline"
          />
          {/* 2 */}
          <StatWidget
            label="SỐ LƯỢNG BAN ĐẦU"
            value={batchInfo.initialQuantity}
            unit="con"
            icon="fish"
            iconLib="MaterialCommunityIcons"
          />
          {/* 3 */}
          <StatWidget
            label="SỐ LƯỢNG TỒN"
            value={batchInfo.currentQuantity}
            unit="con"
            icon="hand-holding-water"
            iconLib="FontAwesome5"
            subtext={
              batchInfo.netChange !== undefined
                ? batchInfo.netChange <= 0
                  ? `${batchInfo.netChange} con so với ban đầu`
                  : `+${batchInfo.netChange} con so với ban đầu`
                : undefined
            }
          />
          {/* 4 */}
          <StatWidget
            label="TỶ LỆ SỐNG"
            value={batchInfo.survivalRate}
            unit="%"
            icon="trending-up-outline"
            valueColor={
              batchInfo.survivalRate >= 80
                ? appTheme.colors.success
                : batchInfo.survivalRate >= 50
                  ? appTheme.colors.warning
                  : appTheme.colors.danger
            }
          />
          {/* 5 */}
          <StatWidget
            label="TỔNG CÁ CHẾT"
            value={batchInfo.totalDead}
            unit="con"
            icon="skull-outline"
            iconLib="MaterialCommunityIcons"
            valueColor={batchInfo.totalDead > 0 ? appTheme.colors.danger : undefined}
          />
          {/* 6 */}
          <StatWidget
            label="DUNG TÍCH BỂ"
            value={batchInfo.tankVolume}
            icon="codepen"
            iconLib="FontAwesome5"
          />
          {/* 7 */}
          <StatWidget
            label={statusConfig.isActive ? "DỰ KIẾN THU HOẠCH" : "KẾT QUẢ THỰC TẾ"}
            value={
              statusConfig.isActive
                ? (batchInfo.estimatedHarvestCount ?? "—")
                : (batchInfo.actualHarvestCount ?? "—")
            }
            unit={
              (statusConfig.isActive
                ? batchInfo.estimatedHarvestCount
                : batchInfo.actualHarvestCount) != null
                ? "con"
                : undefined
            }
            icon="checkmark-circle-outline"
            valueColor={appTheme.colors.primary}
          />
          {/* 8 */}
          <StatWidget
            label="FCR"
            value={batchInfo.fcr ?? "—"}
            icon="stats-chart-outline"
            subtext="Hệ số chuyển đổi thức ăn"
          />
        </View>

        {/* Tổng cám (wide card) */}
        <View style={styles.feedCard}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={styles.feedCardLabel}>TỔNG CÁM TIÊU THỤ CỦA VỤ</Text>
            <FontAwesome5 name="weight" size={18} color={appTheme.colors.primary} />
          </View>
          <Text style={styles.feedCardValue}>{batchInfo.totalFeed}</Text>
        </View>

        <View style={{ height: 28 }} />

        {/* ── NÚT HÀNH ĐỘNG ── */}
        {statusConfig.isActive ? (
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleOperationsPress}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color="#FFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.btnText}>Ghi nhận vận hành</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={handleOperationsPress}
          >
            <Ionicons
              name="book-outline"
              size={20}
              color={appTheme.colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.btnText, { color: appTheme.colors.primary }]}>
              Nhật ký vận hành
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  scrollContent: { padding: 16, paddingBottom: 40 },

  // Info card
  infoCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
  },
  batchTitle: { fontSize: 22, fontWeight: "800", color: "#1E293B" },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoRowText: { fontSize: 14, color: "#64748B", fontWeight: "500" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  statusText: { fontSize: 11, fontWeight: "700" },

  // Section
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },

  // Widget grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  widget: {
    backgroundColor: "#FFF",
    width: (width - 44) / 2,
    borderRadius: 14,
    padding: 14,
    minHeight: 100,
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  widgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  widgetLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    flex: 1,
    marginRight: 4,
  },
  widgetValue: { fontSize: 22, fontWeight: "800", color: "#1E293B" },
  widgetUnit: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  widgetSub: { fontSize: 10, color: "#94A3B8", marginTop: 4, fontStyle: "italic" },

  // Feed card (full width)
  feedCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  feedCardLabel: { fontSize: 11, fontWeight: "700", color: "#64748B", textTransform: "uppercase" },
  feedCardValue: { fontSize: 26, fontWeight: "800", color: "#3B82F6" },

  // Stage cards — width set inline theo STAGE_CARD_WIDTH
  stageCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  stageCardActive: {
    borderColor: "#10B981",
    borderWidth: 2,
    backgroundColor: "#F0FDF4",
  },
  stageCardFuture: {
    opacity: 0.7,
  },
  stageSeqBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    flexShrink: 0,
  },
  stageSeqText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  stageName: { fontSize: 13, fontWeight: "700", color: "#1E293B", flex: 1 },
  stageActiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
  },
  stageActiveBadgeText: { fontSize: 11, fontWeight: "700", color: "#166534" },
  stageDates: { fontSize: 11, color: "#64748B", marginTop: 4 },
  stageMeta: { fontSize: 11, color: "#475569" },

  // Buttons
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 14,
    paddingVertical: 15,
    elevation: 3,
    shadowColor: "#3B82F6",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
  },
  btnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    paddingVertical: 15,
    borderWidth: 1.5,
    borderColor: "#3B82F6",
  },
  btnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});

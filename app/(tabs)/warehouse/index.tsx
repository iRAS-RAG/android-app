import { theme } from "@/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { operationsService } from "@/services/operationsService";
import { operationsApi } from "@/api/operationsApi";
import { maintenanceService } from "@/services/maintenanceService";
import { alertApi } from "@/api/alertApi";
import { batchApi } from "@/api/batchApi";
import { styles } from "@/styles/operations/operations.styles";
import { toast } from "@/utils/toast";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getBatchStatusInfo = (status: any) => {
  const s = String(status ?? "").toUpperCase().trim();
  if (s === "0" || s === "ACTIVE" || s === "ĐANG NUÔI")
    return { label: "Đang nuôi", color: "#10B981", bg: "#D1FAE5" };
  if (s === "1" || s === "PAUSED" || s === "TẠM DỪNG")
    return { label: "Tạm dừng", color: "#F59E0B", bg: "#FEF3C7" };
  if (s === "2" || s === "HARVESTED" || s === "THU HOẠCH" || s === "THU HOACH")
    return { label: "Đã thu hoạch", color: "#64748B", bg: "#F1F5F9" };
  if (s === "3" || s === "TERMINATED" || s === "ĐÃ HỦY")
    return { label: "Đã hủy", color: "#EF4444", bg: "#FEE2E2" };
  return { label: String(status ?? ""), color: "#64748B", bg: "#F1F5F9" };
};

const isHarvestedStatus = (status: any) => {
  const s = String(status ?? "").toUpperCase().trim();
  return (
    s === "2" ||
    s === "HARVESTED" ||
    s === "THU HOẠCH" ||
    s === "THU HOACH"
  );
};

const BATCH_STATUS_OPTIONS = [
  { label: "Tất cả", value: "" },
  { label: "Đang nuôi", value: "0" },
  { label: "Tạm dừng", value: "1" },
  { label: "Đã thu hoạch", value: "2" },
  { label: "Đã hủy", value: "3" },
];

// Tìm giai đoạn đang hoạt động của vụ nuôi
const findActiveStage = (stages: any[]) => {
  const now = new Date();
  return (
    stages.find((s) => {
      const start = s.actualStartDate || s.estimatedStartDate;
      const end = s.actualEndDate || s.estimatedEndDate;
      if (!start) return false;
      return new Date(start) <= now && (!end || now < new Date(end));
    }) || null
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function OperationsScreen() {
  const router = useRouter();

  // Param từ batchDetail: auto-select vụ nuôi khi navigate từ chi tiết lô
  const { batchId: paramBatchId } = useLocalSearchParams<{ batchId?: string }>();
  const autoSelectedRef = useRef(false);

  // ── Phase 1: Danh sách vụ nuôi ──
  const [batches, setBatches] = useState<any[]>([]);
  const [batchTankFilter, setBatchTankFilter] = useState("");
  const [batchStatusFilter, setBatchStatusFilter] = useState("");
  const [showTankPicker, setShowTankPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Phase 2: Vụ nuôi đã chọn ──
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"feeding" | "mortality" | "maintenance">("feeding");

  // ── Dữ liệu từng tab ──
  const [feedTypes, setFeedTypes] = useState<any[]>([]);
  const [feedingLogs, setFeedingLogs] = useState<any[]>([]);
  const [mortalityLogs, setMortalityLogs] = useState<any[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // ── Modal cho ăn ──
  const [modalFeedingVisible, setModalFeedingVisible] = useState(false);
  const [selectedFeedId, setSelectedFeedId] = useState("");
  const [feedAmount, setFeedAmount] = useState("");
  const [editingFeedingId, setEditingFeedingId] = useState<string | null>(null);

  // ── Modal cá chết ──
  const [modalMortalityVisible, setModalMortalityVisible] = useState(false);
  const [deadAmount, setDeadAmount] = useState("");
  const [deadWeight, setDeadWeight] = useState("");
  const [editingMortalityId, setEditingMortalityId] = useState<string | null>(null);
  const [mortalityWarning, setMortalityWarning] = useState<string | null>(null);
  const [isSavingMortality, setIsSavingMortality] = useState(false);

  // ── Modal bảo trì ──
  const [modalMaintenanceVisible, setModalMaintenanceVisible] = useState(false);
  const [batchAlerts, setBatchAlerts] = useState<any[]>([]);
  const [batchAlertsLoading, setBatchAlertsLoading] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState("");
  const [maintenanceAction, setMaintenanceAction] = useState("");
  const [maintenanceNotes, setMaintenanceNotes] = useState("");
  const [isSavingMaintenance, setIsSavingMaintenance] = useState(false);

  // ─── Load danh sách vụ nuôi ───────────────────────────────────────────────

  const loadBatches = useCallback(async () => {
    try {
      const data = await operationsService.getAllBatchesForUI();
      setBatches(data);
    } catch (e) {
      console.error("Lỗi tải vụ nuôi:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  // Auto-select batch khi navigate từ batchDetail với paramBatchId
  useEffect(() => {
    if (!paramBatchId || batches.length === 0 || autoSelectedRef.current) return;
    const batch = batches.find((b) => b.id === paramBatchId);
    if (batch) {
      autoSelectedRef.current = true;
      handleSelectBatch(batch);
    }
  }, [paramBatchId, batches]);

  // ─── Load dữ liệu khi chọn vụ nuôi ──────────────────────────────────────

  const loadBatchTabData = async (batchId: string) => {
    setTabLoading(true);
    try {
      const [feedsData, feedingRes, mortalityRes, mLogs, stagesRes, user] =
        await Promise.all([
          operationsService.getFeedTypesForDropdown(),
          operationsApi.getFeedingLogsByBatch(batchId).catch(() => null),
          operationsApi.getMortalityLogs().catch(() => null),
          maintenanceService.getLogsByBatch(batchId).catch(() => []),
          batchApi.getBatchStages(batchId).catch(() => null),
          maintenanceService.getCurrentUser().catch(() => null),
        ]);

      setFeedTypes(feedsData);
      setCurrentUser(user);

      // Feeding logs — mới nhất trước
      const rawFeeding =
        feedingRes?.data?.data?.items || feedingRes?.data?.data || [];
      setFeedingLogs(
        rawFeeding
          .map((log: any) => ({
            id: log.id,
            farmingBatchId: log.farmingBatchId,
            feedTypeId: log.feedTypeId,
            feedName: log.feedTypeName || "Thức ăn hỗn hợp",
            amount: log.amount,
            rawDate: log.createdDate,
            time: log.createdDate
              ? new Date(log.createdDate).toLocaleString("vi-VN")
              : "N/A",
          }))
          .sort(
            (a: any, b: any) =>
              new Date(b.rawDate || 0).getTime() -
              new Date(a.rawDate || 0).getTime(),
          ),
      );

      // Mortality logs — filter client-side theo batchId, mới nhất trước
      const rawMortality =
        mortalityRes?.data?.data?.items || mortalityRes?.data?.data || [];
      setMortalityLogs(
        rawMortality
          .filter(
            (log: any) =>
              log.farmingBatchId === batchId || log.batchId === batchId,
          )
          .map((log: any) => ({
            id: log.id,
            quantity: log.quantity,
            lostWeightKg: log.lostWeightKg ?? null,
            rawDate: log.date,
            time: log.date
              ? new Date(log.date).toLocaleString("vi-VN")
              : "N/A",
          }))
          .sort(
            (a: any, b: any) =>
              new Date(b.rawDate || 0).getTime() -
              new Date(a.rawDate || 0).getTime(),
          ),
      );

      // Maintenance logs đã được filter + sort
      setMaintenanceLogs(mLogs);

      // Tìm giai đoạn hiện tại
      const stages =
        stagesRes?.data?.data || stagesRes?.data || [];
      setCurrentStage(findActiveStage(Array.isArray(stages) ? stages : []));
    } catch (e) {
      console.error("Lỗi tải dữ liệu tab:", e);
    } finally {
      setTabLoading(false);
    }
  };

  const handleSelectBatch = (batch: any) => {
    setSelectedBatch(batch);
    setActiveTab("feeding");
    loadBatchTabData(batch.id);
  };

  const handleBack = () => setSelectedBatch(null);

  // ─── Filter danh sách vụ nuôi ────────────────────────────────────────────

  const uniqueTankNames = useMemo(
    () =>
      Array.from(new Set(batches.map((b) => b.tankName).filter(Boolean))),
    [batches],
  );

  const filteredBatches = useMemo(() => {
    const statusOrder = (b: any) => {
      const s = String(b.status ?? "").toUpperCase().trim();
      if (s === "0" || s === "ACTIVE" || s === "ĐANG NUÔI") return 0;
      if (s === "1" || s === "PAUSED" || s === "TẠM DỪNG") return 1;
      if (s === "2" || s === "HARVESTED" || s === "THU HOẠCH" || s === "THU HOACH") return 2;
      return 3;
    };

    return batches
      .filter((b) => {
        const matchTank = !batchTankFilter || b.tankName === batchTankFilter;
        if (!matchTank) return false;
        if (!batchStatusFilter) return true;
        const s = String(b.status ?? "").toUpperCase().trim();
        if (batchStatusFilter === "0")
          return s === "0" || s === "ACTIVE" || s === "ĐANG NUÔI";
        if (batchStatusFilter === "1")
          return s === "1" || s === "PAUSED" || s === "TẠM DỪNG";
        if (batchStatusFilter === "2")
          return s === "2" || s === "HARVESTED" || s === "THU HOẠCH" || s === "THU HOACH";
        if (batchStatusFilter === "3")
          return s === "3" || s === "TERMINATED" || s === "ĐÃ HỦY";
        return true;
      })
      .sort((a, b) => statusOrder(a) - statusOrder(b));
  }, [batches, batchTankFilter, batchStatusFilter]);

  const tankFilterLabel = batchTankFilter || "Tất cả bể";
  const statusFilterLabel =
    BATCH_STATUS_OPTIONS.find((o) => o.value === batchStatusFilter)?.label ??
    "Tất cả";

  const batchHarvested = selectedBatch
    ? isHarvestedStatus(selectedBatch.status)
    : false;

  // ─── Feeding modal ───────────────────────────────────────────────────────

  const openFeedingModal = (log?: any) => {
    if (log) {
      setEditingFeedingId(log.id);
      setFeedAmount(String(log.amount ?? ""));
      setSelectedFeedId(log.feedTypeId || "");
    } else {
      setEditingFeedingId(null);
      setFeedAmount("");
      setSelectedFeedId("");
    }
    setModalFeedingVisible(true);
  };

  const handleSaveFeeding = async () => {
    if (!feedAmount || !selectedFeedId) {
      toast.warning("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }
    const parsedAmount = parseFloat(feedAmount.replace(",", "."));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Khối lượng không hợp lệ.");
      return;
    }
    try {
      const payload = {
        feedTypeId: selectedFeedId,
        amount: parsedAmount,
        createdDate: new Date().toISOString(),
      };
      await operationsApi.postFeeding(selectedBatch.id, payload);
      toast.success(
        editingFeedingId
          ? "Đã cập nhật lịch sử cho ăn."
          : "Đã lưu vào lịch sử cho ăn.",
      );
      setModalFeedingVisible(false);
      loadBatchTabData(selectedBatch.id);
    } catch (e) {
      toast.error("Không thể lưu dữ liệu.");
    }
  };

  // ─── Mortality modal ─────────────────────────────────────────────────────

  const openMortalityModal = (log?: any) => {
    if (log) {
      setEditingMortalityId(log.id);
      setDeadAmount(String(log.quantity ?? ""));
      setDeadWeight(String(log.lostWeightKg ?? ""));
    } else {
      setEditingMortalityId(null);
      setDeadAmount("");
      setDeadWeight("");
    }
    setMortalityWarning(null);
    setModalMortalityVisible(true);
  };

  const doSaveMortality = async () => {
    const parsedQuantity = parseInt(deadAmount, 10);
    const parsedWeight = parseFloat(deadWeight);
    setIsSavingMortality(true);
    try {
      const payload = {
        quantity: parsedQuantity,
        lostWeightKg: parsedWeight,
        date: new Date().toISOString(),
      };
      if (editingMortalityId) {
        await operationsApi.putMortalityLog(editingMortalityId, payload);
      } else {
        await operationsApi.postMortalityLog(selectedBatch.id, payload);
      }
      setModalMortalityVisible(false);
      setMortalityWarning(null);
      loadBatchTabData(selectedBatch.id);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể lưu dữ liệu.",
      );
    } finally {
      setIsSavingMortality(false);
    }
  };

  const handleSaveMortality = async () => {
    if (!deadAmount || !deadWeight) {
      toast.warning("Vui lòng nhập số lượng và khối lượng cá chết.");
      return;
    }
    const parsedQuantity = parseInt(deadAmount, 10);
    const parsedWeight = parseFloat(deadWeight);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      toast.error("Số lượng cá chết phải là số nguyên dương.");
      return;
    }
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      toast.error("Khối lượng phải là số dương.");
      return;
    }
    if (editingMortalityId) {
      await doSaveMortality();
      return;
    }
    if (mortalityWarning === null) {
      setIsSavingMortality(true);
      try {
        const res = await operationsApi.validateMortalityLog(selectedBatch.id, {
          quantity: parsedQuantity,
          lostWeightKg: parsedWeight,
          date: new Date().toISOString(),
        });
        const payload = (res.data?.data ?? res.data) as {
          isWithinRange?: boolean;
          message?: string;
        };
        if (!payload?.isWithinRange) {
          setMortalityWarning(
            payload?.message ||
              "Số liệu vượt ngưỡng cho phép. Nhấn 'Xác nhận & Lưu' để tiếp tục.",
          );
          setIsSavingMortality(false);
          return;
        }
      } catch {
        // validate lỗi → tiếp tục lưu
      }
      setIsSavingMortality(false);
    }
    await doSaveMortality();
  };

  // ─── Maintenance modal ───────────────────────────────────────────────────

  const openMaintenanceModal = async () => {
    setSelectedAlertId("");
    setMaintenanceAction("");
    setMaintenanceNotes("");
    setBatchAlertsLoading(true);
    setModalMaintenanceVisible(true);
    try {
      const res = await alertApi.getAllAlerts(1, 100);
      const all = res.data?.data?.items || res.data?.data || [];
      const filtered = all
        .filter(
          (a: any) =>
            a.farmingBatchId === selectedBatch?.id &&
            String(a.status).toUpperCase() === "ACKNOWLEDGED",
        )
        .map((a: any) => ({
          label: `Cảnh báo ${a.sensorTypeName || "hệ thống"} — ${a.fishTankName || ""}`,
          value: a.id,
        }));
      setBatchAlerts(filtered);
    } catch {
      setBatchAlerts([]);
    } finally {
      setBatchAlertsLoading(false);
    }
  };

  const handleSaveMaintenance = async () => {
    if (!selectedAlertId) {
      toast.warning("Vui lòng chọn cảnh báo cần xử lý.");
      return;
    }
    if (!maintenanceAction.trim()) {
      toast.warning("Vui lòng điền hành động khắc phục.");
      return;
    }
    setIsSavingMaintenance(true);
    try {
      await maintenanceService.createLog({
        alertId: selectedAlertId,
        userId: currentUser?.id,
        actionTaken: maintenanceAction.trim(),
        notes: maintenanceNotes.trim(),
      });
      setModalMaintenanceVisible(false);
      toast.success("Đã ghi nhận nhật ký và đóng sự cố!");
      loadBatchTabData(selectedBatch.id);
    } catch {
      toast.error("Không thể lưu nhật ký bảo trì.");
    } finally {
      setIsSavingMaintenance(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 2: Đã chọn vụ nuôi
  // ══════════════════════════════════════════════════════════════════════════
  if (selectedBatch) {
    const statusInfo = getBatchStatusInfo(selectedBatch.status);
    const tabSectionTitle =
      activeTab === "feeding"
        ? "Lịch sử ghi nhận cho ăn"
        : activeTab === "mortality"
          ? "Lịch sử ghi nhận cá chết"
          : "Quản lý bảo trì";
    const tabData =
      activeTab === "feeding"
        ? feedingLogs
        : activeTab === "mortality"
          ? mortalityLogs
          : maintenanceLogs;

    // Warning: lượng thức ăn vượt đề xuất giai đoạn
    const feedExceedsRecommendation =
      !!currentStage?.estimatedDailyFeedKg &&
      !!feedAmount &&
      parseFloat(feedAmount) > (currentStage.estimatedDailyFeedKg as number);

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        {/* HEADER VỤ NUÔI */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 15,
            backgroundColor: "#FFF",
            borderBottomWidth: 1,
            borderBottomColor: "#F1F5F9",
          }}
        >
          <TouchableOpacity
            onPress={handleBack}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={theme.colors.primary}
            />
            <Text
              style={{
                color: theme.colors.primary,
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              Danh sách vụ nuôi
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text
                style={{ fontSize: 17, fontWeight: "700", color: "#1E293B" }}
                numberOfLines={1}
              >
                {selectedBatch.name || selectedBatch.batchName}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 4,
                  gap: 8,
                }}
              >
                <Ionicons name="water-outline" size={13} color="#64748B" />
                <Text style={{ fontSize: 12, color: "#64748B" }}>
                  {selectedBatch.tankName}
                </Text>
              </View>
            </View>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: statusInfo.bg,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: statusInfo.color,
                }}
              >
                {statusInfo.label}
              </Text>
            </View>
          </View>

          {/* 3 TABS */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#E2E8F0",
              borderRadius: 12,
              padding: 4,
              marginTop: 14,
            }}
          >
            {(
              [
                { key: "feeding", label: "Thức ăn", color: theme.colors.primary },
                { key: "mortality", label: "Thiệt hại", color: theme.colors.danger },
                { key: "maintenance", label: "Bảo trì", color: "#10B981" },
              ] as const
            ).map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  {
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 9,
                    alignItems: "center",
                  },
                  activeTab === tab.key && {
                    backgroundColor: "#FFF",
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOpacity: 0.08,
                  },
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: 13,
                    color: activeTab === tab.key ? tab.color : "#64748B",
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* NỘI DUNG TAB */}
        {tabLoading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ color: "#64748B", marginTop: 8 }}>
              Đang tải dữ liệu...
            </Text>
          </View>
        ) : (
          <FlatList
            data={tabData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  loadBatchTabData(selectedBatch.id).finally(() =>
                    setRefreshing(false),
                  );
                }}
              />
            }
            ListHeaderComponent={() => (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#1E293B",
                  }}
                >
                  {tabSectionTitle}
                </Text>
                <Text style={{ fontSize: 12, color: "#64748B" }}>
                  {tabData.length} bản ghi
                </Text>
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={{ alignItems: "center", marginTop: 50 }}>
                <MaterialCommunityIcons
                  name={
                    activeTab === "feeding"
                      ? "fishbowl-outline"
                      : activeTab === "mortality"
                        ? "skull-outline"
                        : "clipboard-text-outline"
                  }
                  size={52}
                  color="#CBD5E1"
                />
                <Text
                  style={{ color: "#64748B", marginTop: 10, fontSize: 14 }}
                >
                  Chưa có ghi nhận nào
                </Text>
              </View>
            )}
            renderItem={({ item }) => {
              if (activeTab === "feeding") {
                return (
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View
                        style={[styles.iconBox, { backgroundColor: "#DBEAFE" }]}
                      >
                        <MaterialCommunityIcons
                          name="fishbowl-outline"
                          size={24}
                          color={theme.colors.primary}
                        />
                      </View>
                      <View style={styles.cardContent}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {item.feedName}
                        </Text>
                        <Text style={styles.cardSubTitle}>{item.time}</Text>
                        <View style={styles.detailContainer}>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Khối lượng:</Text>
                            <Text style={styles.detailValue}>
                              {item.amount} kg
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              }
              if (activeTab === "mortality") {
                return (
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View
                        style={[styles.iconBox, { backgroundColor: "#FEE2E2" }]}
                      >
                        <MaterialCommunityIcons
                          name="skull-outline"
                          size={24}
                          color={theme.colors.danger}
                        />
                      </View>
                      <View style={styles.cardContent}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          Ghi nhận cá chết
                        </Text>
                        <Text style={styles.cardSubTitle}>{item.time}</Text>
                        <View style={styles.detailContainer}>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Số lượng:</Text>
                            <Text
                              style={[
                                styles.detailValue,
                                { color: theme.colors.danger },
                              ]}
                            >
                              {item.quantity} con
                            </Text>
                          </View>
                          {item.lostWeightKg != null && (
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Khối lượng:</Text>
                              <Text
                                style={[
                                  styles.detailValue,
                                  { color: theme.colors.danger },
                                ]}
                              >
                                {item.lostWeightKg} kg
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                );
              }
              // maintenance — bấm vào để xem/sửa nhật ký
              return (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() =>
                    router.push({
                      pathname: "/maintenance/log",
                      params: {
                        id: item.alertId,
                        logId: item.id,
                        mode: "view",
                      },
                    })
                  }
                >
                  <View style={styles.cardHeader}>
                    <View
                      style={[styles.iconBox, { backgroundColor: "#F0FDF4" }]}
                    >
                      <MaterialCommunityIcons
                        name="clipboard-check-outline"
                        size={24}
                        color="#10B981"
                      />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.actionTaken || "Hành động khắc phục"}
                      </Text>
                      <Text style={styles.cardSubTitle}>{item.time}</Text>
                      {item.notes ? (
                        <View style={styles.detailContainer}>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Ghi chú:</Text>
                            <Text
                              style={[styles.detailValue, { color: "#475569" }]}
                              numberOfLines={2}
                            >
                              {item.notes}
                            </Text>
                          </View>
                        </View>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#CBD5E1" style={{ marginLeft: 6 }} />
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* FAB — tất cả 3 tab khi vụ đang hoạt động */}
        {!batchHarvested && (
          <TouchableOpacity
            style={[
              styles.fab,
              activeTab === "mortality" && {
                backgroundColor: theme.colors.danger,
              },
              activeTab === "maintenance" && { backgroundColor: "#10B981" },
            ]}
            onPress={() => {
              if (activeTab === "feeding") openFeedingModal();
              else if (activeTab === "mortality") openMortalityModal();
              else openMaintenanceModal();
            }}
          >
            <Ionicons name="add" size={32} color="#FFF" />
          </TouchableOpacity>
        )}

        {/* Banner vụ đã thu hoạch */}
        {batchHarvested && (
          <View
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              right: 20,
              backgroundColor: "#FEF2F2",
              borderRadius: 12,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#FECACA",
            }}
          >
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={theme.colors.danger}
            />
            <Text
              style={{
                marginLeft: 8,
                color: theme.colors.danger,
                fontWeight: "600",
                fontSize: 13,
              }}
            >
              Vụ đã thu hoạch — không thể thêm ghi nhận mới
            </Text>
          </View>
        )}

        {/* ══════ MODAL CHO ĂN ══════ */}
        <Modal visible={modalFeedingVisible} animationType="slide" transparent>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingFeedingId ? "Sửa ghi nhận" : "Thêm cho ăn mới"}
                </Text>
                <TouchableOpacity
                  onPress={() => setModalFeedingVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Vụ nuôi — read-only */}
                <Text style={styles.label}>Vụ nuôi</Text>
                <View
                  style={[
                    styles.input,
                    { backgroundColor: "#F8FAFC", justifyContent: "center" },
                  ]}
                >
                  <Text style={{ color: "#64748B", fontSize: 14 }}>
                    {selectedBatch?.name || selectedBatch?.batchName}
                  </Text>
                </View>

                {/* Banner giai đoạn hiện tại */}
                {currentStage && (
                  <View
                    style={{
                      marginTop: 12,
                      padding: 12,
                      backgroundColor: "#EFF6FF",
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: "#BFDBFE",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "700",
                        color: theme.colors.primary,
                        fontSize: 13,
                        marginBottom: 4,
                      }}
                    >
                      {currentStage.stageName}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#475569" }}>
                      Loại cám:{" "}
                      {currentStage.feedTypeNames?.join(", ") ||
                        "Chưa xác định"}
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: "#475569", marginTop: 2 }}
                    >
                      Đề xuất:{" "}
                      {currentStage.estimatedDailyFeedKg?.toFixed(2)} kg/ngày
                      · {currentStage.frequencyPerDay} lần/ngày
                    </Text>
                  </View>
                )}

                <Text style={styles.label}>Loại thức ăn *</Text>
                <Dropdown
                  style={styles.dropdown}
                  data={feedTypes}
                  labelField="label"
                  valueField="value"
                  placeholder="Chọn loại cám..."
                  value={selectedFeedId}
                  onChange={(i) => setSelectedFeedId(i.value)}
                />

                <Text style={styles.label}>Khối lượng (kg) *</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  value={feedAmount}
                  onChangeText={(t) => setFeedAmount(t.replace(",", "."))}
                  placeholder="Ví dụ: 7.2"
                  returnKeyType="done"
                />

                {/* Warning nếu vượt đề xuất */}
                {feedExceedsRecommendation && (
                  <View
                    style={{
                      marginTop: 8,
                      padding: 10,
                      backgroundColor: "#FFF7ED",
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#FED7AA",
                      flexDirection: "row",
                      gap: 6,
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>⚠️</Text>
                    <Text
                      style={{ flex: 1, fontSize: 12, color: "#B45309" }}
                    >
                      Lượng nhập ({feedAmount} kg) vượt đề xuất giai đoạn (
                      {currentStage?.estimatedDailyFeedKg?.toFixed(2)} kg/ngày).
                    </Text>
                  </View>
                )}

                <View style={{ height: 20 }} />
              </ScrollView>
              <TouchableOpacity
                style={styles.btnSave}
                onPress={handleSaveFeeding}
              >
                <Text style={styles.btnTextSave}>
                  {editingFeedingId ? "Cập nhật" : "Lưu vào lịch sử"}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* ══════ MODAL CÁ CHẾT ══════ */}
        <Modal
          visible={modalMortalityVisible}
          animationType="slide"
          transparent
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingMortalityId
                    ? "Chỉnh sửa cá chết"
                    : "Ghi nhận cá chết"}
                </Text>
                <TouchableOpacity
                  onPress={() => setModalMortalityVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Vụ nuôi — read-only */}
                <Text style={styles.label}>Vụ nuôi</Text>
                <View
                  style={[
                    styles.input,
                    { backgroundColor: "#F8FAFC", justifyContent: "center" },
                  ]}
                >
                  <Text style={{ color: "#64748B", fontSize: 14 }}>
                    {selectedBatch?.name || selectedBatch?.batchName}
                  </Text>
                </View>

                <Text style={styles.label}>Số lượng cá chết (con) *</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={deadAmount}
                  onChangeText={(v) => {
                    setDeadAmount(v);
                    setMortalityWarning(null);
                  }}
                  placeholder="Ví dụ: 3"
                  returnKeyType="next"
                />
                <Text style={styles.label}>Khối lượng cá chết (kg) *</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  value={deadWeight}
                  onChangeText={(t) => {
                    setDeadWeight(t.replace(",", "."));
                    setMortalityWarning(null);
                  }}
                  placeholder="Ví dụ: 0.5"
                  returnKeyType="done"
                />

                {mortalityWarning && (
                  <View
                    style={{
                      marginTop: 12,
                      padding: 12,
                      backgroundColor: "#FFF7ED",
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: "#FED7AA",
                      flexDirection: "row",
                      gap: 8,
                    }}
                  >
                    <Text style={{ fontSize: 16, marginTop: 1 }}>⚠️</Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontWeight: "700",
                          color: "#B45309",
                          fontSize: 13,
                          marginBottom: 2,
                        }}
                      >
                        Cảnh báo vượt ngưỡng
                      </Text>
                      <Text
                        style={{
                          color: "#92400E",
                          fontSize: 12,
                          lineHeight: 18,
                        }}
                      >
                        {mortalityWarning}
                      </Text>
                      <Text
                        style={{
                          color: "#92400E",
                          fontSize: 12,
                          marginTop: 4,
                          fontStyle: "italic",
                        }}
                      >
                        Bấm &quot;Xác nhận &amp; Lưu&quot; để tiếp tục.
                      </Text>
                    </View>
                  </View>
                )}
                <View style={{ height: 16 }} />
              </ScrollView>
              <TouchableOpacity
                style={[
                  styles.btnSave,
                  {
                    backgroundColor: isSavingMortality
                      ? "#9CA3AF"
                      : theme.colors.danger,
                  },
                ]}
                onPress={isSavingMortality ? undefined : handleSaveMortality}
                disabled={isSavingMortality}
              >
                <Text style={styles.btnTextSave}>
                  {isSavingMortality
                    ? "Đang xử lý..."
                    : mortalityWarning
                      ? "Xác nhận & Lưu"
                      : editingMortalityId
                        ? "Cập nhật"
                        : "Lưu hệ thống"}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* ══════ MODAL BẢO TRÌ ══════ */}
        <Modal
          visible={modalMaintenanceVisible}
          animationType="slide"
          transparent
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Ghi nhật ký bảo trì</Text>
                <TouchableOpacity
                  onPress={() => setModalMaintenanceVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Vụ nuôi — read-only */}
                <Text style={styles.label}>Vụ nuôi</Text>
                <View
                  style={[
                    styles.input,
                    { backgroundColor: "#F8FAFC", justifyContent: "center" },
                  ]}
                >
                  <Text style={{ color: "#64748B", fontSize: 14 }}>
                    {selectedBatch?.name || selectedBatch?.batchName}
                  </Text>
                </View>

                {/* Alert dropdown — chỉ các cảnh báo đang xử lý */}
                <Text style={styles.label}>Cảnh báo cần xử lý *</Text>
                {batchAlertsLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                    style={{ marginVertical: 12 }}
                  />
                ) : batchAlerts.length === 0 ? (
                  <View
                    style={{
                      padding: 14,
                      backgroundColor: "#F8FAFC",
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#64748B", fontSize: 13 }}>
                      Không có cảnh báo đang xử lý trong vụ nuôi này
                    </Text>
                  </View>
                ) : (
                  <Dropdown
                    style={styles.dropdown}
                    data={batchAlerts}
                    labelField="label"
                    valueField="value"
                    placeholder="Chọn cảnh báo..."
                    value={selectedAlertId}
                    onChange={(item) => setSelectedAlertId(item.value)}
                  />
                )}

                <Text style={styles.label}>
                  Hành động khắc phục{" "}
                  <Text style={{ color: theme.colors.danger }}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      height: 90,
                      textAlignVertical: "top",
                      paddingTop: 12,
                    },
                  ]}
                  multiline
                  placeholder="Mô tả hành động đã thực hiện để xử lý sự cố..."
                  value={maintenanceAction}
                  onChangeText={setMaintenanceAction}
                />

                <Text style={styles.label}>Ghi chú thêm</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      height: 70,
                      textAlignVertical: "top",
                      paddingTop: 12,
                    },
                  ]}
                  multiline
                  placeholder="Ghi chú bổ sung (không bắt buộc)..."
                  value={maintenanceNotes}
                  onChangeText={setMaintenanceNotes}
                />
                <View style={{ height: 16 }} />
              </ScrollView>
              <TouchableOpacity
                style={[
                  styles.btnSave,
                  {
                    backgroundColor:
                      isSavingMaintenance || batchAlerts.length === 0
                        ? "#9CA3AF"
                        : "#10B981",
                  },
                ]}
                onPress={
                  isSavingMaintenance || batchAlerts.length === 0
                    ? undefined
                    : handleSaveMaintenance
                }
                disabled={isSavingMaintenance || batchAlerts.length === 0}
              >
                <Text style={styles.btnTextSave}>
                  {isSavingMaintenance ? "Đang lưu..." : "Lưu & Đóng sự cố"}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 1: Danh sách vụ nuôi
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Vận hành</Text>
            <Text style={styles.headerSubTitle}>Chọn vụ nuôi để xem chi tiết</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F1F5F9",
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              gap: 6,
            }}
            onPress={() => setShowTankPicker(true)}
          >
            <Ionicons
              name="water-outline"
              size={14}
              color={theme.colors.primary}
            />
            <Text
              style={{
                flex: 1,
                fontSize: 13,
                fontWeight: "600",
                color: "#475569",
              }}
              numberOfLines={1}
            >
              {tankFilterLabel}
            </Text>
            <Ionicons name="chevron-down" size={13} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F1F5F9",
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              gap: 6,
            }}
            onPress={() => setShowStatusPicker(true)}
          >
            <Ionicons
              name="funnel-outline"
              size={14}
              color={theme.colors.primary}
            />
            <Text
              style={{
                flex: 1,
                fontSize: 13,
                fontWeight: "600",
                color: "#475569",
              }}
              numberOfLines={1}
            >
              {statusFilterLabel}
            </Text>
            <Ionicons name="chevron-down" size={13} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* DANH SÁCH VỤ NUÔI */}
      <FlatList
        data={filteredBatches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadBatches();
            }}
          />
        }
        ListHeaderComponent={() => (
          <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>
            {filteredBatches.length} vụ nuôi
          </Text>
        )}
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <MaterialCommunityIcons name="fish" size={60} color="#CBD5E1" />
            <Text style={{ color: "#64748B", marginTop: 12 }}>
              Không tìm thấy vụ nuôi phù hợp
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const statusInfo = getBatchStatusInfo(item.status);
          return (
            <TouchableOpacity
              style={[
                styles.card,
                {
                  borderLeftWidth: 4,
                  borderLeftColor: statusInfo.color,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingRight: 12,
                },
              ]}
              onPress={() => handleSelectBatch(item)}
            >
              {/* Icon giống dashboard */}
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: statusInfo.bg, marginRight: 12 },
                ]}
              >
                <MaterialCommunityIcons
                  name="fish"
                  size={24}
                  color={statusInfo.color}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.name || item.batchName}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 4,
                    gap: 6,
                  }}
                >
                  <Ionicons name="water-outline" size={12} color="#64748B" />
                  <Text style={{ fontSize: 12, color: "#64748B" }}>
                    {item.tankName}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  backgroundColor: statusInfo.bg,
                  marginLeft: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: statusInfo.color,
                  }}
                >
                  {statusInfo.label}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#CBD5E1"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          );
        }}
      />

      {/* TANK PICKER */}
      <Modal visible={showTankPicker} transparent animationType="fade">
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
          activeOpacity={1}
          onPress={() => setShowTankPicker(false)}
        >
          <View
            style={{
              backgroundColor: "#FFF",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#1E293B",
                marginBottom: 14,
              }}
            >
              Chọn bể nuôi
            </Text>
            {[
              { label: "Tất cả bể", value: "" },
              ...uniqueTankNames.map((t) => ({ label: t, value: t })),
            ].map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: "#F1F5F9",
                }}
                onPress={() => {
                  setBatchTankFilter(opt.value);
                  setShowTankPicker(false);
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color:
                      batchTankFilter === opt.value
                        ? theme.colors.primary
                        : "#1E293B",
                    fontWeight:
                      batchTankFilter === opt.value ? "700" : "400",
                  }}
                >
                  {opt.label}
                </Text>
                {batchTankFilter === opt.value && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={theme.colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* STATUS PICKER */}
      <Modal visible={showStatusPicker} transparent animationType="fade">
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
          activeOpacity={1}
          onPress={() => setShowStatusPicker(false)}
        >
          <View
            style={{
              backgroundColor: "#FFF",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#1E293B",
                marginBottom: 14,
              }}
            >
              Trạng thái vụ nuôi
            </Text>
            {BATCH_STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: "#F1F5F9",
                }}
                onPress={() => {
                  setBatchStatusFilter(opt.value);
                  setShowStatusPicker(false);
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color:
                      batchStatusFilter === opt.value
                        ? theme.colors.primary
                        : "#1E293B",
                    fontWeight:
                      batchStatusFilter === opt.value ? "700" : "400",
                  }}
                >
                  {opt.label}
                </Text>
                {batchStatusFilter === opt.value && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={theme.colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

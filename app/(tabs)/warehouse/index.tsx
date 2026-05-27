import { theme } from "@/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
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
  StyleSheet,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { operationsService } from "@/services/operationsService";
import { operationsApi } from "@/api/operationsApi";
import { styles } from "@/styles/operations/operations.styles";
import axiosClient from "@/api/axiosClient";
import { toast } from "@/utils/toast";

export default function OperationsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [feedTypes, setFeedTypes] = useState<any[]>([]);
  const [feedingLogs, setFeedingLogs] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<
    "feeding" | "mortality" | "history"
  >("feeding");
  const [historySubTab, setHistorySubTab] = useState<"feed_hist" | "dead_hist">(
    "feed_hist",
  );

  const [modalFeedingVisible, setModalFeedingVisible] = useState(false);
  const [modalMortalityVisible, setModalMortalityVisible] = useState(false);

  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedFeedId, setSelectedFeedId] = useState("");
  const [feedAmount, setFeedAmount] = useState("");
  const [deadAmount, setDeadAmount] = useState("");
  const [deadWeight, setDeadWeight] = useState(""); // khối lượng cá chết (kg)
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [mortalityLogs, setMortalityLogs] = useState<any[]>([]);
  const [editingMortalityId, setEditingMortalityId] = useState<string | null>(
    null,
  );

  // Cảnh báo inline bên trong modal (giống web) — null = không có cảnh báo
  const [mortalityWarning, setMortalityWarning] = useState<string | null>(null);
  const [isSavingMortality, setIsSavingMortality] = useState(false);

  const loadInitialData = async () => {
    try {
      const [batchesData, feedsData, logsData, mortalityData] =
        await Promise.all([
          operationsService.getAllBatchesForUI(),
          operationsService.getFeedTypesForDropdown(),
          operationsService.getFeedingHistory(),
          operationsService.getMortalityHistory(),
        ]);
      setBatches(batchesData);
      setFeedTypes(feedsData);
      setFeedingLogs(logsData);
      setMortalityLogs(mortalityData);
    } catch (error) {
      console.error("Lỗi kết nối dữ liệu thật:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const openFeedingModal = (log?: any) => {
    if (log) {
      setEditingLogId(log.id);
      setSelectedBatchId(log.farmingBatchId || "");
      setFeedAmount(log.amount?.toString().replace("kg", "") || "");
      setSelectedFeedId(log.feedTypeId || "");
    } else {
      setEditingLogId(null);
      setSelectedBatchId("");
      setFeedAmount("");
      setSelectedFeedId("");
    }
    setModalFeedingVisible(true);
  };

  const handleSaveFeeding = async () => {
    if (!selectedBatchId || !feedAmount || !selectedFeedId) {
      toast.warning("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    try {
      const sanitizedAmount = feedAmount.replace(",", ".");
      const parsedAmount = parseFloat(sanitizedAmount);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        toast.error("Khối lượng không hợp lệ.");
        return;
      }

      // Payload mới KHÔNG CẦN farmingBatchId nữa
      const payload = {
        feedTypeId: selectedFeedId,
        amount: parsedAmount,
        createdDate: new Date().toISOString(),
      };

      if (editingLogId) {
        // (Ghi chú: Hiện Backend của bạn chưa có API PUT để sửa lịch sử đâu nhé)
        await axiosClient.put(`/feeding-logs/${editingLogId}`, payload);
        toast.success("Đã cập nhật lịch sử cho ăn.");
      } else {
        // SỬA DÒNG NÀY: Truyền selectedBatchId vào hàm postFeeding
        await operationsApi.postFeeding(selectedBatchId, payload);
        toast.success("Đã lưu vào lịch sử cho ăn.");
      }

      setModalFeedingVisible(false);
      loadInitialData();
    } catch (error: any) {
      toast.error("Không thể lưu dữ liệu.");
      console.error(error);
    }
  };

  const openMortalityModal = (log?: any) => {
    if (log) {
      setEditingMortalityId(log.id);
      setSelectedBatchId(log.batchId || "");
      setDeadAmount(log.quantity?.toString() || "");
      setDeadWeight(log.lostWeightKg?.toString() || "");
    } else {
      setEditingMortalityId(null);
      setSelectedBatchId("");
      setDeadAmount("");
      setDeadWeight("");
    }
    setMortalityWarning(null); // reset cảnh báo mỗi lần mở modal
    setModalMortalityVisible(true);
  };

  /** Thực sự gọi API lưu cá chết (sau khi đã validate / xác nhận cảnh báo) */
  const doSaveMortality = async () => {
    const parsedQuantity = parseInt(deadAmount, 10);
    const parsedWeight = parseFloat(deadWeight);
    const date = new Date().toISOString();
    const payload = {
      quantity: parsedQuantity,
      lostWeightKg: parsedWeight,
      date,
    };

    setIsSavingMortality(true);
    try {
      if (editingMortalityId) {
        await operationsApi.putMortalityLog(editingMortalityId, payload);
      } else {
        await operationsApi.postMortalityLog(selectedBatchId, payload);
      }
      setModalMortalityVisible(false);
      setMortalityWarning(null);
      loadInitialData();
    } catch (err: any) {
      // Hiển thị lỗi thật từ backend để dễ debug
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        "Không thể lưu dữ liệu. Vui lòng thử lại.";
      toast.error(errMsg);
    } finally {
      setIsSavingMortality(false);
    }
  };

  /**
   * Luồng ghi nhận cá chết:
   * 1. Validate → isWithinRange=false → mở custom warning modal
   * 2. Người dùng xác nhận → doSaveMortality()
   */
  const handleSaveMortality = async () => {
    if (!selectedBatchId || !deadAmount || !deadWeight) {
      toast.warning(
        "Vui lòng nhập đủ: lô nuôi, số lượng (con) và khối lượng (kg).",
      );
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

    setIsSavingMortality(true);
    const date = new Date().toISOString();

    // --- BLOCK 1: Validate (best-effort) — chỉ chạy khi chưa có cảnh báo ---
    // Lần nhấn thứ 2 (mortalityWarning !== null) → bỏ qua validate, xuống block lưu luôn
    if (mortalityWarning === null) {
      try {
        const res = await operationsApi.validateMortalityLog(selectedBatchId, {
          quantity: parsedQuantity,
          lostWeightKg: parsedWeight,
          date,
        });

        // axiosClient trả về res.data = body gốc của API
        // Backend có thể wrap trong { data: {...} } hoặc trả thẳng
        const payload = (res.data?.data ?? res.data) as {
          isWithinRange?: boolean;
          message?: string;
        };

        if (!payload?.isWithinRange) {
          // Hiển thị inline warning bên trong modal (giống web)
          setMortalityWarning(
            payload?.message ||
              "Số liệu vượt ngưỡng cho phép. Nhấn 'Xác nhận & Lưu' để tiếp tục.",
          );
          setIsSavingMortality(false);
          return; // Dừng lại, chờ người dùng xác nhận lần 2
        }
      } catch (validateErr) {
        // Validate lỗi (400/500/network) → bỏ qua, vẫn tiến hành lưu
        console.warn("Validate endpoint lỗi, tiếp tục lưu:", validateErr);
      }
    }

    // --- BLOCK 2: Lưu dữ liệu ---
    await doSaveMortality();
  };

  // --- LOGIC KIỂM TRA TRẠNG THÁI THU HOẠCH ---
  const selectedBatchInfo = batches.find((b) => b.id === selectedBatchId);
  const isBatchHarvested = () => {
    if (!selectedBatchInfo || !selectedBatchInfo.status) return false;
    const statusStr = String(selectedBatchInfo.status).toUpperCase().trim();
    return (
      statusStr === "2" ||
      statusStr === "HARVESTED" ||
      statusStr === "THU HOACH" ||
      statusStr === "THU HOẠCH"
    );
  };
  const isHarvested = isBatchHarvested();
  // ------------------------------------------

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Vận hành</Text>
            <Text style={styles.headerSubTitle}>Quản lý hoạt động hồ nuôi</Text>
          </View>
        </View>

        <View style={styles.filterGroupCentered}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeTab === "feeding" && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            onPress={() => setActiveTab("feeding")}
          >
            <Text
              style={{
                color: activeTab === "feeding" ? "#FFF" : theme.colors.primary,
                fontWeight: "600",
              }}
            >
              Cho ăn
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeTab === "mortality" && {
                backgroundColor: theme.colors.danger,
              },
            ]}
            onPress={() => setActiveTab("mortality")}
          >
            <Text
              style={{
                color: activeTab === "mortality" ? "#FFF" : theme.colors.danger,
                fontWeight: "600",
              }}
            >
              Cá chết
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeTab === "history" && { backgroundColor: "#64748B" },
            ]}
            onPress={() => setActiveTab("history")}
          >
            <Text
              style={{
                color: activeTab === "history" ? "#FFF" : "#64748B",
                fontWeight: "600",
              }}
            >
              Lịch sử
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === "history" && (
        <View style={styles.subTabContainer}>
          <TouchableOpacity
            onPress={() => setHistorySubTab("feed_hist")}
            style={[
              styles.subTabItem,
              historySubTab === "feed_hist" && styles.subTabActive,
            ]}
          >
            <Text
              style={[
                styles.subTabText,
                historySubTab === "feed_hist" && styles.subTabTextActive,
              ]}
            >
              Lịch sử cho ăn
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setHistorySubTab("dead_hist")}
            style={[
              styles.subTabItem,
              historySubTab === "dead_hist" && styles.subTabActive,
            ]}
          >
            <Text
              style={[
                styles.subTabText,
                historySubTab === "dead_hist" && styles.subTabTextActive,
              ]}
            >
              Lịch sử cá chết
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={
          activeTab === "feeding"
            ? feedingLogs
            : activeTab === "mortality"
              ? mortalityLogs
              : activeTab === "history"
                ? historySubTab === "feed_hist"
                  ? feedingLogs
                  : mortalityLogs
                : batches
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadInitialData();
            }}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor:
                      activeTab === "mortality" ||
                      (activeTab === "history" && historySubTab === "dead_hist")
                        ? "#FEE2E2"
                        : "#DBEAFE",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    activeTab === "mortality" ||
                    (activeTab === "history" && historySubTab === "dead_hist")
                      ? "skull-outline"
                      : "fishbowl-outline"
                  }
                  size={24}
                  color={
                    activeTab === "mortality" ||
                    (activeTab === "history" && historySubTab === "dead_hist")
                      ? theme.colors.danger
                      : theme.colors.primary
                  }
                />
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.tank || item.batchName || item.name}
                </Text>
                <Text style={styles.cardSubTitle}>
                  {item.time || item.crop}
                </Text>

                {(activeTab === "feeding" ||
                  activeTab === "mortality" ||
                  activeTab === "history") && (
                  <View style={styles.detailContainer}>
                    {/* Loại thức ăn — chỉ hiện khi tab cho ăn */}
                    {(activeTab === "feeding" ||
                      (activeTab === "history" &&
                        historySubTab === "feed_hist")) && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Loại:</Text>
                        <Text style={styles.detailValue} numberOfLines={1}>
                          {item.feedName || "Thức ăn hỗn hợp"}
                        </Text>
                      </View>
                    )}

                    {/* Số lượng / Khối lượng thức ăn */}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>
                        {activeTab === "mortality" ||
                        (activeTab === "history" &&
                          historySubTab === "dead_hist")
                          ? "Số lượng:"
                          : "Khối lượng:"}
                      </Text>
                      <Text
                        style={[
                          styles.detailValue,
                          {
                            color:
                              activeTab === "mortality" ||
                              (activeTab === "history" &&
                                historySubTab === "dead_hist")
                                ? theme.colors.danger
                                : "#1E293B",
                          },
                        ]}
                      >
                        {activeTab === "mortality" ||
                        (activeTab === "history" &&
                          historySubTab === "dead_hist")
                          ? `${item.quantity ?? item.amount ?? 0} con`
                          : `${item.amount} kg`}
                      </Text>
                    </View>

                    {/* Khối lượng cá chết (kg) — chỉ hiện khi tab mortality */}
                    {(activeTab === "mortality" ||
                      (activeTab === "history" &&
                        historySubTab === "dead_hist")) &&
                      item.lostWeightKg != null && (
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
                )}
              </View>
            </View>
          </View>
        )}
      />

      {(activeTab === "feeding" || activeTab === "mortality") && (
        <TouchableOpacity
          style={[
            styles.fab,
            activeTab === "mortality" && {
              backgroundColor: theme.colors.danger,
            },
          ]}
          onPress={() =>
            activeTab === "feeding" ? openFeedingModal() : openMortalityModal()
          }
        >
          <Ionicons name="add" size={32} color="#FFF" />
        </TouchableOpacity>
      )}

      {/* --- MODAL CHO ĂN --- */}
      <Modal visible={modalFeedingVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingLogId ? "Sửa ghi nhận" : "Thêm cho ăn mới"}
              </Text>
              <TouchableOpacity onPress={() => setModalFeedingVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Lô nuôi *</Text>
              <Dropdown
                style={styles.dropdown}
                data={batches.map((b) => ({
                  label: b.batchName || b.name,
                  value: b.id,
                }))}
                labelField="label"
                valueField="value"
                value={selectedBatchId}
                onChange={(item) => setSelectedBatchId(item.value)}
                placeholder="Chọn lô nuôi..."
              />

              {isHarvested ? (
                <View
                  style={{
                    marginTop: 20,
                    padding: 16,
                    backgroundColor: "#FEF2F2",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#FECACA",
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.danger,
                      textAlign: "center",
                      fontWeight: "700",
                      fontSize: 15,
                    }}
                  >
                    Lô nuôi này đã thu hoạch!
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.danger,
                      textAlign: "center",
                      marginTop: 4,
                      fontSize: 12,
                    }}
                  >
                    Hệ thống không cho phép ghi nhận thêm hoạt động cho ăn.
                  </Text>
                </View>
              ) : (
                <>
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
                    onChangeText={(text) =>
                      setFeedAmount(text.replace(",", "."))
                    }
                    placeholder="Ví dụ: 7.2"
                    returnKeyType="done"
                  />
                  <View style={{ height: 20 }} />
                </>
              )}
            </ScrollView>

            {/* ẨN NÚT LƯU KHI ĐÃ THU HOẠCH */}
            {!isHarvested && (
              <TouchableOpacity
                style={styles.btnSave}
                onPress={handleSaveFeeding}
              >
                <Text style={styles.btnTextSave}>
                  {editingLogId ? "Cập nhật" : "Lưu vào lịch sử"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- MODAL CÁ CHẾT --- */}
      <Modal visible={modalMortalityVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMortalityId
                  ? "Chỉnh sửa số lượng cá chết"
                  : "Ghi nhận cá chết"}
              </Text>
              <TouchableOpacity onPress={() => setModalMortalityVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Lô nuôi *</Text>
              <Dropdown
                style={styles.dropdown}
                data={batches.map((b) => ({
                  label: b.batchName || b.name,
                  value: b.id,
                }))}
                labelField="label"
                valueField="value"
                value={selectedBatchId}
                onChange={(item) => setSelectedBatchId(item.value)}
                placeholder="Chọn lô nuôi..."
              />

              {isHarvested ? (
                <View
                  style={{
                    marginTop: 20,
                    padding: 16,
                    backgroundColor: "#FEF2F2",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#FECACA",
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.danger,
                      textAlign: "center",
                      fontWeight: "700",
                      fontSize: 15,
                    }}
                  >
                    Lô nuôi này đã thu hoạch!
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.danger,
                      textAlign: "center",
                      marginTop: 4,
                      fontSize: 13,
                    }}
                  >
                    Hệ thống không cho phép ghi nhận thêm số lượng cá chết.
                  </Text>
                </View>
              ) : (
                <>
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
                    onChangeText={(text) => {
                      setDeadWeight(text.replace(",", "."));
                      setMortalityWarning(null);
                    }}
                    placeholder="Ví dụ: 0.5"
                    returnKeyType="done"
                  />

                  {/* ── INLINE WARNING BANNER (giống web) ── */}
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
                          Bấm &quot;Xác nhận &amp; Lưu&quot; để tiếp tục ghi
                          nhận.
                        </Text>
                      </View>
                    </View>
                  )}

                  <View style={{ height: 16 }} />
                </>
              )}
            </ScrollView>

            {/* ẨN NÚT LƯU KHI ĐÃ THU HOẠCH */}
            {!isHarvested && (
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
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

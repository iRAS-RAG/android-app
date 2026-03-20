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
  Alert,
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
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [mortalityLogs, setMortalityLogs] = useState<any[]>([]);
  const [editingMortalityId, setEditingMortalityId] = useState<string | null>(
    null,
  );

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
    if (!selectedBatchId || !feedAmount) {
      Alert.alert("Thông báo", "Vui lòng nhập đủ các trường có dấu (*)");
      return;
    }

    try {
      const sanitizedAmount = feedAmount.replace(",", ".");
      const parsedAmount = parseFloat(sanitizedAmount);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        Alert.alert("Lỗi", "Khối lượng không hợp lệ.");
        return;
      }

      const payload = {
        farmingBatchId: selectedBatchId,
        feedTypeId: selectedFeedId,
        amount: parsedAmount,
        createdDate: new Date().toISOString(),
      };

      if (editingLogId) {
        await axiosClient.put(`/feeding-logs/${editingLogId}`, payload);
        Alert.alert("Thành công", "Đã cập nhật lịch sử cho ăn.");
      } else {
        await operationsApi.postFeeding(payload);
        Alert.alert("Thành công", "Đã lưu vào lịch sử cho ăn.");
      }

      setModalFeedingVisible(false);
      loadInitialData();
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể lưu dữ liệu.");
    }
  };

  const openMortalityModal = (log?: any) => {
    if (log) {
      setEditingMortalityId(log.id);
      setSelectedBatchId(log.batchId || "");
      setDeadAmount(log.amount?.toString() || "");
    } else {
      setEditingMortalityId(null);
      setSelectedBatchId("");
      setDeadAmount("");
    }
    setModalMortalityVisible(true);
  };

  const handleSaveMortality = async () => {
    if (!selectedBatchId || !deadAmount) {
      Alert.alert("Thông báo", "Vui lòng nhập đủ các trường có dấu (*)");
      return;
    }

    try {
      const parsedAmount = parseInt(deadAmount, 10);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        Alert.alert("Lỗi", "Số lượng cá chết không hợp lệ.");
        return;
      }

      const payload = {
        batchId: selectedBatchId,
        quantity: parsedAmount,
        date: new Date().toISOString(),
      };

      if (editingMortalityId) {
        await operationsApi.putMortalityLog(editingMortalityId, payload);
        Alert.alert("Thành công", "Đã cập nhật số lượng cá chết.");
      } else {
        await operationsApi.postMortalityLog(payload);
        Alert.alert("Thành công", "Đã ghi nhận cá chết.");
      }

      setModalMortalityVisible(false);
      loadInitialData();
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể lưu dữ liệu.");
    }
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
                        {item.amount} {item.unit || "kg"}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {(activeTab === "feeding" || activeTab === "mortality") && (
                <TouchableOpacity
                  onPress={() =>
                    activeTab === "feeding"
                      ? openFeedingModal(item)
                      : openMortalityModal(item)
                  }
                  style={styles.editButton}
                >
                  <Ionicons
                    name="create-outline"
                    size={22}
                    color={
                      activeTab === "mortality"
                        ? theme.colors.danger
                        : theme.colors.primary
                    }
                  />
                </TouchableOpacity>
              )}
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
                  <Text style={styles.label}>Loại thức ăn</Text>
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
                  <Text style={styles.label}>Số lượng (con) *</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={deadAmount}
                    onChangeText={setDeadAmount}
                    placeholder="Ví dụ: 3"
                    returnKeyType="done"
                  />
                  <View style={{ height: 20 }} />
                </>
              )}
            </ScrollView>

            {/* ẨN NÚT LƯU KHI ĐÃ THU HOẠCH */}
            {!isHarvested && (
              <TouchableOpacity
                style={[
                  styles.btnSave,
                  { backgroundColor: theme.colors.danger },
                ]}
                onPress={handleSaveMortality}
              >
                <Text style={styles.btnTextSave}>
                  {editingMortalityId ? "Cập nhật" : "Lưu hệ thống"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

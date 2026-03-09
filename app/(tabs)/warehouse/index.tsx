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

const MORTALITY_DATA_MOCK = [
  {
    id: "m1",
    time: "14:20 - Hôm nay",
    tank: "Bể A-01",
    count: "3 con",
    note: "Sốc nhiệt",
    user: "KTV Nam",
  },
  {
    id: "m2",
    time: "08:10 - Hôm nay",
    tank: "Bể B-03",
    count: "1 con",
    note: "Trầy xước",
    user: "KTV Nam",
  },
];

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

  const loadInitialData = async () => {
    try {
      const [batchesData, feedsData, logsData] = await Promise.all([
        operationsService.getAllBatchesForUI(),
        operationsService.getFeedTypesForDropdown(),
        operationsService.getFeedingHistory(),
      ]);
      setBatches(batchesData);
      setFeedTypes(feedsData);
      setFeedingLogs(logsData);
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
      // CHUẨN HÓA LẦN CUỐI TRƯỚC KHI GỬI
      const sanitizedAmount = feedAmount.replace(",", ".");
      const parsedAmount = parseFloat(sanitizedAmount);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        Alert.alert("Lỗi", "Khối lượng không hợp lệ.");
        return;
      }

      // const payload = {
      //   farmingBatchId: selectedBatchId,
      //   amount: parsedAmount,
      //   createdDate: new Date().toISOString(),
      // };
      const payload = {
        farmingBatchId: selectedBatchId,
        feedTypeId: selectedFeedId, // <--- BỔ SUNG DÒNG NÀY
        amount: parsedAmount,
        createdDate: new Date().toISOString(),
      };

      if (editingLogId) {
        await axiosClient.put(`/feeding-logs/${editingLogId}`, payload); //
        Alert.alert("Thành công", "Đã cập nhật lịch sử cho ăn.");
      } else {
        await operationsApi.postFeeding(payload); //
        Alert.alert("Thành công", "Đã lưu vào lịch sử cho ăn.");
      }

      setModalFeedingVisible(false);
      loadInitialData();
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể lưu dữ liệu.");
    }
  };

  const handleSaveMortality = () => {
    Alert.alert("Thành công", "Đã ghi nhận số lượng cá chết (Local).");
    setModalMortalityVisible(false);
    setDeadAmount("");
  };

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
        // Tab Cho ăn giờ đây hiển thị danh sách các lần cho ăn thực tế để cho phép chỉnh sửa
        data={
          activeTab === "feeding"
            ? feedingLogs
            : activeTab === "history"
              ? historySubTab === "feed_hist"
                ? feedingLogs
                : MORTALITY_DATA_MOCK
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
              {/* 1. Box Icon: Cố định kích thước bên trái */}
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor:
                      activeTab === "mortality" ? "#FEE2E2" : "#DBEAFE",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    activeTab === "mortality"
                      ? "skull-outline"
                      : "fishbowl-outline"
                  }
                  size={24}
                  color={
                    activeTab === "mortality"
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

                {/* HIỂN THỊ CHI TIẾT LƯỢNG CÁM VÀ LOẠI CÁM TRONG LỊCH SỬ */}
                {(activeTab === "feeding" ||
                  (activeTab === "history" &&
                    historySubTab === "feed_hist")) && (
                  <View style={styles.detailContainer}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Loại:</Text>
                      <Text style={styles.detailValue} numberOfLines={1}>
                        {item.feedName || "Thức ăn hỗn hợp"}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Khối lượng:</Text>
                      <Text style={[styles.detailValue, { color: "#1E293B" }]}>
                        {item.amount}
                        {item.unit || "kg"}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {activeTab === "feeding" && (
                <TouchableOpacity
                  onPress={() => openFeedingModal(item)}
                  style={styles.editButton}
                >
                  <Ionicons
                    name="create-outline"
                    size={22}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />

      {/* NÚT FAB (+) GÓC PHẢI LUÔN DÙNG ĐỂ THÊM MỚI BẢN GHI VÀO LỊCH SỬ */}
      {activeTab === "feeding" && (
        <TouchableOpacity style={styles.fab} onPress={() => openFeedingModal()}>
          <Ionicons name="add" size={32} color="#FFF" />
        </TouchableOpacity>
      )}

      <Modal visible={modalFeedingVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          // ĐIỀU CHỈNH behavior VÀ offset ĐỂ KHÔNG BỊ CHE NÚT
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
                keyboardType="decimal-pad" // Hiện bàn phím số có dấu chấm/phẩy
                value={feedAmount}
                // TỰ ĐỘNG CHUYỂN DẤU PHẨY THÀNH DẤU CHẤM KHI ĐANG NHẬP
                onChangeText={(text) => setFeedAmount(text.replace(",", "."))}
                placeholder="Ví dụ: 7.2"
                returnKeyType="done"
              />
              <View style={{ height: 20 }} />
            </ScrollView>
            <TouchableOpacity
              style={styles.btnSave}
              onPress={handleSaveFeeding}
            >
              <Text style={styles.btnTextSave}>
                {editingLogId ? "Cập nhật" : "Lưu vào lịch sử"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

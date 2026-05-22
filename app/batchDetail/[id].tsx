// app/batchDetail/[id].tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  Entypo,
} from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

// Giả sử theme được định nghĩa như sau (thay thế bằng theme thật của bạn nếu có import)
const theme = {
  colors: {
    primary: "#3B82F6",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    textPrimary: "#1E293B",
    textSecondary: "#64748B",
    white: "#FFFFFF",
    background: "#F1F5F9",
    border: "#E2E8F0",
  },
};

import { batchService } from "@/services/batchService";

const { width } = Dimensions.get("window");

export default function BatchDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);

  const loadData = async () => {
    if (!id) return;
    try {
      const detailData = await batchService.getBatchDetailOverview(
        id as string,
      );
      setData(detailData);
    } catch (error) {
      console.error("Lỗi tải dữ liệu lô nuôi:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu lô nuôi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!data || !data.batchInfo) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: theme.colors.textSecondary }}>
          Không tìm thấy thông tin lô nuôi.
        </Text>
        <TouchableOpacity
          style={{ marginTop: 15 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: theme.colors.primary, fontWeight: "600" }}>
            Quay lại Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { batchInfo } = data;

  // XỬ LÝ FIX LỖI STATUS Ở ĐÂY: Hỗ trợ cả chuỗi và số, trả về thêm cờ isHarvested
  const getStatusConfig = (status: string | number) => {
    const statusStr = String(status).toUpperCase().trim();

    if (
      statusStr === "1" ||
      statusStr === "ACTIVE" ||
      statusStr === "DANG NUOI" ||
      statusStr === "ĐANG NUÔI"
    ) {
      return {
        label: "ĐANG NUÔI",
        bg: "#DCFCE7",
        text: "#166534",
        isHarvested: false,
      };
    }
    if (
      statusStr === "2" ||
      statusStr === "HARVESTED" ||
      statusStr === "THU HOACH" ||
      statusStr === "THU HOẠCH"
    ) {
      return {
        label: "ĐÃ THU HOẠCH",
        bg: "#F1F5F9",
        text: "#64748B",
        isHarvested: true,
      };
    }
    if (
      statusStr === "3" ||
      statusStr === "PAUSED" ||
      statusStr === "TAM DUNG" ||
      statusStr === "TẠM DỪNG"
    ) {
      return {
        label: "TẠM DỪNG",
        bg: "#FEF9C3",
        text: "#854D0E",
        isHarvested: false,
      };
    }

    return {
      label: "KHỞI TẠO",
      bg: "#E0E7FF",
      text: "#3730A3",
      isHarvested: false,
    };
  };

  const statusConfig = getStatusConfig(batchInfo.status);

  // Helper component render thẻ chỉ số nhỏ (Widget)
  const StatWidget = ({
    label,
    value,
    unit,
    icon,
    valueColor,
    subtext,
    iconType = Ionicons,
  }: any) => {
    const IconComponent = iconType;
    return (
      <View style={[styles.statWidget, styles.shadowLight]}>
        <View style={styles.widgetHeader}>
          <Text style={styles.widgetLabel}>{label}</Text>
          <IconComponent
            name={icon}
            size={20}
            color={theme.colors.primary}
            style={styles.widgetIcon}
          />
        </View>
        <View style={styles.widgetValueContainer}>
          <Text
            style={[styles.widgetValue, valueColor && { color: valueColor }]}
          >
            {value}
          </Text>
          {unit && <Text style={styles.widgetUnit}>{unit}</Text>}
        </View>
        {subtext && <Text style={styles.widgetSubtext}>{subtext}</Text>}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. HEADER BAR - Nền trắng, bo bóng nhẹ */}
      <View style={[styles.headerBar, styles.shadowLight]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBackBtn}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.textPrimary}
          />
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
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* 2. THÔNG TIN CHÍNH LÔ NUÔI (CARD TRÊN) */}
        <View style={[styles.infoCard, styles.shadowFloating]}>
          <View style={styles.infoCardMainRow}>
            {/* Phần thông tin bên trái */}
            <View style={styles.infoCardLeft}>
              <Text style={styles.mainBatchTitle}>{batchInfo.name}</Text>

              <View style={styles.infoDataLines}>
                <View style={styles.infoDataLine}>
                  <MaterialCommunityIcons
                    name="fishbowl-outline"
                    size={16}
                    color={theme.colors.primary}
                    style={styles.lineIcon}
                  />
                  <Text style={styles.infoDataText}>
                    Vị trí: {batchInfo.tankName}
                  </Text>
                </View>

                <View style={styles.infoDataLine}>
                  <MaterialCommunityIcons
                    name="fish"
                    size={16}
                    color={theme.colors.textSecondary}
                    style={styles.lineIcon}
                  />
                  <Text style={styles.infoDataText}>
                    Loài: {batchInfo.speciesName}
                  </Text>
                </View>

                <View style={styles.infoDataLine}>
                  <Entypo
                    name="layers"
                    size={16}
                    color={theme.colors.textSecondary}
                    style={styles.lineIcon}
                  />
                  <Text style={styles.infoDataText}>
                    Giai đoạn: {batchInfo.stageName}
                  </Text>
                </View>
              </View>
            </View>

            {/* Trạng thái status ở phía bên phải card */}
            <View
              style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
            >
              <Text
                style={[styles.statusBadgeText, { color: statusConfig.text }]}
              >
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionSeparator} />

        {/* 3. PHẦN CHỈ SỐ SINH HỌC & MÔI TRƯỜNG */}
        <View style={styles.indicesSection}>
          <Text style={styles.sectionTitle}>Chỉ số sinh học & Vận hành</Text>

          <View style={styles.indicesGridContainer}>
            <StatWidget
              label="NGÀY TUỔI"
              value={batchInfo.daysOfCulture}
              unit="ngày"
              icon="time-outline"
            />

            <StatWidget
              label="SỐ LƯỢNG TỒN"
              value={batchInfo.currentQuantity}
              unit="con"
              icon="hand-holding-water"
              iconType={FontAwesome5}
              subtext={`/ ${batchInfo.initialQuantity} ban đầu`}
            />

            <StatWidget
              label="TỔNG CÁ CHẾT"
              value={batchInfo.totalDead}
              unit="con"
              icon="skull-outline"
              valueColor={theme.colors.danger}
            />

            <StatWidget
              label="DUNG TÍCH BỂ"
              value={batchInfo.tankVolume}
              icon="codepen"
              iconType={FontAwesome5}
            />
          </View>

          {/* Tổng cám tiêu thụ */}
          <View style={[styles.totalFeedCard, styles.shadowLight]}>
            <View style={styles.totalFeedHeader}>
              <Text style={styles.totalFeedLabel}>
                TỔNG CÁM TIÊU THỤ CỦA LÔ
              </Text>
              <FontAwesome5
                name="weight"
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.totalFeedValue}>{batchInfo.totalFeed}</Text>
          </View>
        </View>

        {/* NÚT THAO TÁC - Lô đã thu hoạch vẫn hiển thị nhưng bị làm mờ, không bấm được */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            statusConfig.isHarvested
              ? styles.actionButtonDisabled
              : styles.shadowPrimary,
          ]}
          activeOpacity={0.85}
          disabled={statusConfig.isHarvested}
          onPress={() => router.push("/warehouse")}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color={theme.colors.white}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.actionButtonText}>
            Ghi nhận vận hành cho lô này
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  scrollContent: { padding: 16, paddingBottom: 32 },
  shadowLight: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  shadowFloating: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  shadowPrimary: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },

  // HEADER BAR
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    zIndex: 10,
  },
  headerBackBtn: { padding: 8, marginLeft: 8 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },

  // INFO CARD
  infoCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 0,
  },
  infoCardMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  infoCardLeft: { flex: 1, marginRight: 16 },
  mainBatchTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginBottom: 10,
  },
  infoDataLines: { gap: 6 },
  infoDataLine: { flexDirection: "row", alignItems: "center" },
  lineIcon: { marginRight: 8, width: 18, textAlign: "center" },
  infoDataText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  statusBadgeText: { fontSize: 11, fontWeight: "700", textAlign: "center" },
  sectionSeparator: { height: 24 },

  // INDICES SECTION
  indicesSection: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 16,
    paddingLeft: 4,
  },
  indicesGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  // STAT WIDGET
  statWidget: {
    backgroundColor: theme.colors.white,
    width: (width - 32 - 12) / 2,
    borderRadius: 16,
    padding: 16,
    minHeight: 110,
    justifyContent: "space-between",
  },
  widgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  widgetLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    flex: 1,
    marginRight: 4,
  },
  widgetIcon: { opacity: 0.8 },
  widgetValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
  },
  widgetValue: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  widgetUnit: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: "600",
    marginLeft: 4,
  },
  widgetSubtext: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
    marginTop: 4,
  },

  // TOTAL FEED CARD
  totalFeedCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
    borderLeftWidth: 4,
    borderColor: theme.colors.primary,
  },
  totalFeedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  totalFeedLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  totalFeedValue: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.colors.primary,
  },

  // ACTION BUTTON
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    marginTop: 8,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: theme.colors.white,
    fontWeight: "700",
    fontSize: 15,
  },
});

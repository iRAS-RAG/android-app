import { styles } from "@/styles/alerts/alerts.styles";
import { theme } from "@/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
// Đảm bảo bạn đã tạo file alertService để xử lý dữ liệu
import { alertService } from "@/services/alertService";
import { toast } from "@/utils/toast";

export default function AlertsScreen() {
  const router = useRouter();

  // --- STATE QUẢN LÝ DỮ LIỆU & UI ---
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- STATE BỘ LỌC ---
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [showTimeMenu, setShowTimeMenu] = useState(false);
  const [timeFilter, setTimeFilter] = useState("Tất cả");
  const timeOptions = ["Tất cả", "Gần đây", "Hôm nay", "Hôm qua"];

  // --- 1. GỌI API LẤY DỮ LIỆU ---
  const fetchAlerts = useCallback(async () => {
    try {
      const data = await alertService.getAlerts();
      setAlerts(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Không thể tải dữ liệu cảnh báo.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  // --- 2. LOGIC LỌC DỮ LIỆU ---
  // --- 2. LOGIC LỌC DỮ LIỆU ---
  const filteredAlerts = alerts.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tank.toLowerCase().includes(searchQuery.toLowerCase());

    // SIÊU GỌN: Chỉ cần so sánh đúng với item.status ("Mới", "Đang xử lý", "Đã giải quyết")
    const matchesStatus =
      statusFilter === "Tất cả" || statusFilter === item.status;

    let matchesTime = true;
    if (timeFilter === "Gần đây") matchesTime = item.time.includes("phút");
    else if (timeFilter === "Hôm nay")
      matchesTime = item.time.includes("phút") || item.time.includes("giờ");
    else if (timeFilter === "Hôm qua")
      matchesTime = item.time.includes("Hôm qua");

    return matchesSearch && matchesStatus && matchesTime;
  });

  // --- 3. XỬ LÝ TƯƠNG TÁC XÁC NHẬN ---
  const handleConfirm = async (id: string) => {
    // Cập nhật trạng thái hiển thị ngay lập tức sang "Đang xử lý"
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Đang xử lý" } : a)),
    );

    try {
      // Gọi API cập nhật trạng thái thực tế
      await alertService.updateStatus(id, "processing");
      toast.info("Đã xác nhận sự cố. Đang chuyển sang trạng thái theo dõi.");
    } catch (error) {
      console.error("Update error:", error);
      // Nếu lỗi API, có thể gọi fetchAlerts() để đồng bộ lại dữ liệu đúng từ server
      fetchAlerts();
    }
  };

  const handleResolve = async (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Đã giải quyết" } : a)),
    );
    await alertService.updateStatus(id, "resolved");
    toast.success("Đã đóng sự cố.");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* HEADER & FILTERS */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Cảnh báo</Text>
            <Text style={styles.headerSubTitle}>
              {filteredAlerts.length} thông báo
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              timeFilter !== "Tất cả" && {
                backgroundColor: theme.colors.primary + "15",
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={() => setShowTimeMenu(true)}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="time-outline"
                size={16}
                color={
                  timeFilter !== "Tất cả"
                    ? theme.colors.primary
                    : theme.colors.textPrimary
                }
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  marginRight: 4,
                  fontSize: 13,
                  fontWeight: "600",
                  color:
                    timeFilter !== "Tất cả"
                      ? theme.colors.primary
                      : theme.colors.textPrimary,
                }}
              >
                {timeFilter}
              </Text>
              <Ionicons
                name="chevron-down"
                size={14}
                color={
                  timeFilter !== "Tất cả"
                    ? theme.colors.primary
                    : theme.colors.textPrimary
                }
              />
            </View>
          </TouchableOpacity>
        </View>

        <Modal visible={showTimeMenu} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowTimeMenu(false)}
          >
            <View style={styles.dropdownMenu}>
              {timeOptions.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.menuItem}
                  onPress={() => {
                    setTimeFilter(opt);
                    setShowTimeMenu(false);
                  }}
                >
                  <Text
                    style={[
                      styles.menuText,
                      timeFilter === opt && {
                        color: theme.colors.primary,
                        fontWeight: "700",
                      },
                    ]}
                  >
                    {opt}
                  </Text>
                  {timeFilter === opt && (
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

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={theme.colors.textSecondary}
          />
          <TextInput
            placeholder="Tìm kiếm cảnh báo, bể..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterGroup}
        >
          <FilterTab
            icon="layers-outline"
            label="Tổng"
            count={alerts.length}
            active={statusFilter === "Tất cả"}
            onPress={() => setStatusFilter("Tất cả")}
            color="#F1F5F9"
            textColor="#64748B"
          />
          <FilterTab
            icon="alert-circle-outline"
            label="Mới"
            count={alerts.filter((a) => a.status === "Mới").length}
            active={statusFilter === "Mới"}
            onPress={() => setStatusFilter("Mới")}
            color="#FEE2E2"
            textColor={theme.colors.danger}
          />
          <FilterTab
            icon="sync-outline"
            label="Đang xử lý"
            count={alerts.filter((a) => a.status === "Đang xử lý").length}
            active={statusFilter === "Đang xử lý"}
            onPress={() => setStatusFilter("Đang xử lý")}
            color="#FEF3C7"
            textColor={theme.colors.warning}
          />
          <FilterTab
            icon="checkmark-circle-outline"
            label="Đã giải quyết"
            count={alerts.filter((a) => a.status === "Đã giải quyết").length}
            active={statusFilter === "Đã giải quyết"}
            onPress={() => setStatusFilter("Đã giải quyết")}
            color="#D1FAE5"
            textColor={theme.colors.success}
          />
        </ScrollView>
      </View>

      {/* LIST CONTENT */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 10, color: "#64748B" }}>
            Đang tải dữ liệu...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        >
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((item) => (
              <AlertCard
                key={item.id}
                item={item}
                router={router}
                onConfirm={() => handleConfirm(item.id)}
                onResolve={() => handleResolve(item.id)}
              />
            ))
          ) : (
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Ionicons name="search-outline" size={60} color="#CBD5E1" />
              <Text style={{ color: "#64748B", marginTop: 10 }}>
                Không tìm thấy cảnh báo phù hợp
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const FilterTab = ({
  icon,
  label,
  count,
  active,
  onPress,
  color,
  textColor,
}: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.filterTab,
      { backgroundColor: active ? textColor : color, paddingLeft: 10 },
    ]}
  >
    <Ionicons
      name={icon}
      size={16}
      color={active ? "#FFF" : textColor}
      style={{ marginRight: 6 }}
    />
    <Text
      style={[styles.filterTabText, { color: active ? "#FFF" : textColor }]}
    >
      {label}
    </Text>
    <View
      style={[
        styles.countBadge,
        { backgroundColor: active ? "rgba(255,255,255,0.2)" : "#FFF" },
      ]}
    >
      <Text style={[styles.countText, { color: active ? "#FFF" : textColor }]}>
        {count}
      </Text>
    </View>
  </TouchableOpacity>
);

const AlertCard = ({ item, router, onConfirm, onResolve }: any) => {
  const isProcessing = item.status === "Đang xử lý";
  const isResolved = item.status === "Đã giải quyết";

  return (
    <View
      style={[styles.card, { borderTopColor: item.color, borderTopWidth: 4 }]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
          <MaterialCommunityIcons
            name={
              item.type === "Pump" ? "engine-outline" : "alert-circle-outline"
            }
            size={24}
            color={item.color}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.desc}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
      </View>

      <View style={styles.comparisonRow}>
        <View style={styles.compItem}>
          <Text style={styles.compLabel}>
            Giá trị: <Text style={{ color: item.color }}>{item.value}</Text>
          </Text>
        </View>
        <View style={styles.compItem}>
          <Text style={styles.compLabel}>Ngưỡng: {item.limit}</Text>
        </View>
      </View>

      <View style={styles.tagRow}>
        <View style={[styles.tag, { backgroundColor: `${item.color}15` }]}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <Text style={[styles.tagText, { color: item.color }]}>
            {item.level}
          </Text>
        </View>
        <View
          style={[
            styles.tag,
            { backgroundColor: isProcessing ? "#DBEAFE" : "#F1F5F9" },
          ]}
        >
          <Ionicons
            name={isProcessing ? "sync-outline" : "time-outline"}
            size={12}
            color={isProcessing ? theme.colors.primary : "#64748B"}
          />
          <Text
            style={[
              styles.tagTextSecondary,
              isProcessing && {
                color: theme.colors.primary,
                fontWeight: "700",
              },
            ]}
          >
            {item.status}
          </Text>
        </View>
        <View style={[styles.tag, { backgroundColor: "#E0F2FE" }]}>
          <Ionicons
            name="business-outline"
            size={12}
            color={theme.colors.primary}
          />
          <Text
            style={[styles.tagTextSecondary, { color: theme.colors.primary }]}
          >
            {item.tank}
          </Text>
        </View>
      </View>

      <Text style={styles.timeText}>{item.time}</Text>

      {item.level === "An toàn" ? (
        <TouchableOpacity
          style={[
            styles.btnResolved,
            isResolved && { backgroundColor: "#CBD5E1" },
          ]}
          onPress={onResolve}
          disabled={isResolved}
        >
          <Ionicons
            name={isResolved ? "checkmark-done-circle" : "checkmark-circle"}
            size={18}
            color="#FFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.btnTextPrimary}>
            {isResolved ? "Đã đóng sự cố" : "Đánh dấu đã giải quyết"}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.btnOutline,
              isProcessing && {
                borderColor: theme.colors.primary,
                backgroundColor: "#EFF6FF",
              },
            ]}
            onPress={onConfirm}
            disabled={isProcessing}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {isProcessing && (
                <MaterialCommunityIcons
                  name="progress-clock"
                  size={16}
                  color={theme.colors.primary}
                  style={{ marginRight: 6 }}
                />
              )}
              <Text
                style={[
                  styles.btnTextOutline,
                  isProcessing && {
                    color: theme.colors.primary,
                    fontWeight: "700",
                  },
                ]}
              >
                {isProcessing ? "Đang xử lý" : "Xác nhận"}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() =>
              router.push({
                pathname: "/alertDetail/[id]",
                params: {
                  id: item.id,
                  // Truyền kèm data từ list để dùng làm fallback trong detail
                  // (API detail /alerts/{id} có thể không trả về minThreshold/maxThreshold/unit)
                  fallbackLimit: item.limit || "",
                  fallbackValue: item.value || "",
                  fallbackUnit: item.unit || "",
                  fallbackSensorName: item.sensorTypeName || item.title?.replace?.("Cảnh báo ", "") || "",
                  fallbackTankId: item.fishTankId || "",
                },
              })
            }
          >
            <Text style={styles.btnTextPrimary}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

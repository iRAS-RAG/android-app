// app/(tabs)/index.tsx
import { styles } from "@/styles/dashboard/dashboard.styles";
import { theme } from "@/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  TextInput,
  StatusBar,
} from "react-native";
import { Drawer } from "react-native-drawer-layout";
import { dashboardService } from "@/services/dashboardService";
import authService from "@/services/authService";
import axiosClient from "@/api/axiosClient";

const { width } = Dimensions.get("window");

// ─── Status helpers ───────────────────────────────────────────────────────────

const getBatchStatusKey = (status: any): string => {
  const s = String(status || "").toUpperCase().trim();
  if (s === "0" || s === "1" || s === "ACTIVE") return "ACTIVE";
  if (s === "2" || s === "HARVESTED") return "HARVESTED";
  if (s === "3" || s === "PAUSED") return "PAUSED";
  if (s === "4" || s === "TERMINATED") return "TERMINATED";
  return "OTHER";
};

const getStatusConfig = (status: string | number) => {
  if (!status) return { label: "N/A", bg: "#F1F5F9", text: "#64748B" };
  const key = getBatchStatusKey(status);
  if (key === "ACTIVE") return { label: "ĐANG NUÔI", bg: "#DCFCE7", text: "#166534" };
  if (key === "HARVESTED") return { label: "ĐÃ THU HOẠCH", bg: "#F1F5F9", text: "#64748B" };
  if (key === "PAUSED") return { label: "TẠM DỪNG", bg: "#FEF9C3", text: "#854D0E" };
  if (key === "TERMINATED") return { label: "ĐÃ HỦY", bg: "#FEE2E2", text: "#991B1B" };
  return { label: "KHỞI TẠO", bg: "#E0E7FF", text: "#3730A3" };
};

// ─── Filter options ───────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: "Tất cả", value: "" },
  { label: "Đang nuôi", value: "ACTIVE" },
  { label: "Đã thu hoạch", value: "HARVESTED" },
  { label: "Tạm dừng", value: "PAUSED" },
  { label: "Đã hủy", value: "TERMINATED" },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState<"batches" | "tanks">("batches");

  const [batches, setBatches] = useState<any[]>([]);
  const [tanks, setTanks] = useState<any[]>([]);

  // Separate search per tab
  const [batchSearch, setBatchSearch] = useState("");
  const [tankSearch, setTankSearch] = useState("");

  // Batch filters
  const [tankFilter, setTankFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showTankPicker, setShowTankPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const [showFullList, setShowFullList] = useState(false);
  const [farmInfo, setFarmInfo] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState({ totalAlerts: 0, totalTanks: 0 });

  const loadDashboardData = async () => {
    try {
      const [userProfile, dashData, tanksRes] = await Promise.all([
        authService.getCurrentUserProfile(),
        dashboardService.getDashboardData(),
        axiosClient.get("/fish-tanks?page=1&pageSize=100"),
      ]);

      setUserData(userProfile);
      setBatches(dashData.batches);

      const tanksList = tanksRes.data.data || [];
      setTanks(tanksList);

      setStats({
        totalAlerts: dashData.totalAlerts,
        totalTanks: tanksRes.data.meta?.totalItems || tanksList.length || 0,
      });
    } catch (error) {
      console.error("Lỗi kết nối Dashboard API:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Reset "xem thêm" khi đổi tab
  useEffect(() => {
    setShowFullList(false);
  }, [activeTab]);

  // Derived counts
  const activeBatchesCount = batches.filter(
    (b) => getBatchStatusKey(b.status) === "ACTIVE"
  ).length;

  // Unique tank names for filter dropdown
  const uniqueTankNames = Array.from(new Set(batches.map((b) => b.tankName).filter(Boolean)));

  // Sort batches: ACTIVE → PAUSED → HARVESTED → TERMINATED (same order as web)
  const STATUS_SORT_ORDER: Record<string, number> = { ACTIVE: 0, PAUSED: 1, HARVESTED: 2, TERMINATED: 3, OTHER: 4 };
  const sortedBatches = [...batches].sort(
    (a, b) =>
      (STATUS_SORT_ORDER[getBatchStatusKey(a.status)] ?? 4) -
      (STATUS_SORT_ORDER[getBatchStatusKey(b.status)] ?? 4)
  );

  // Filtered batches
  const filteredBatches = sortedBatches.filter((batch) => {
    const matchSearch =
      !batchSearch ||
      batch.batchName?.toLowerCase().includes(batchSearch.toLowerCase());
    const matchTank = !tankFilter || batch.tankName === tankFilter;
    const matchStatus =
      !statusFilter || getBatchStatusKey(batch.status) === statusFilter;
    return matchSearch && matchTank && matchStatus;
  });

  // Filtered tanks
  const filteredTanks = tanks.filter((tank) =>
    !tankSearch || tank.name?.toLowerCase().includes(tankSearch.toLowerCase())
  );

  const displayedBatches = showFullList ? filteredBatches : filteredBatches.slice(0, 3);
  const displayedTanks = showFullList ? filteredTanks : filteredTanks.slice(0, 3);

  const statusFilterLabel =
    STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label || "Tất cả";
  const tankFilterLabel = tankFilter || "Tất cả bể";

  // ─── Drawer content ─────────────────────────────────────────────────────────

  const renderDrawerContent = () => (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.white }}>
      <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
        <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.primary, justifyContent: "center", alignItems: "center" }}>
          <MaterialCommunityIcons name="home-modern" size={30} color={theme.colors.white} />
        </View>
        <Text style={{ ...theme.typography.h3, marginTop: 15 }}>
          {farmInfo?.name || "Hệ thống iRAS"}
        </Text>
      </View>
      <View style={{ padding: 20, gap: 25 }}>
        <SidebarItem icon="person-outline" label="Người vận hành"
          value={userData ? `${userData.lastName} ${userData.firstName}` : "Đang tải..."} />
        <SidebarItem icon="shield-checkmark-outline" label="Vai trò"
          value={userData?.roleName || "N/A"} />
        <SidebarItem icon="location-outline" label="Địa chỉ"
          value={farmInfo?.address || "Đang cập nhật..."} />
        <SidebarItem icon="call-outline" label="Liên hệ"
          value={farmInfo?.phoneNumber || "N/A"} />
      </View>
    </SafeAreaView>
  );

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );

  return (
    <Drawer
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      drawerStyle={{ width: width * 0.75 }}
      renderDrawerContent={renderDrawerContent}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDashboardData(); }} />
          }
        >
          {/* ── HEADER (chỉ user info, nền xanh) ── */}
          <View style={styles.headerSection}>
            <View style={styles.headerInfo}>
              <TouchableOpacity onPress={() => setOpen(true)}>
                <Ionicons name="menu" size={28} color={theme.colors.white} />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.userRoleText}>
                  {userData
                    ? `${userData.roleName}: ${userData.lastName} ${userData.firstName}`
                    : "Operator"}
                </Text>
              </View>
              <TouchableOpacity style={styles.notiBtn} onPress={() => router.push("/alerts")}>
                <Ionicons name="notifications-outline" size={24} color={theme.colors.white} />
                {stats.totalAlerts > 0 && <View style={styles.notiBadge} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* ── STATS (3 cột đều nhau) ── */}
          <View style={[styles.statsSection, { flexDirection: "row", gap: 10 }]}>
            {/* 1. Cảnh báo — đứng đầu */}
            <View style={styles.statCardHalf}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 }}>
                <Ionicons name="warning-outline" size={13} color={stats.totalAlerts > 0 ? "#D97706" : theme.colors.textSecondary} />
                <Text style={styles.statLabelDark} numberOfLines={1}>Cảnh báo</Text>
              </View>
              <Text style={[styles.statValueDark, { color: stats.totalAlerts > 0 ? "#D97706" : theme.colors.textPrimary }]}>
                {stats.totalAlerts}
              </Text>
            </View>
            {/* 2. Bể nuôi */}
            <View style={styles.statCardHalf}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 }}>
                <Ionicons name="water-outline" size={13} color={theme.colors.primary} />
                <Text style={styles.statLabelDark} numberOfLines={1}>Bể nuôi</Text>
              </View>
              <Text style={[styles.statValueDark, { color: theme.colors.primary }]}>{stats.totalTanks}</Text>
            </View>
            {/* 3. Vụ đang nuôi */}
            <View style={styles.statCardHalf}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 }}>
                <MaterialCommunityIcons name="fish" size={13} color={theme.colors.primary} />
                <Text style={styles.statLabelDark} numberOfLines={1}>Vụ đang nuôi</Text>
              </View>
              <Text style={[styles.statValueDark, { color: theme.colors.primary }]}>{activeBatchesCount}</Text>
            </View>
          </View>

          {/* ── TABS (trên search, không bị che) ── */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "tanks" && styles.tabActive]}
              onPress={() => setActiveTab("tanks")}
            >
              <Text style={[styles.tabText, activeTab === "tanks" && styles.tabTextActive]}>
                Bể nuôi
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "batches" && styles.tabActive]}
              onPress={() => setActiveTab("batches")}
            >
              <Text style={[styles.tabText, activeTab === "batches" && styles.tabTextActive]}>
                Vụ nuôi
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── SEARCH (riêng theo tab) ── */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
              {activeTab === "batches" ? (
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tìm vụ nuôi..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={batchSearch}
                  onChangeText={setBatchSearch}
                />
              ) : (
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tìm bể nuôi..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={tankSearch}
                  onChangeText={setTankSearch}
                />
              )}
            </View>
          </View>

          {/* ── FILTERS (chỉ hiện trong tab Vụ nuôi) ── */}
          {activeTab === "batches" && (
            <View style={styles.filterRow}>
              <TouchableOpacity style={styles.filterBtn} onPress={() => setShowTankPicker(true)}>
                <Ionicons name="water-outline" size={13} color={theme.colors.primary} />
                <Text style={styles.filterBtnText} numberOfLines={1}>{tankFilterLabel}</Text>
                <Ionicons name="chevron-down" size={13} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterBtn} onPress={() => setShowStatusPicker(true)}>
                <Ionicons name="funnel-outline" size={13} color={theme.colors.primary} />
                <Text style={styles.filterBtnText} numberOfLines={1}>{statusFilterLabel}</Text>
                <Ionicons name="chevron-down" size={13} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* ── DANH SÁCH ── */}
          <View style={styles.tankContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeTab === "batches" ? "Danh sách Vụ nuôi" : "Danh sách Bể nuôi"}
              </Text>
              {(activeTab === "batches" ? filteredBatches : filteredTanks).length > 3 && (
                <TouchableOpacity onPress={() => setShowFullList(!showFullList)}>
                  <Text style={styles.viewAll}>{showFullList ? "Thu gọn" : "Xem tất cả"}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* RENDER BATCHES */}
            {activeTab === "batches" &&
              (displayedBatches.length > 0 ? (
                displayedBatches.map((batch) => (
                  <TouchableOpacity
                    key={batch.id}
                    style={styles.tankCard}
                    onPress={() => router.push({ pathname: "/batchDetail/[id]", params: { id: batch.id } })}
                  >
                    <View style={styles.tankHeader}>
                      <View style={styles.tankAvatar}>
                        <MaterialCommunityIcons name="fish" size={26} color={theme.colors.primary} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 15 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", paddingRight: 5 }}>
                          <Text style={[styles.tankName, { marginRight: 8, marginBottom: 2 }]}>
                            {batch.batchName}
                          </Text>
                          {(() => {
                            const sc = getStatusConfig(batch.status);
                            return (
                              <View style={{ backgroundColor: sc.bg, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, marginBottom: 2 }}>
                                <Text style={{ fontSize: 9, fontWeight: "700", color: sc.text }}>{sc.label}</Text>
                              </View>
                            );
                          })()}
                        </View>
                        <Text style={styles.fishName}>
                          {batch.speciesName}{batch.stageName ? ` • ${batch.stageName}` : ""}
                        </Text>
                        <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>
                          Bể: {batch.tankName}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.tankStatsGrid}>
                      <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>DUNG TÍCH BỂ</Text>
                        <Text style={styles.gridValue}>{batch.displayVolume}</Text>
                      </View>
                      <View style={{ width: 1, backgroundColor: "#E2E8F0", height: "100%" }} />
                      <View style={[styles.gridItem, { paddingLeft: 15 }]}>
                        <Text style={styles.gridLabel}>TỒN HIỆN TẠI</Text>
                        <Text style={styles.gridValue}>{batch.displayQuantity}</Text>
                      </View>
                    </View>
                    <View style={styles.detailBtn}>
                      <Text style={styles.detailBtnText}>Chi tiết vụ nuôi</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Không tìm thấy vụ nuôi nào</Text>
                </View>
              ))}

            {/* RENDER TANKS */}
            {activeTab === "tanks" &&
              (displayedTanks.length > 0 ? (
                displayedTanks.map((tank) => {
                  const hasAlert = tank.hasOpenAlert;
                  return (
                    <TouchableOpacity
                      key={tank.id}
                      style={[styles.tankCard, hasAlert && { borderColor: theme.colors.danger, borderWidth: 1 }]}
                      onPress={() => router.push({ pathname: "/tankDetail/[id]", params: { id: tank.id } })}
                    >
                      <View style={styles.tankHeader}>
                        <View style={[styles.tankAvatar, { backgroundColor: hasAlert ? "#FEF2F2" : "#EFF6FF" }]}>
                          <MaterialCommunityIcons name="water-outline" size={26} color={hasAlert ? theme.colors.danger : theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 15 }}>
                          <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={styles.tankName}>{tank.name}</Text>
                            {hasAlert && (
                              <View style={{ marginLeft: 8, backgroundColor: "#FEF2F2", paddingHorizontal: 6, borderRadius: 4, borderWidth: 1, borderColor: "#FECACA" }}>
                                <Text style={{ fontSize: 9, color: theme.colors.danger, fontWeight: "700" }}>CẢNH BÁO</Text>
                              </View>
                            )}
                          </View>
                          <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 }}>
                            Giám sát thông số cảm biến & thiết bị
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.border} />
                      </View>
                      <View style={[styles.detailBtn, { marginTop: 15 }, hasAlert && { backgroundColor: "#FEF2F2" }]}>
                        <Text style={[styles.detailBtnText, hasAlert && { color: theme.colors.danger }]}>
                          Xem biểu đồ & Thiết bị
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Không tìm thấy bể nuôi nào</Text>
                </View>
              ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* ── TANK PICKER MODAL ── */}
      <Modal visible={showTankPicker} transparent animationType="fade">
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowTankPicker(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Chọn bể nuôi</Text>
            {[{ label: "Tất cả bể", value: "" }, ...uniqueTankNames.map((n) => ({ label: n, value: n }))].map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.pickerItem, tankFilter === opt.value && styles.pickerItemActive]}
                onPress={() => { setTankFilter(opt.value); setShowTankPicker(false); }}
              >
                <Text style={[styles.pickerItemText, tankFilter === opt.value && styles.pickerItemTextActive]}>
                  {opt.label}
                </Text>
                {tankFilter === opt.value && <Ionicons name="checkmark" size={16} color={theme.colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── STATUS PICKER MODAL ── */}
      <Modal visible={showStatusPicker} transparent animationType="fade">
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowStatusPicker(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Trạng thái vụ nuôi</Text>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.pickerItem, statusFilter === opt.value && styles.pickerItemActive]}
                onPress={() => { setStatusFilter(opt.value); setShowStatusPicker(false); }}
              >
                <Text style={[styles.pickerItemText, statusFilter === opt.value && styles.pickerItemTextActive]}>
                  {opt.label}
                </Text>
                {statusFilter === opt.value && <Ionicons name="checkmark" size={16} color={theme.colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </Drawer>
  );
}

// ─── Sidebar item ─────────────────────────────────────────────────────────────

const SidebarItem = ({ icon, label, value }: any) => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: theme.colors.kpi.temp.bg, justifyContent: "center", alignItems: "center" }}>
      <Ionicons name={icon} size={18} color={theme.colors.primary} />
    </View>
    <View style={{ marginLeft: 12 }}>
      <Text style={{ fontSize: 10, color: theme.colors.textSecondary, textTransform: "uppercase" }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colors.textPrimary }}>{value}</Text>
    </View>
  </View>
);

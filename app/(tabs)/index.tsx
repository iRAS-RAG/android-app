// app/(tabs)/index.tsx
import { styles } from "@/styles/dashboard/dashboard.styles";
import { theme } from "@/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
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
import { Drawer } from "react-native-drawer-layout"; // Lưu ý fix thư viện nếu bạn dùng tên khác
import { dashboardService } from "@/services/dashboardService";
import authService from "@/services/authService";
import axiosClient from "@/api/axiosClient";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State quản lý Tab đang hiển thị
  const [activeTab, setActiveTab] = useState<"batches" | "tanks">("batches");

  // Dữ liệu
  const [batches, setBatches] = useState<any[]>([]);
  const [tanks, setTanks] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showFullList, setShowFullList] = useState(false);
  const [farmInfo, setFarmInfo] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalAlerts: 0,
    totalTanks: 0,
  });
  const loadDashboardData = async () => {
    try {
      // Gọi song song các API để lấy data (Farm, User, Dashboard Data, Tanks List)
      const [farmRes, userProfile, dashData, tanksRes] = await Promise.all([
        axiosClient.get("/farms?page=1&pageSize=1"),
        authService.getCurrentUserProfile(),
        dashboardService.getDashboardData(),
        axiosClient.get("/fish-tanks?page=1&pageSize=100"), // API lấy danh sách bể
      ]);

      setFarmInfo(farmRes.data.data?.[0]);
      setUserData(userProfile);
      setBatches(dashData.batches);

      // --- PHẦN ĐƯỢC CHỈNH SỬA ---
      // 1. Khai báo và lấy dữ liệu gán vào biến tanksList trước
      const tanksList = tanksRes.data.data || [];

      // 2. Gán dữ liệu vào state setTanks
      setTanks(tanksList);

      // 3. Bây giờ bạn có thể gọi tanksList.length an toàn mà không bị lỗi undefined
      setStats({
        totalBatches: dashData.totalBatches,
        totalAlerts: dashData.totalAlerts,
        totalTanks: tanksRes.data.meta?.totalItems || tanksList.length || 0,
      });
      // ---------------------------
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

  // Filter dữ liệu dựa theo Tab đang chọn
  const filteredBatches = batches.filter(
    (batch) =>
      batch.batchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.tankName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredTanks = tanks.filter((tank) =>
    tank.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const displayedBatches = showFullList
    ? filteredBatches
    : filteredBatches.slice(0, 3);
  const displayedTanks = showFullList
    ? filteredTanks
    : filteredTanks.slice(0, 3);

  const renderDrawerContent = () => (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.white }}>
      <View
        style={{
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: "#F1F5F9",
        }}
      >
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: theme.colors.primary,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            name="home-modern"
            size={30}
            color={theme.colors.white}
          />
        </View>
        <Text style={{ ...theme.typography.h3, marginTop: 15 }}>
          {farmInfo?.name || "Hệ thống iRAS"}
        </Text>
      </View>
      <View style={{ padding: 20, gap: 25 }}>
        <SidebarItem
          icon="person-outline"
          label="Người vận hành"
          value={
            userData
              ? `${userData.lastName} ${userData.firstName}`
              : "Đang tải..."
          }
        />
        <SidebarItem
          icon="shield-checkmark-outline"
          label="Vai trò"
          value={userData?.roleName || "N/A"}
        />
        <SidebarItem
          icon="location-outline"
          label="Địa chỉ"
          value={farmInfo?.address || "Đang cập nhật..."}
        />
        <SidebarItem
          icon="call-outline"
          label="Liên hệ"
          value={farmInfo?.phoneNumber || "N/A"}
        />
      </View>
    </SafeAreaView>
  );

  if (loading)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );

  // Thêm hàm này vào trong DashboardScreen, phía trên khối lệnh return
  const getStatusConfig = (status: string | number) => {
    if (!status) return { label: "N/A", bg: "#F1F5F9", text: "#64748B" };
    const statusStr = String(status).toUpperCase().trim();

    if (
      statusStr === "1" ||
      statusStr === "ACTIVE" ||
      statusStr === "DANG NUOI" ||
      statusStr === "ĐANG NUÔI"
    ) {
      return { label: "ĐANG NUÔI", bg: "#DCFCE7", text: "#166534" };
    }
    if (
      statusStr === "2" ||
      statusStr === "HARVESTED" ||
      statusStr === "THU HOACH" ||
      statusStr === "THU HOẠCH"
    ) {
      return { label: "ĐÃ THU HOẠCH", bg: "#F1F5F9", text: "#64748B" };
    }
    if (
      statusStr === "3" ||
      statusStr === "PAUSED" ||
      statusStr === "TAM DUNG" ||
      statusStr === "TẠM DỪNG"
    ) {
      return { label: "TẠM DỪNG", bg: "#FEF9C3", text: "#854D0E" };
    }

    return { label: "KHỞI TẠO", bg: "#E0E7FF", text: "#3730A3" };
  };

  return (
    <Drawer
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      drawerStyle={{ width: width * 0.75 }}
      renderDrawerContent={renderDrawerContent}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadDashboardData();
              }}
            />
          }
        >
          {/* HEADER */}
          <View style={styles.headerSection}>
            <View style={styles.headerInfo}>
              <TouchableOpacity onPress={() => setOpen(true)}>
                <Ionicons name="menu" size={28} color={theme.colors.white} />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.farmName}>
                  {farmInfo?.name || "Hệ thống RAS"}
                </Text>
                <Text style={styles.techName}>
                  {userData
                    ? `${userData.roleName}: ${userData.lastName} ${userData.firstName}`
                    : "Operator"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.notiBtn}
                onPress={() => router.push("/alerts")}
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={theme.colors.white}
                />
                {stats.totalAlerts > 0 && <View style={styles.notiBadge} />}
              </TouchableOpacity>
            </View>

            <View style={styles.quickStatsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Bể nuôi</Text>
                <Text style={styles.statValue}>{stats.totalTanks}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Lô đang nuôi</Text>
                <Text style={styles.statValue}>{stats.totalBatches}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Cảnh báo</Text>
                <Text
                  style={[
                    styles.statValue,
                    {
                      color:
                        stats.totalAlerts > 0
                          ? theme.colors.warning
                          : theme.colors.white,
                    },
                  ]}
                >
                  {stats.totalAlerts}
                </Text>
              </View>
            </View>
          </View>

          {/* SEARCH */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={20}
                color={theme.colors.textSecondary}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm lô nuôi, tên bể..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* TAB CHUYỂN ĐỔI */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "tanks" && styles.tabActive,
              ]}
              onPress={() => {
                setActiveTab("tanks");
                setShowFullList(false);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "tanks" && styles.tabTextActive,
                ]}
              >
                Bể nuôi
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "batches" && styles.tabActive,
              ]}
              onPress={() => {
                setActiveTab("batches");
                setShowFullList(false);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "batches" && styles.tabTextActive,
                ]}
              >
                Lô nuôi
              </Text>
            </TouchableOpacity>
          </View>

          {/* DANH SÁCH HIỂN THỊ */}
          <View style={styles.tankContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeTab === "batches"
                  ? "Danh sách Lô nuôi"
                  : "Danh sách Bể nuôi"}
              </Text>
              {(activeTab === "batches" ? filteredBatches : filteredTanks)
                .length > 3 && (
                <TouchableOpacity
                  onPress={() => setShowFullList(!showFullList)}
                >
                  <Text style={styles.viewAll}>
                    {showFullList ? "Thu gọn" : "Xem tất cả"}
                  </Text>
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
                    onPress={() =>
                      router.push({
                        pathname: "/batchDetail/[id]",
                        params: { id: batch.id },
                      })
                    }
                  >
                    <View style={styles.tankHeader}>
                      <View style={styles.tankAvatar}>
                        <MaterialCommunityIcons
                          name="fish"
                          size={26}
                          color={theme.colors.primary}
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: 15 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            flexWrap: "wrap",
                            paddingRight: 5,
                          }}
                        >
                          <Text
                            style={[
                              styles.tankName,
                              { marginRight: 8, marginBottom: 2 },
                            ]}
                          >
                            {batch.batchName}
                          </Text>

                          {/* Khởi tạo cấu hình trạng thái cho lô hiện tại */}
                          {(() => {
                            const statusConfig = getStatusConfig(batch.status);
                            return (
                              <View
                                style={{
                                  backgroundColor: statusConfig.bg,
                                  paddingHorizontal: 6,
                                  paddingVertical: 3,
                                  borderRadius: 4,
                                  marginBottom: 2,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 9,
                                    fontWeight: "700",
                                    color: statusConfig.text,
                                  }}
                                >
                                  {statusConfig.label}
                                </Text>
                              </View>
                            );
                          })()}
                        </View>
                        <Text style={styles.fishName}>
                          {batch.speciesName}{" "}
                          {batch.stageName ? `• ${batch.stageName}` : ""}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: theme.colors.textSecondary,
                            marginTop: 2,
                          }}
                        >
                          Bể: {batch.tankName}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.tankStatsGrid}>
                      <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>DUNG TÍCH BỂ</Text>
                        <Text style={styles.gridValue}>
                          {batch.displayVolume}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: 1,
                          backgroundColor: "#E2E8F0",
                          height: "100%",
                        }}
                      />
                      <View style={[styles.gridItem, { paddingLeft: 15 }]}>
                        <Text style={styles.gridLabel}>TỒN HIỆN TẠI</Text>
                        <Text style={styles.gridValue}>
                          {batch.displayQuantity}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailBtn}>
                      <Text style={styles.detailBtnText}>Chi tiết lô nuôi</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Không tìm thấy lô nuôi nào
                  </Text>
                </View>
              ))}

            {/* RENDER TANKS */}
            {activeTab === "tanks" &&
              (displayedTanks.length > 0 ? (
                displayedTanks.map((tank) => {
                  const hasAlert = tank.hasOpenAlert; // Hoặc tank.status === 1 tùy API của bạn

                  return (
                    <TouchableOpacity
                      key={tank.id}
                      style={[
                        styles.tankCard,
                        hasAlert && {
                          borderColor: theme.colors.danger,
                          borderWidth: 1,
                        },
                      ]}
                      onPress={() =>
                        router.push({
                          pathname: "/tankDetail/[id]",
                          params: { id: tank.id },
                        })
                      }
                    >
                      <View style={styles.tankHeader}>
                        <View
                          style={[
                            styles.tankAvatar,
                            {
                              backgroundColor: hasAlert ? "#FEF2F2" : "#EFF6FF",
                            },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="water-outline"
                            size={26}
                            color={
                              hasAlert
                                ? theme.colors.danger
                                : theme.colors.primary
                            }
                          />
                        </View>
                        <View style={{ flex: 1, marginLeft: 15 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Text style={styles.tankName}>{tank.name}</Text>
                            {hasAlert && (
                              <View
                                style={{
                                  marginLeft: 8,
                                  backgroundColor: "#FEF2F2",
                                  paddingHorizontal: 6,
                                  borderRadius: 4,
                                  borderWidth: 1,
                                  borderColor: "#FECACA",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 9,
                                    color: theme.colors.danger,
                                    fontWeight: "700",
                                  }}
                                >
                                  CẢNH BÁO
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text
                            style={{
                              fontSize: 12,
                              color: theme.colors.textSecondary,
                              marginTop: 4,
                            }}
                          >
                            Giám sát thông số cảm biến & thiết bị
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={theme.colors.border}
                        />
                      </View>

                      <View
                        style={[
                          styles.detailBtn,
                          { marginTop: 15 }, // <--- THÊM DÒNG NÀY ĐỂ TẠO KHOẢNG TRỐNG
                          hasAlert && { backgroundColor: "#FEF2F2" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.detailBtnText,
                            hasAlert && { color: theme.colors.danger },
                          ]}
                        >
                          Xem biểu đồ & Thiết bị
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Không tìm thấy bể nuôi nào
                  </Text>
                </View>
              ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Drawer>
  );
}

const SidebarItem = ({ icon, label, value }: any) => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: theme.colors.kpi.temp.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Ionicons name={icon} size={18} color={theme.colors.primary} />
    </View>
    <View style={{ marginLeft: 12 }}>
      <Text
        style={{
          fontSize: 10,
          color: theme.colors.textSecondary,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: theme.colors.textPrimary,
        }}
      >
        {value}
      </Text>
    </View>
  </View>
);

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
import { Drawer } from "react-native-drawer-layout";
import { dashboardApi } from "@/api/dashboardApi";
import axiosClient from "@/api/axiosClient";
import authService from "@/services/authService";

const { width } = Dimensions.get("window");

// Dữ liệu mẫu cho các chỉ số bể (Có thể thay thế bằng dữ liệu thực từ API)
const MOCK_TEMPLATE = {
  type: "Cá Rô Phi",
  volume: "50m³",
  count: "1,200 con",
};

export default function DashboardScreen() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Quản lý danh sách bể và tìm kiếm
  const [tanks, setTanks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullList, setShowFullList] = useState(false);

  const [farmInfo, setFarmInfo] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState({ totalTanks: 0, totalAlerts: 0 });

  const loadDashboardData = async () => {
    try {
      // Lấy thông tin trang trại và người dùng
      const [farmRes, userProfile] = await Promise.all([
        axiosClient.get("/farms?page=1&pageSize=1"),
        authService.getCurrentUserProfile(),
      ]);

      setFarmInfo(farmRes.data.data?.[0]);
      setUserData(userProfile);

      // Lấy danh sách bể nuôi và cảnh báo
      const [tankRes, alertRes] = await Promise.all([
        dashboardApi.getFishTanks(1, 20),
        dashboardApi.getAlerts(1, 1),
      ]);

      setTanks(tankRes.data.data || []);
      setStats({
        totalTanks: tankRes.data.meta?.totalItems || 0,
        totalAlerts: alertRes.data.meta?.totalItems || 0,
      });
    } catch (error) {
      console.error("Lỗi kết nối Dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Logic lọc tìm kiếm
  const filteredTanks = tanks.filter((tank) =>
    tank.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
          {farmInfo?.name || "Trang trại iRAS"}
        </Text>
      </View>
      <View style={{ padding: 20, gap: 25 }}>
        <SidebarItem
          icon="person-outline"
          label="Kỹ thuật viên"
          value={
            userData
              ? `${userData.firstName} ${userData.lastName}`
              : "Đang tải..."
          }
        />
        <SidebarItem
          icon="location-outline"
          label="Địa chỉ"
          value={farmInfo?.address || "Đang cập nhật..."}
        />
        <SidebarItem
          icon="call-outline"
          label="Điện thoại"
          value={farmInfo?.phoneNumber || "Đang cập nhật..."}
        />
        <SidebarItem
          icon="mail-outline"
          label="Email"
          value={farmInfo?.email || "Đang cập nhật..."}
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
          {/* 1. HEADER SECTION  */}
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
              <TouchableOpacity style={styles.notiBtn}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={theme.colors.white}
                />
                {stats.totalAlerts > 0 && <View style={styles.notiBadge} />}
              </TouchableOpacity>
            </View>

            {/* Quick Stats Cards inside Header */}
            <View style={styles.quickStatsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Tổng số bể</Text>
                <Text style={styles.statValue}>{stats.totalTanks}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Cảnh báo</Text>
                <Text
                  style={[styles.statValue, { color: theme.colors.warning }]}
                >
                  {stats.totalAlerts}
                </Text>
              </View>
            </View>
          </View>

          {/* 2. FLOATING SEARCH BAR */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={20}
                color={theme.colors.textSecondary}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm bể nuôi..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* 3. TANK LIST SECTION */}
          <View style={styles.tankContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Danh sách bể nuôi</Text>
              {filteredTanks.length > 3 && (
                <TouchableOpacity
                  onPress={() => setShowFullList(!showFullList)}
                >
                  <Text style={styles.viewAll}>
                    {showFullList ? "Thu gọn" : "Xem tất cả"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {displayedTanks.length > 0 ? (
              displayedTanks.map((tank) => (
                <TouchableOpacity
                  key={tank.id}
                  style={styles.tankCard}
                  onPress={() => router.push(`/tankDetail/${tank.id}`)}
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
                      <Text style={styles.tankName}>{tank.name}</Text>
                      <Text style={styles.fishName}>{MOCK_TEMPLATE.type}</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.colors.border}
                    />
                  </View>

                  <View style={styles.tankStatsGrid}>
                    <View style={styles.gridItem}>
                      <Text style={styles.gridLabel}>DUNG TÍCH</Text>
                      <Text style={styles.gridValue}>
                        {MOCK_TEMPLATE.volume}
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
                      <Text style={styles.gridLabel}>SỐ LƯỢNG</Text>
                      <Text style={styles.gridValue}>
                        {MOCK_TEMPLATE.count}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailBtn}>
                    <Text style={styles.detailBtnText}>Chi tiết bể nuôi</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Không tìm thấy kết quả phù hợp
                </Text>
              </View>
            )}
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

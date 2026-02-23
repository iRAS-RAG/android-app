import { styles } from "@/styles/dashboard/dashboard.styles";
import { theme } from "@/theme";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
} from "react-native";
import { Drawer } from "react-native-drawer-layout";
import { dashboardApi } from "@/api/dashboardApi";
import axiosClient from "@/api/axiosClient";
import authService from "@/services/authService"; // Import service để gọi profile

const { width } = Dimensions.get("window");

// DỮ LIỆU GIẢ LẬP CHO CÁC PHẦN CHƯA CÓ API SENSOR CHI TIẾT
const MOCK_TEMPLATE = {
  type: "Cá Rô Phi",
  englishName: "Tilapia",
  volume: "50m³",
  count: "1,200 con",
  temp: 28.5,
  ph: 7.2,
  do: 5.8,
  sensors: [
    {
      label: "Nhiệt độ",
      value: "28.5",
      unit: "°C",
      time: "2 phút trước",
      icon: "thermometer",
      color: theme.colors.danger,
    },
    {
      label: "pH",
      value: "7.2",
      unit: "pH",
      time: "1 phút trước",
      icon: "droplet",
      color: theme.colors.primary,
    },
    {
      label: "Oxy hòa tan",
      value: "6.8",
      unit: "mg/L",
      time: "5 phút trước",
      icon: "wind",
      color: theme.colors.success,
    },
  ],
};

export default function DashboardScreen() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSensor, setActiveSensor] = useState(0);

  // STATE DỮ LIỆU
  const [tanks, setTanks] = useState<any[]>([]);
  const [farmInfo, setFarmInfo] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null); // State lưu thông tin người dùng thật
  const [stats, setStats] = useState({ totalTanks: 0, totalAlerts: 0 });

  const loadDashboardData = async () => {
    try {
      // 1. Lấy thông tin Farm và Profile người dùng đồng thời
      const [farmRes, userProfile] = await Promise.all([
        axiosClient.get("/farms?page=1&pageSize=1"),
        authService.getCurrentUserProfile(), // Gọi API thật /api/users/me
      ]);

      setFarmInfo(farmRes.data.data?.[0]);
      setUserData(userProfile); // Lưu dữ liệu user thật

      // 2. Lấy dữ liệu Dashboard
      const [tankRes, alertRes] = await Promise.all([
        dashboardApi.getFishTanks(1, 10),
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

  // NỘI DUNG SIDEBAR (DRAWER)
  const renderDrawerContent = () => (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
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
          <MaterialCommunityIcons name="home-modern" size={30} color="#FFF" />
        </View>
        <Text style={{ ...theme.typography.h3, marginTop: 15 }}>
          {farmInfo?.name || "Trang trại iRAS"}
        </Text>
        <Text
          style={{
            ...theme.typography.caption,
            color: theme.colors.textSecondary,
          }}
        >
          Quản lý hệ thống RAS chuyên sâu
        </Text>
      </View>

      <View style={{ padding: 20, gap: 25 }}>
        {/* HIỂN THỊ TÊN NGƯỜI DÙNG THẬT TRONG SIDEBAR */}
        <SidebarItem
          icon="person-outline"
          label="Tên kỹ thuật viên"
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

      <TouchableOpacity
        style={{
          marginTop: "auto",
          margin: 20,
          padding: 15,
          backgroundColor: "#F8FAFC",
          borderRadius: 12,
          alignItems: "center",
        }}
        onPress={() => setOpen(false)}
      >
        <Text style={{ color: theme.colors.primary, fontWeight: "700" }}>
          Thu nhỏ Menu
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
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
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
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
          {/* PHẦN 1: HEADER */}
          <View style={styles.headerSection}>
            <View style={styles.headerInfo}>
              <TouchableOpacity onPress={() => setOpen(true)}>
                <Ionicons name="menu" size={28} color="#334155" />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.farmName}>
                  {farmInfo?.name || "Hệ thống RAS"}
                </Text>
                {/* ĐÃ THAY ĐỔI: HIỂN THỊ TÊN THẬT TỪ API */}
                <Text style={styles.techName}>
                  {userData
                    ? `${userData.roleName}: ${userData.firstName} ${userData.lastName}`
                    : "Đang tải thông tin..."}
                </Text>
              </View>
              <TouchableOpacity style={styles.notiBtn}>
                <Ionicons
                  name="notifications-outline"
                  size={26}
                  color="#334155"
                />
                <View style={styles.notiBadge} />
              </TouchableOpacity>
            </View>

            <View style={styles.quickStatsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Tổng số bể</Text>
                <Text style={styles.statValue}>{stats.totalTanks}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Cảnh báo</Text>
                <Text
                  style={[styles.statValue, { color: theme.colors.danger }]}
                >
                  {stats.totalAlerts}
                </Text>
              </View>
            </View>
          </View>

          {/* PHẦN 2: CẢM BIẾN (MOCK) */}
          <View style={styles.sensorContainer}>
            <Text style={styles.sectionTitle}>Cảm biến theo dõi</Text>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const slide = Math.ceil(
                  e.nativeEvent.contentOffset.x /
                    e.nativeEvent.layoutMeasurement.width,
                );
                if (slide !== activeSensor) setActiveSensor(slide);
              }}
            >
              {MOCK_TEMPLATE.sensors.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.sensorCard,
                    { borderLeftColor: item.color, borderLeftWidth: 4 },
                  ]}
                >
                  <Feather
                    name={item.icon as any}
                    size={20}
                    color={item.color}
                  />
                  <Text style={styles.sensorLabel}>{item.label}</Text>
                  <View
                    style={{ flexDirection: "row", alignItems: "baseline" }}
                  >
                    <Text style={[styles.sensorValue, { color: item.color }]}>
                      {item.value}
                    </Text>
                    <Text style={styles.sensorUnit}> {item.unit}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* PHẦN 3: DANH SÁCH BỂ */}
          <View style={styles.tankContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Danh sách bể nuôi</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {tanks.map((tank) => (
              <View key={tank.id} style={styles.tankCard}>
                <View style={styles.tankHeader}>
                  <View style={styles.tankAvatar}>
                    <MaterialCommunityIcons
                      name="fish"
                      size={24}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.tankName}>{tank.name}</Text>
                    <Text style={styles.fishName}>{MOCK_TEMPLATE.type}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </View>

                <View style={styles.tankStatsGrid}>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Dung tích</Text>
                    <Text style={styles.gridValue}>{MOCK_TEMPLATE.volume}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Số lượng</Text>
                    <Text style={styles.gridValue}>{MOCK_TEMPLATE.count}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.detailBtn}
                  onPress={() => router.push(`/tankDetail/${tank.id}`)}
                >
                  <Text style={styles.detailBtnText}>Xem chi tiết</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
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
        backgroundColor: "#EFF6FF",
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

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
} from "react-native";
import { dashboardApi } from "@/api/dashboardApi";

// DỮ LIỆU GIẢ LẬP (MOCK) - Dùng cho các phần Backend chưa có API đầy đủ
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
      icon: "thermometer",
      color: theme.colors.danger,
    },
    {
      label: "pH",
      value: "7.2",
      unit: "pH",
      icon: "droplet",
      color: theme.colors.primary,
    },
    {
      label: "Oxy hòa tan",
      value: "6.8",
      unit: "mg/L",
      icon: "wind",
      color: theme.colors.success,
    },
  ],
};

export default function DashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSensor, setActiveSensor] = useState(0);

  // STATE DỮ LIỆU THẬT
  const [tanks, setTanks] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalTanks: 0,
    totalAlerts: 0,
  });

  const loadDashboardData = async () => {
    try {
      // Gọi các API đã có sẵn từ Backend
      const [tankRes, alertRes] = await Promise.all([
        dashboardApi.getFishTanks(1, 10),
        dashboardApi.getAlerts(1, 1),
      ]);

      // Ánh xạ dữ liệu dựa trên kết quả Swagger thực tế
      const apiTanks = tankRes.data.data || [];
      const totalTanksFromApi = tankRes.data.meta?.totalItems || 0;
      const totalAlertsFromApi = alertRes.data.meta?.totalItems || 0;

      setTanks(apiTanks);
      setStats({
        totalTanks: totalTanksFromApi,
        totalAlerts: totalAlertsFromApi,
      });
    } catch (error) {
      console.error("Lỗi kết nối API Dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* PHẦN 1: HEADER & THỐNG KÊ NHANH (API THẬT) */}
        <View style={styles.headerSection}>
          <View style={styles.headerInfo}>
            <TouchableOpacity>
              <Ionicons name="menu" size={28} color="#334155" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.farmName}>
                {tanks[0]?.farmName || "Hệ thống RAS"}
              </Text>
              <Text style={styles.techName}>Kỹ thuật viên: Nguyễn Văn A</Text>
            </View>
          </View>

          <View style={styles.quickStatsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Tổng số bể</Text>
              <Text style={styles.statValue}>{stats.totalTanks}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Cảnh báo</Text>
              <Text style={[styles.statValue, { color: theme.colors.danger }]}>
                {stats.totalAlerts}
              </Text>
            </View>
          </View>
        </View>

        {/* PHẦN 2: CẢM BIẾN (DỮ LIỆU GIẢ LẬP) */}
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
                <Feather name={item.icon as any} size={20} color={item.color} />
                <Text style={styles.sensorLabel}>{item.label}</Text>
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text style={[styles.sensorValue, { color: item.color }]}>
                    {item.value}
                  </Text>
                  <Text style={styles.sensorUnit}> {item.unit}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* PHẦN 3: DANH SÁCH BỂ NUÔI (HỖN HỢP API THẬT & MOCK) */}
        <View style={styles.tankContainer}>
          <Text style={styles.sectionTitle}>Danh sách bể nuôi</Text>
          {tanks.length > 0 ? (
            tanks.map((tank) => (
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
                    <Text style={styles.fishEnglish}>
                      {MOCK_TEMPLATE.englishName}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </View>

                {/* Grid stats dùng Mock vì API FishTank hiện tại chưa có data này */}
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

                <View style={styles.envGrid}>
                  <EnvItem
                    label="Nhiệt độ"
                    value={`${MOCK_TEMPLATE.temp}°C`}
                    color={theme.colors.danger}
                  />
                  <EnvItem
                    label="pH"
                    value={MOCK_TEMPLATE.ph}
                    color={theme.colors.primary}
                  />
                  <EnvItem
                    label="DO"
                    value={MOCK_TEMPLATE.do}
                    color={theme.colors.success}
                  />
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
            ))
          ) : (
            <Text
              style={{
                textAlign: "center",
                marginTop: 20,
                color: theme.colors.textSecondary,
              }}
            >
              Chưa có dữ liệu từ hệ thống.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const EnvItem = ({ label, value, color }: any) => (
  <View style={[styles.envItem, { backgroundColor: `${color}10` }]}>
    <Text style={[styles.envLabel, { color }]}>{label}</Text>
    <Text style={[styles.envValue, { color }]}>{value}</Text>
  </View>
);

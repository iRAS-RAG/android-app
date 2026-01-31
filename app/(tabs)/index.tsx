import { styles } from "@/styles/dashboard/dashboard.styles";
import { theme } from "@/theme";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Giả lập dữ liệu bể nuôi theo hình ảnh thiết kế
const TANKS_DATA = [
  {
    id: "A-01",
    type: "Cá Rô Phi",
    englishName: "Tilapia",
    volume: "50m³",
    count: "1,200 con",
    temp: 28.5,
    ph: 7.2,
    do: 5.8,
    status: "warning",
  },
  {
    id: "A-02",
    type: "Cá Tra",
    englishName: "Pangasius",
    volume: "50m³",
    count: "980 con",
    temp: 29,
    ph: 7.4,
    do: 6.5,
    status: "safe",
  },
  {
    id: "B-01",
    type: "Tôm Sú",
    englishName: "Black Tiger Shrimp",
    volume: "30m³",
    count: "5,000 con",
    temp: 27.5,
    ph: 7.8,
    do: 7.2,
    status: "safe",
  },
];

const SENSOR_DATA = [
  {
    label: "Nhiệt độ",
    value: "28.5",
    unit: "°C",
    time: "2 phút trước", // Thêm thời gian
    icon: "thermometer", // Đổi sang Feather icon
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
];

export default function DashboardScreen() {
  const router = useRouter();
  const [activeSensor, setActiveSensor] = useState(0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PHẦN 1: HEADER & THỐNG KÊ NHANH */}
        <View style={styles.headerSection}>
          <View style={styles.headerInfo}>
            <TouchableOpacity
              onPress={() => {
                /* Logic mở Drawer */
              }}
            >
              <Ionicons name="menu" size={28} color="#334155" />
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 15 }}>
              {/* Tên trang trại và kĩ thuật viên sẽ được đẩy sát lên trên */}
              <Text style={[styles.farmName, { lineHeight: 24 }]}>
                Trang trại Hải Phòng
              </Text>
              <Text style={styles.techName}>Kỹ thuật viên: Nguyễn Văn A</Text>
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
              <Text style={styles.statValue}>5</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Cảnh báo</Text>
              <Text style={[styles.statValue, { color: theme.colors.danger }]}>
                6
              </Text>
            </View>
          </View>
        </View>

        {/* PHẦN 2: CẢM BIẾN TRỌNG TÂM */}
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
            {SENSOR_DATA.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.sensorCard,
                  { borderLeftColor: item.color, borderLeftWidth: 4 }, // Border trái giống trang chi tiết
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
                <Text style={styles.sensorTime}>{item.time}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.paginationDots}>
            {SENSOR_DATA.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeSensor && styles.activeDot]}
              />
            ))}
          </View>
        </View>

        {/* PHẦN 3: DANH SÁCH BỂ NUÔI */}
        <View style={styles.tankContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh sách bể nuôi</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {TANKS_DATA.map((tank) => (
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
                  <Text style={styles.tankName}>Bể {tank.id}</Text>
                  <Text style={styles.fishName}>{tank.type}</Text>
                  <Text style={styles.fishEnglish}>{tank.englishName}</Text>
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
                  <Text style={styles.gridValue}>{tank.volume}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Số lượng</Text>
                  <Text style={styles.gridValue}>{tank.count}</Text>
                </View>
              </View>

              <View style={styles.envGrid}>
                <EnvItem
                  label="Nhiệt độ"
                  value={`${tank.temp}°C`}
                  color={theme.colors.danger}
                />
                <EnvItem
                  label="pH"
                  value={tank.ph}
                  color={theme.colors.primary}
                />
                <EnvItem
                  label="DO"
                  value={tank.do}
                  color={theme.colors.success}
                />
              </View>

              <TouchableOpacity
                style={styles.detailBtn}
                onPress={() => {
                  // Điều hướng đến trang chi tiết với ID tương ứng
                  router.push(`/tankDetail/${tank.id}`);
                }}
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
  );
}

// Component con để render chỉ số môi trường
const EnvItem = ({ label, value, color }: any) => (
  <View style={[styles.envItem, { backgroundColor: `${color}10` }]}>
    <Text style={[styles.envLabel, { color }]}>{label}</Text>
    <Text style={[styles.envValue, { color }]}>{value}</Text>
  </View>
);

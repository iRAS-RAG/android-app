import { styles } from "@/styles/tankDetail/tankDetail.styles";
import { theme } from "@/theme";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

// Cấu hình biểu đồ pH
const chartConfig = {
  backgroundGradientFrom: "#FFF",
  backgroundGradientTo: "#FFF",
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  strokeWidth: 2,
  decimalPlaces: 1,
  propsForDots: { r: "4", strokeWidth: "2", stroke: "#3B82F6" },
};

export default function TankDetailScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#334155" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Giám sát cảm biến</Text>
          <Text style={styles.headerSubTitle}>Bể A-01 • Cá Rô Phi</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={{ marginRight: 15 }}>
            <Ionicons name="refresh" size={22} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={22} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Thông số cảm biến */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Thông số cảm biến</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.metricRow}
          >
            <MetricCard
              label="Nhiệt độ"
              value="28.5"
              unit="°C"
              time="2 phút trước"
              color={theme.colors.danger}
              icon="thermometer"
            />
            <MetricCard
              label="Độ pH"
              value="7.2"
              unit="pH"
              time="1 phút trước"
              color={theme.colors.primary}
              icon="droplet"
            />
            <MetricCard
              label="Oxy hòa tan"
              value="5.8"
              unit="mg/L"
              time="5 phút trước"
              color={theme.colors.success}
              icon="wind"
            />
          </ScrollView>
        </View>

        {/* Biểu đồ xu hướng pH */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Độ pH - 24 giờ qua</Text>
            <View style={styles.liveBadge}>
              <View style={styles.dot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>

          <LineChart
            data={{
              labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
              datasets: [{ data: [7.1, 7.3, 7.5, 7.4, 7.6, 7.2] }],
            }}
            width={screenWidth - 70}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 16, paddingRight: 40 }}
          />

          <View style={styles.thresholdRow}>
            <ThresholdBox label="Ngưỡng thấp" value="6.5 pH" color="#3B82F6" />
            <ThresholdBox label="Vùng tối ưu" value="7-8" color="#10B981" />
            <ThresholdBox label="Ngưỡng cao" value="8.5 pH" color="#EF4444" />
          </View>
        </View>

        {/* Trạng thái máy bơm */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Trạng thái máy bơm</Text>
          <PumpCard
            id="1"
            status="Hoạt động bình thường"
            statusColor={theme.colors.success}
          />
        </View>

        {/* Nút AI [Sửa icon sparkles -> auto-fix] */}
        <TouchableOpacity style={styles.aiButton}>
          <MaterialCommunityIcons name="auto-fix" size={20} color="#FFF" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.aiButtonText}>Chạy chẩn đoán AI</Text>
            <Text style={styles.aiButtonSub}>
              Phân tích tình trạng hệ thống
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// CÁC COMPONENT PHỤ (Đã sửa lỗi undefined)
const MetricCard = ({ label, value, unit, time, color, icon }: any) => (
  <View
    style={[styles.metricCard, { borderLeftColor: color, borderLeftWidth: 4 }]}
  >
    <Feather name={icon} size={20} color={color} />
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
    <Text style={styles.metricTime}>{time}</Text>
  </View>
);

const ThresholdBox = ({ label, value, color }: any) => (
  <View style={{ alignItems: "center" }}>
    <Text style={{ fontSize: 10, color: theme.colors.textSecondary }}>
      {label}
    </Text>
    <Text style={{ fontSize: 12, fontWeight: "700", color }}>{value}</Text>
  </View>
);

const GridItem = ({ label, value, icon }: any) => (
  <View style={styles.gridItem}>
    <MaterialCommunityIcons
      name={icon}
      size={16}
      color={theme.colors.textSecondary}
    />
    <Text
      style={{ fontSize: 10, color: theme.colors.textSecondary, marginTop: 4 }}
    >
      {label}
    </Text>
    <Text style={{ fontSize: 13, fontWeight: "700" }}>{value}</Text>
  </View>
);

const ProgressItem = ({ label, value, color }: any) => (
  <View style={styles.progressContainer}>
    <Text style={{ fontSize: 10, color: theme.colors.textSecondary }}>
      {label}
    </Text>
    <Text style={{ fontSize: 13, fontWeight: "700" }}>{value}%</Text>
    <View style={styles.progressBarBg}>
      <View
        style={[
          styles.progressBarFill,
          { width: `${value}%`, backgroundColor: color },
        ]}
      />
    </View>
  </View>
);

const PumpCard = ({ id, status, statusColor }: any) => (
  <View style={styles.pumpContainer}>
    <View style={styles.pumpHeader}>
      <MaterialCommunityIcons name="engine" size={24} color={statusColor} />
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.pumpTitle}>Máy bơm #{id}</Text>
        <Text style={[styles.pumpStatus, { color: statusColor }]}>
          ● {status}
        </Text>
      </View>
    </View>
    <View style={styles.pumpGrid}>
      <GridItem label="Tốc độ quay" value="1450 RPM" icon="fan" />
      <GridItem label="Rung động" value="2.3 mm/s" icon="vibrate" />
      <ProgressItem label="Công suất" value={85} color="#3B82F6" />
      <ProgressItem label="Hiệu suất" value={92} color="#10B981" />
    </View>
  </View>
);

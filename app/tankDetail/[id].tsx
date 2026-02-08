import { styles } from "@/styles/tankDetail/tankDetail.styles";
import { theme } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { tankDetailService } from "@/services/tankDetailService";

const screenWidth = Dimensions.get("window").width;

// --- CÁC COMPONENT PHỤ ---

const MetricCard = ({ label, value, unit, time, color, icon }: any) => (
  <View
    style={[styles.metricCard, { borderLeftColor: color, borderLeftWidth: 4 }]}
  >
    <Feather name={icon} size={20} color={color} />
    <Text style={styles.metricLabel}>{label}</Text>
    <View style={{ flexDirection: "row", alignItems: "baseline" }}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={[styles.metricUnit, { color, fontSize: 12, marginLeft: 2 }]}>
        {unit}
      </Text>
    </View>
    <Text style={styles.metricTime}>{time}</Text>
  </View>
);

const ThresholdBox = ({ label, value, color }: any) => (
  <View style={{ alignItems: "center", flex: 1 }}>
    <Text
      style={{
        fontSize: 10,
        color: theme.colors.textSecondary,
        marginBottom: 2,
      }}
    >
      {label}
    </Text>
    <Text style={{ fontSize: 12, fontWeight: "700", color: color }}>
      {value}
    </Text>
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

const PumpCard = ({ device, statusColor }: any) => {
  // Mock dữ liệu vận hành nếu Backend chưa trả về các trường kỹ thuật chi tiết
  const displayData = {
    name: device?.name || "Máy bơm #01",
    status:
      device?.status === "Active" ? "Hoạt động bình thường" : "Mất kết nối",
    rotationSpeed: device?.rotationSpeed || "1450",
    vibration: device?.vibration || "2.3",
    powerUsage: device?.powerUsage || 85,
    efficiency: device?.efficiency || 92,
  };

  return (
    <View style={styles.pumpContainer}>
      <View style={styles.pumpHeader}>
        <MaterialCommunityIcons
          name={device ? "engine" : "engine-off"}
          size={24}
          color={device ? statusColor : theme.colors.danger}
        />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.pumpTitle}>{displayData.name}</Text>
          <Text
            style={[
              styles.pumpStatus,
              { color: device ? statusColor : theme.colors.danger },
            ]}
          >
            ● {displayData.status}
          </Text>
        </View>
      </View>
      <View style={styles.pumpGrid}>
        <GridItem
          label="Tốc độ quay"
          value={`${displayData.rotationSpeed} RPM`}
          icon="fan"
        />
        <GridItem
          label="Rung động"
          value={`${displayData.vibration} mm/s`}
          icon="vibrate"
        />
        <ProgressItem
          label="Công suất"
          value={displayData.powerUsage}
          color="#3B82F6"
        />
        <ProgressItem
          label="Hiệu suất"
          value={displayData.efficiency}
          color="#10B981"
        />
      </View>
    </View>
  );
};

// --- MÀN HÌNH CHÍNH ---

export default function TankDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      // Kết nối API thật thông qua service (kèm Mock cho các phần chưa có API)
      const res = await tankDetailService.getTankFullDetails(id as string);
      setData(res);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu chi tiết bể:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Header - Sử dụng dữ liệu THẬT từ FishTankController */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#334155" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Giám sát cảm biến</Text>
          <Text style={styles.headerSubTitle}>
            {data?.tankInfo?.name || "Bể nuôi"} •{" "}
            {data?.tankInfo?.farmName || "Trang trại"}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* 1. Thông số cảm biến - Hiện đang sử dụng MOCK data */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Thông số cảm biến</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.metricRow}
          >
            {data?.metrics.map((m: any, idx: number) => (
              <MetricCard key={idx} {...m} />
            ))}
          </ScrollView>
        </View>

        {/* 2. Biểu đồ xu hướng pH & Ngưỡng an toàn - Hiện đang sử dụng MOCK data */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Độ pH - 24 giờ qua</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#EF4444",
                  marginRight: 5,
                }}
              />
              <Text
                style={{ fontSize: 12, color: "#EF4444", fontWeight: "700" }}
              >
                Live
              </Text>
            </View>
          </View>

          <LineChart
            data={data?.chartData}
            width={screenWidth - 40}
            height={180}
            chartConfig={{
              backgroundGradientFrom: "#FFF",
              backgroundGradientTo: "#FFF",
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              strokeWidth: 2,
              decimalPlaces: 1,
              propsForDots: { r: "4", strokeWidth: "2", stroke: "#3B82F6" },
            }}
            bezier
            style={{ borderRadius: 16, marginTop: 15, paddingRight: 40 }}
          />

          {/* HIỂN THỊ 3 NGƯỠNG DƯỚI BIỂU ĐỒ - Mock từ thresholds service */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 20,
              paddingTop: 15,
              borderTopWidth: 1,
              borderTopColor: "#F1F5F9",
            }}
          >
            <ThresholdBox
              label="Ngưỡng thấp"
              value={data?.thresholds?.low || "6.5 pH"}
              color="#3B82F6"
            />
            <ThresholdBox
              label="Vùng tối ưu"
              value={data?.thresholds?.optimal || "7.0 - 8.0"}
              color="#10B981"
            />
            <ThresholdBox
              label="Ngưỡng cao"
              value={data?.thresholds?.high || "8.5 pH"}
              color="#EF4444"
            />
          </View>
        </View>

        {/* 3. Trạng thái các thiết bị điều khiển */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Trạng thái thiết bị</Text>

          {data?.pumps?.map((device: any) => (
            <PumpCard
              key={device.id}
              device={device}
              statusColor={
                device.state ? theme.colors.success : theme.colors.danger
              }
            />
          ))}

          {/* Nếu không có thiết bị nào */}
          {data?.pumps?.length === 0 && (
            <Text
              style={{ textAlign: "center", color: theme.colors.textSecondary }}
            >
              Không tìm thấy thiết bị điều khiển cho bể này.
            </Text>
          )}
        </View>

        {/* 4. Chẩn đoán AI - Logic xử lý sẽ bổ sung sau */}
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

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
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { tankDetailService } from "@/services/tankDetailService";
import { tankDetailApi } from "@/api/tankDetailApi";

const screenWidth = Dimensions.get("window").width;
const chartConfig = {
  backgroundGradientFrom: "#FFF",
  backgroundGradientTo: "#FFF",
  decimalPlaces: 1, // Số chữ số thập phân
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Màu đường kẻ (Xanh dương mặc định)
  labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`, // Màu chữ trục X, Y
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "5",
    strokeWidth: "2",
    stroke: "#3B82F6",
  },
  propsForBackgroundLines: {
    strokeDasharray: "5", // Đường lưới đứt đoạn
    stroke: "#E2E8F0",
  },
};
export default function TankDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Quản lý trạng thái dữ liệu
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tankData, setTankData] = useState<any>(null);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any>(null);

  // Quản lý popup xác nhận bật/tắt thiết bị điều khiển
  const [deviceToToggle, setDeviceToToggle] = useState<any>(null);
  const [isToggling, setIsToggling] = useState(false);

  // 1. Tải toàn bộ dữ liệu lần đầu hoặc khi làm mới
  const loadFullData = async () => {
    try {
      const data = await tankDetailService.getTankFullDetails(id as string);
      setTankData(data);

      // Thiết lập mặc định cho cảm biến đầu tiên
      if (data.metrics && data.metrics.length > 0 && !selectedSensorId) {
        const firstSensor = data.metrics[0];
        setSelectedSensorId(firstSensor.id);

        // Kiểm tra dữ liệu biểu đồ ban đầu tránh lỗi NaN
        if (
          data.initialChartData &&
          data.initialChartData.datasets[0].data.length > 0
        ) {
          setChartData(data.initialChartData);
        } else {
          setChartData(null);
        }
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu chi tiết bể:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 2. Xử lý thay đổi cảm biến để cập nhật biểu đồ xu hướng
  const handleSensorChange = async (sensorId: string) => {
    setSelectedSensorId(sensorId);
    try {
      const logsRes = await tankDetailApi.getSensorLogs(sensorId);
      const logs = logsRes.data?.data || [];

      if (Array.isArray(logs) && logs.length > 0) {
        // SỬA Ở ĐÂY: Sử dụng trường 'average' từ BE làm giá trị đo thay vì 'data'
        const validLogs = logs.filter(
          (l: any) => l.average !== null && !isNaN(Number(l.average)),
        );
        const displayLogs = validLogs.slice(0, 6).reverse();

        if (displayLogs.length > 0) {
          setChartData({
            labels: displayLogs.map((l: any) => {
              // Sử dụng 'createdAt' hoặc 'periodStart' làm mốc thời gian
              const date = new Date(l.createdAt || l.periodStart);
              return isNaN(date.getTime()) ? "--" : `${date.getHours()}h`;
            }),
            datasets: [
              {
                // SỬA Ở ĐÂY: Dùng l.average
                data: displayLogs.map((l: any) => Number(l.average)),
              },
            ],
          });
        } else {
          setChartData(null);
        }
      } else {
        setChartData(null);
      }
    } catch (error) {
      console.error("Lỗi tải log cảm biến:", error);
      setChartData(null);
    }
  };

  // 3. Xác nhận bật/tắt thiết bị điều khiển
  const handleConfirmToggle = async () => {
    if (!deviceToToggle) return;
    setIsToggling(true);
    try {
      await tankDetailApi.toggleControlDevice(
        deviceToToggle.id,
        !deviceToToggle.status,
      );
      await loadFullData();
    } catch (error) {
      console.error("Lỗi chuyển trạng thái thiết bị:", error);
      Alert.alert(
        "Lỗi",
        "Không thể chuyển trạng thái thiết bị. Vui lòng thử lại.",
      );
    } finally {
      setIsToggling(false);
      setDeviceToToggle(null);
    }
  };

  useEffect(() => {
    loadFullData();
  }, [id]);

  if (loading)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: "#F8FAFC",
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );

  const activeMetric = tankData?.metrics.find(
    (m: any) => m.id === selectedSensorId,
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#334155" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Giám sát thông số</Text>
          <Text style={styles.headerSubTitle}>
            {tankData?.tankInfo?.name || "Bể nuôi"} •{" "}
            {tankData?.tankInfo?.farmName || "Hệ thống iRAS"}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadFullData();
            }}
          />
        }
      >
        {/* 1. Danh sách cảm biến (Sử dụng dữ liệu từ TankSensorLatestDataDto) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>
            Cảm biến hiện tại (Chọn để xem biểu đồ){" "}
            <Text style={styles.sensorCountInline}>
              ({tankData?.metrics?.length || 0} loại)
            </Text>
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.metricRow}
          >
            {tankData?.metrics.map((m: any) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => handleSensorChange(m.id)}
                style={[
                  styles.metricCard,
                  { borderLeftColor: m.color, borderLeftWidth: 4 },
                  selectedSensorId === m.id && {
                    backgroundColor: `${m.color}15`,
                    borderWidth: 1,
                    borderColor: m.color,
                  },
                ]}
              >
                <Feather name={m.icon} size={20} color={m.color} />
                <Text style={styles.metricLabel}>{m.label}</Text>
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text style={[styles.metricValue, { color: m.color }]}>
                    {m.value}
                  </Text>
                  <Text
                    style={[
                      styles.metricUnit,
                      { color: m.color, fontSize: 12, marginLeft: 2 },
                    ]}
                  >
                    {m.unit}
                  </Text>
                </View>
                <Text style={styles.metricTime}>{m.time}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 2. Biểu đồ xu hướng (Đã thêm kiểm tra an toàn dữ liệu) */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>
              Xu hướng {activeMetric?.label || ""}
            </Text>
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

          {chartData ? (
            <LineChart
              data={chartData}
              width={screenWidth - 40}
              height={180}
              chartConfig={chartConfig}
              // Chỉ bật bezier khi có từ 3 điểm dữ liệu trở lên
              bezier={chartData.datasets[0].data.length > 2}
              style={{ borderRadius: 16, marginTop: 15 }}
            />
          ) : (
            <View
              style={{
                height: 180,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="chart-line-variant"
                size={40}
                color="#CBD5E1"
              />
              <Text
                style={{ color: theme.colors.textSecondary, marginTop: 10 }}
              >
                Không có dữ liệu biểu đồ hợp lệ
              </Text>
            </View>
          )}
        </View>

        {/* 3. Trạng thái thiết bị điều khiển (Đồng bộ từ HardwareController) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>
            Trạng thái thiết bị điều khiển
          </Text>
          {tankData?.pumps && tankData.pumps.length > 0 ? (
            tankData.pumps.map((device: any) => (
              <View key={device.id} style={styles.pumpContainer}>
                <View style={styles.pumpHeader}>
                  <MaterialCommunityIcons
                    name={device.status ? "engine" : "engine-off"}
                    size={24}
                    color={
                      device.status
                        ? theme.colors.success
                        : theme.colors.danger
                    }
                  />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.pumpTitle}>
                      {device.controlDeviceTypeName}
                    </Text>
                    <Text
                      style={[
                        styles.pumpStatus,
                        {
                          color: device.status
                            ? theme.colors.success
                            : theme.colors.danger,
                        },
                      ]}
                    >
                      ● {device.status ? "Đang hoạt động" : "Đã tắt"}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    {
                      backgroundColor: device.status
                        ? "#FEF2F2"
                        : theme.colors.primary,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setDeviceToToggle(device)}
                >
                  <MaterialCommunityIcons
                    name="power"
                    size={16}
                    color={device.status ? theme.colors.danger : "#FFF"}
                  />
                  <Text
                    style={[
                      styles.toggleBtnText,
                      {
                        color: device.status ? theme.colors.danger : "#FFF",
                      },
                    ]}
                  >
                    {device.status ? "Tắt thiết bị" : "Bật thiết bị"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyDeviceText}>
              Bể này chưa có thiết bị điều khiển nào.
            </Text>
          )}
        </View>

        {/* 4. AI Advisor */}
        <TouchableOpacity
          style={styles.aiButton}
          onPress={() => router.push("/aiAdvisor")}
        >
          <MaterialCommunityIcons
            name="robot-confused-outline"
            size={22}
            color="#FFF"
          />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.aiButtonText}>Phân tích AI Advisor</Text>
            <Text style={styles.aiButtonSub}>
              Dựa trên dữ liệu thực tế iRAS-RAG
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* POPUP XÁC NHẬN BẬT/TẮT THIẾT BỊ ĐIỀU KHIỂN */}
      <Modal
        visible={!!deviceToToggle}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isToggling) setDeviceToToggle(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>
              Xác nhận {deviceToToggle?.status ? "tắt" : "bật"} thiết bị
            </Text>
            <Text style={styles.confirmDesc}>
              Bạn sắp{" "}
              <Text
                style={{
                  fontWeight: "800",
                  color: deviceToToggle?.status
                    ? theme.colors.danger
                    : theme.colors.success,
                }}
              >
                {deviceToToggle?.status ? "TẮT" : "BẬT"}
              </Text>{" "}
              thiết bị{" "}
              <Text
                style={{ fontWeight: "800", color: theme.colors.textPrimary }}
              >
                {deviceToToggle?.controlDeviceTypeName}
              </Text>
              .
            </Text>
            <View style={styles.warningBox}>
              <MaterialCommunityIcons
                name="alert-outline"
                size={20}
                color="#EA580C"
              />
              <Text style={styles.warningText}>
                Đây là thiết bị đang vận hành trực tiếp trong môi trường bể
                nuôi. Bật/tắt sai thời điểm có thể làm thay đổi đột ngột điều
                kiện nước và gây nguy hiểm cho vật nuôi. Vui lòng kiểm tra kỹ
                tình trạng bể trước khi xác nhận.
              </Text>
            </View>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmBtn, styles.cancelBtn]}
                onPress={() => setDeviceToToggle(null)}
                disabled={isToggling}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  {
                    backgroundColor: deviceToToggle?.status
                      ? theme.colors.danger
                      : theme.colors.primary,
                  },
                ]}
                onPress={handleConfirmToggle}
                disabled={isToggling}
              >
                {isToggling ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>
                    {deviceToToggle?.status ? "Xác nhận tắt" : "Xác nhận bật"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

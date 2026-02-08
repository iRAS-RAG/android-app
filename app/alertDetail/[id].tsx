import { styles } from "@/styles/alerts/alertDetail.styles";
import { theme } from "@/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function AlertDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [currentStatus, setCurrentStatus] = useState("Đang xảy ra");

  const handleProcessAlert = () => {
    if (currentStatus === "Đang xảy ra") {
      // Bước 1: Đổi trạng thái sang "Đang xử lý"
      setCurrentStatus("Đang xử lý");
      // Bước 2: Chuyển hướng qua trang nhật ký
      router.push({
        pathname: "/maintenance/log",
        params: { id: id, type: "NH3" },
      });
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* HEADER ĐIỀU HƯỚNG */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết cảnh báo</Text>
        <TouchableOpacity>
          <Ionicons
            name="share-outline"
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Ô THÔNG TIN SỰ CỐ KHẨN CẤP */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={24}
                color={theme.colors.danger}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.alertTitle}>
                Mức NH₃ vượt ngưỡng nguy hiểm
              </Text>
              <View style={styles.dangerTag}>
                <Text style={styles.dangerTagText}>Nguy hiểm</Text>
              </View>
            </View>
          </View>
          <Text style={styles.alertDesc}>
            Nồng độ amoniac cao có thể gây độc cho cá trong thời gian ngắn.
          </Text>
          <View style={styles.metaRow}>
            <MetaItem icon="business-outline" label="Bể A-01" />
            <MetaItem icon="time-outline" label="2 phút trước" />
            <MetaItem icon="alert-circle-outline" label="Đang xảy ra" />
          </View>
        </View>

        {/* DỮ LIỆU THỰC TẾ & ĐỐI CHIẾU */}
        <View style={styles.currentValueCard}>
          <Text style={styles.sectionLabel}>Giá trị hiện tại</Text>
          <View style={styles.mainValueContainer}>
            <Text style={styles.currentValueText}>
              0.35 <Text style={{ fontSize: 18 }}>mg/L</Text>
            </Text>
            <View style={styles.trendingRow}>
              <Ionicons
                name="trending-up"
                size={16}
                color={theme.colors.danger}
              />
              <Text
                style={{
                  color: theme.colors.danger,
                  fontWeight: "700",
                  marginLeft: 4,
                }}
              >
                Đang tăng
              </Text>
            </View>
          </View>
          <View style={styles.comparisonGrid}>
            <CompBox
              label="Tối ưu"
              value="0-0.1"
              color={theme.colors.success}
            />
            <CompBox
              label="Ngưỡng an toàn"
              value="< 0.3"
              color={theme.colors.warning}
            />
            <CompBox
              label="Vượt ngưỡng"
              value="+17%"
              color={theme.colors.danger}
            />
          </View>
        </View>

        {/* BIỂU ĐỒ BIẾN ĐỘNG 24H */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionLabel}>Biến động 24 giờ</Text>
          <LineChart
            data={{
              labels: ["00:00", "06:00", "12:00", "18:00", "Hiện tại"],
              datasets: [{ data: [0.1, 0.15, 0.22, 0.32, 0.35] }],
            }}
            width={screenWidth - 70}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={{ marginVertical: 10, borderRadius: 16 }}
          />
        </View>

        {/* HƯỚNG DẪN XỬ LÝ TỪ AI (RAG) */}
        <View style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <MaterialCommunityIcons
              name="auto-fix"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.aiTitle}>Hướng dẫn xử lý từ AI</Text>
          </View>
          <StepItem
            num="1"
            title="Tăng cường sục khí ngay lập tức"
            desc="Tăng 30% để giảm NH₃ qua quá trình nitrat hóa"
            priority="Ưu tiên cao"
          />
          <StepItem
            num="2"
            title="Giảm lượng thức ăn 20-30%"
            desc="Tránh dư thừa chất hữu cơ tạo NH₃"
            priority="Ưu tiên cao"
          />
          <StepItem
            num="3"
            title="Thay nước 15-20%"
            desc="Pha loãng nồng độ NH₃ nhanh chóng"
            priority="Ưu tiên trung bình"
          />
        </View>

        {/* GHI CHÚ & HÀNH ĐỘNG */}
        <View style={styles.logSection}>
          <Text style={styles.sectionLabel}>Ghi chú xử lý</Text>
          <TextInput
            style={styles.noteInput}
            multiline
            placeholder="Nhập nhật ký xử lý tại đây..."
          />
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push(`/tankDetail/A-01`)}
          >
            <Ionicons
              name="eye-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.btnSecondaryText}>Xem chi tiết Bể A-01</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnWarning}>
            <Text style={styles.btnWhiteText}>
              Gửi yêu cầu đến kỹ thuật viên
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSuccess}>
            <Text style={styles.btnWhiteText}>Đánh dấu đã xử lý</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              currentStatus === "Đang xử lý"
                ? styles.btnSecondary
                : styles.btnSuccess,
              { marginTop: 10 },
            ]}
            onPress={handleProcessAlert}
          >
            <Text
              style={
                currentStatus === "Đang xử lý"
                  ? styles.btnSecondaryText
                  : styles.btnWhiteText
              }
            >
              {currentStatus === "Đang xử lý"
                ? "Tiếp tục cập nhật nhật ký"
                : "Bắt đầu xử lý & Đóng sự cố"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// COMPONENTS CON
const MetaItem = ({ icon, label }: any) => (
  <View style={styles.metaItem}>
    <Ionicons name={icon} size={14} color="#64748B" />
    <Text style={styles.metaLabel}>{label}</Text>
  </View>
);

const CompBox = ({ label, value, color }: any) => (
  <View style={[styles.compBox, { backgroundColor: `${color}10` }]}>
    <Text style={styles.compLabel}>{label}</Text>
    <Text style={[styles.compValue, { color }]}>{value}</Text>
  </View>
);

const StepItem = ({ num, title, desc, priority }: any) => (
  <View style={styles.stepCard}>
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumText}>{num}</Text>
    </View>
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDesc}>{desc}</Text>
      <View style={styles.priorityTag}>
        <Text style={styles.priorityText}>{priority}</Text>
      </View>
    </View>
  </View>
);

const chartConfig = {
  backgroundGradientFrom: "#FFF",
  backgroundGradientTo: "#FFF",
  color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
  strokeWidth: 2,
  decimalPlaces: 2,
};

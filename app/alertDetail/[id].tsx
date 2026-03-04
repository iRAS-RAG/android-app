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
  TouchableOpacity,
  View,
} from "react-native";
import AlertChart from "@/components/alerts/AlertChart";
import MetaItem from "@/components/alerts/MetaItem";
import CompBox from "@/components/alerts/CompBox";
import StepItem from "@/components/alerts/StepItem";

const screenWidth = Dimensions.get("window").width;

export default function AlertDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [currentStatus, setCurrentStatus] = useState("Đang xảy ra");

  const handleProcessAlert = () => {
    router.push({
      pathname: "/maintenance/log",
      params: { id: id, type: "NH3" },
    });

    if (currentStatus === "Đang xảy ra") {
      setCurrentStatus("Đang xử lý");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
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
        {/* THÔNG TIN SỰ CỐ */}
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

        {/* GIÁ TRỊ HIỆN TẠI */}
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

        {/* BIỂU ĐỒ */}
        <AlertChart />

        {/* HƯỚNG DẪN AI */}
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

        {/* ACTION */}
        <View style={styles.logSection}>
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

          <TouchableOpacity
            style={[
              styles.btnSuccess,
              currentStatus === "Đang xử lý" && {
                backgroundColor: theme.colors.warning,
              },
            ]}
            onPress={handleProcessAlert}
          >
            <Text style={styles.btnWhiteText}>
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

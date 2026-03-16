import { styles } from "@/styles/alerts/alertDetail.styles";
import { theme } from "@/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import MetaItem from "@/components/alerts/MetaItem";
import CompBox from "@/components/alerts/CompBox";
import StepItem from "@/components/alerts/StepItem";
import { alertService } from "@/services/alertService";
import { maintenanceService } from "@/services/maintenanceService";

const screenWidth = Dimensions.get("window").width;

export default function AlertDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [currentStatus, setCurrentStatus] = useState("Đang xảy ra");
  const [alertData, setAlertData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [existingLogId, setExistingLogId] = useState<string | null>(null);

  // Dùng useFocusEffect để tự động reload khi từ trang Nhật ký quay lại
  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadData();
      }
    }, [id]),
  );

  const loadData = async () => {
    setLoading(true);
    try {
      // Tải song song Chi tiết cảnh báo & Tìm xem có Nhật ký nào chưa
      const [alertInfo, logInfo] = await Promise.all([
        alertService.getAlertDetail(id as string),
        maintenanceService.getLogByAlertId(id as string),
      ]);

      if (alertInfo) {
        setAlertData(alertInfo);
        setCurrentStatus(
          alertInfo.status === "Mới" ? "Đang xảy ra" : alertInfo.status,
        );
      }

      if (logInfo) {
        setExistingLogId(logInfo.id);
        setCurrentStatus("Đã giải quyết");
      } else {
        setExistingLogId(null);
      }
    } catch (error) {
      console.error("Lỗi load data:", error);
    }
    setLoading(false);
  };

  const handleProcessAlert = async () => {
    if (existingLogId) {
      // ĐÃ CÓ LOG -> Chuyển sang chế độ XEM (truyền mode="view")
      router.push({
        pathname: "/maintenance/log",
        params: { id: id, logId: existingLogId, mode: "view" },
      });
      return;
    }

    // CHƯA CÓ LOG -> Chuyển sang chế độ TẠO MỚI
    if (currentStatus === "Đang xảy ra") {
      setCurrentStatus("Đang xử lý");
      await alertService.updateStatus(id as string, "processing");
    }
    router.push({
      pathname: "/maintenance/log",
      params: { id: id, type: alertData?.type || "System" },
    });
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#F8FAFC",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  const displayTitle = alertData?.title || "Cảnh báo hệ thống";
  const displayLevel = alertData?.level || "Nguy hiểm";
  const displayDesc =
    alertData?.desc || "Phát hiện chỉ số bất thường cần kiểm tra.";
  const displayTank = alertData?.tank || "Bể chưa xác định";
  const displayTime = alertData?.time || "Vừa xong";
  const displayValue = alertData?.value || "0";
  const displayColor =
    currentStatus === "Đã giải quyết"
      ? theme.colors.success
      : alertData?.color || theme.colors.danger;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết cảnh báo</Text>
        <TouchableOpacity></TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* THÔNG TIN SỰ CỐ */}
        <View style={[styles.emergencyCard, { borderLeftColor: displayColor }]}>
          <View style={styles.emergencyHeader}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: `${displayColor}15` },
              ]}
            >
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={24}
                color={displayColor}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.alertTitle}>{displayTitle}</Text>
              <View
                style={[styles.dangerTag, { backgroundColor: displayColor }]}
              >
                <Text style={styles.dangerTagText}>
                  {currentStatus === "Đã giải quyết" ? "An toàn" : displayLevel}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.alertDesc}>{displayDesc}</Text>
          <View style={styles.metaRow}>
            <MetaItem icon="business-outline" label={displayTank} />
            <MetaItem icon="time-outline" label={displayTime} />
            <MetaItem icon="alert-circle-outline" label={currentStatus} />
          </View>
        </View>

        {/* GIÁ TRỊ HIỆN TẠI */}
        <View style={styles.currentValueCard}>
          <Text style={styles.sectionLabel}>Giá trị hiện tại</Text>
          <View style={styles.mainValueContainer}>
            <Text style={[styles.currentValueText, { color: displayColor }]}>
              {displayValue}{" "}
              <Text style={{ fontSize: 18 }}>{alertData?.unit || "mg/L"}</Text>
            </Text>
          </View>
          <View style={styles.comparisonGrid}>
            <CompBox
              label="Tối ưu"
              value={alertData?.optimalValue || "0-0.1"}
              color={theme.colors.success}
            />
            <CompBox
              label="Ngưỡng an toàn"
              value={alertData?.safeLimit || "< 0.3"}
              color={theme.colors.warning}
            />
            <CompBox
              label="Vượt ngưỡng"
              value={alertData?.exceededPercent || "+0%"}
              color={theme.colors.danger}
            />
          </View>
        </View>

        {/* HƯỚNG DẪN XỬ LÝ */}
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
            title="Kiểm tra hệ thống vật lý"
            desc={`Cử nhân sự kiểm tra trực tiếp tại ${displayTank}`}
            priority="Ưu tiên cao"
          />
          <StepItem
            num="2"
            title="Ghi chép nhật ký bảo trì"
            desc="Sau khi xử lý, hãy ghi log lại sự cố này"
            priority="Ưu tiên cao"
          />
        </View>

        {/* NÚT ACTION */}
        {/* NÚT ACTION */}
        <View style={styles.logSection}>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => {
              // SỬA LỖI Ở ĐÂY: Dùng fishTankId thay vì displayTank
              if (alertData?.fishTankId) {
                router.push({
                  pathname: "/tankDetail/[id]",
                  params: { id: alertData.fishTankId },
                });
              } else {
                Alert.alert(
                  "Thông báo",
                  "Không tìm thấy dữ liệu định danh của bể này.",
                );
              }
            }}
          >
            <Ionicons
              name="eye-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.btnSecondaryText}>
              Xem chi tiết {displayTank}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btnSuccess,
              currentStatus === "Đang xử lý" && {
                backgroundColor: theme.colors.warning,
              },
              existingLogId && { backgroundColor: "#10B981" },
            ]}
            onPress={handleProcessAlert}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {existingLogId && (
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color="#FFF"
                  style={{ marginRight: 8 }}
                />
              )}
              <Text style={styles.btnWhiteText}>
                {existingLogId
                  ? "Đã lưu nhật ký thành công"
                  : currentStatus === "Đang xử lý"
                    ? "Tiếp tục cập nhật nhật ký"
                    : "Bắt đầu xử lý & Đóng sự cố"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

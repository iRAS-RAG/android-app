import { styles } from "@/styles/alerts/alertDetail.styles";
import { theme } from "@/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import MetaItem from "@/components/alerts/MetaItem";
import { alertService } from "@/services/alertService";
import { maintenanceService } from "@/services/maintenanceService";
import { toast } from "@/utils/toast";

export default function AlertDetailScreen() {
  const router = useRouter();
  const {
    id,
    fallbackLimit,
    fallbackValue,
    fallbackUnit,
    fallbackSensorName,
    fallbackTankId,
  } = useLocalSearchParams<{
    id: string;
    fallbackLimit?: string;
    fallbackValue?: string;
    fallbackUnit?: string;
    fallbackSensorName?: string;
    fallbackTankId?: string;
  }>();

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
        // Dùng status thực từ API làm nguồn sự thật duy nhất
        setCurrentStatus(alertInfo.status ?? "Mới");
      }

      // logInfo chỉ dùng để xác định có nhật ký hay chưa (hiển thị nút xem log)
      // KHÔNG ghi đè currentStatus — tránh hiển thị sai "Đã giải quyết" khi alert vẫn đang xử lý
      if (logInfo) {
        setExistingLogId(logInfo.id);
      } else {
        setExistingLogId(null);
      }
    } catch (error) {
      console.error("Lỗi load data:", error);
    }
    setLoading(false);
  };

  // OPEN → ACKNOWLEDGED (Tiếp nhận)
  const handleAcknowledge = async () => {
    try {
      await alertService.acknowledge(id as string);
      setCurrentStatus("Đang xử lý");
      toast.info("Đã tiếp nhận cảnh báo. Đang chuyển sang xử lý.");
    } catch {
      toast.error("Không thể tiếp nhận cảnh báo.");
    }
  };

  // → DISMISSED (Bỏ qua)
  const handleDismiss = async () => {
    try {
      await alertService.dismiss(id as string);
      setCurrentStatus("Đã bỏ qua");
      toast.info("Đã bỏ qua cảnh báo.");
    } catch {
      toast.error("Không thể bỏ qua cảnh báo.");
    }
  };

  // ACKNOWLEDGED → tạo nhật ký bảo trì (backend tự set RESOLVED)
  const handleGoToMaintenance = () => {
    const title = alertData?.title || "Cảnh báo hệ thống";
    if (existingLogId) {
      router.push({
        pathname: "/maintenance/log",
        params: { id: id, logId: existingLogId, mode: "view", alertTitle: title },
      });
    } else {
      router.push({
        pathname: "/maintenance/log",
        params: { id: id, type: alertData?.type || "System", alertTitle: title },
      });
    }
  };

  const handleViewLog = () => {
    if (!existingLogId) return;
    const title = alertData?.title || "Cảnh báo hệ thống";
    router.push({
      pathname: "/maintenance/log",
      params: { id: id, logId: existingLogId, mode: "view", alertTitle: title },
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
  const displayTank = alertData?.tank || "Bể chưa xác định";
  const displayTime = alertData?.time || "Vừa xong";

  // Dùng data từ detail API, fallback về data từ list nếu API detail thiếu trường
  const rawLimit = alertData?.limit || "";
  const isLimitEmpty = !rawLimit || rawLimit === "0 - 0" || rawLimit === "0-0";
  const displayLimit = isLimitEmpty ? (fallbackLimit || "") : rawLimit;

  const rawValue = alertData?.value || "";
  const displayValue = rawValue || fallbackValue || "0";

  const rawUnit = alertData?.unit || "";
  const displayUnit = rawUnit || fallbackUnit || "";

  const rawSensorName = alertData?.sensorName || alertData?.title?.replace("Cảnh báo ", "") || "";
  const displaySensorName = rawSensorName || fallbackSensorName || "hệ thống";

  // fishTankId: ưu tiên từ alertData (detail API), fallback từ list
  const displayFishTankId = alertData?.fishTankId || fallbackTankId || "";
  const displayColor =
    currentStatus === "Đã giải quyết"
      ? theme.colors.success
      : alertData?.color || theme.colors.danger;

  // Câu mô tả cảnh báo (giống web)
  const displayWarningDesc =
    `Giá trị ${displaySensorName} đang ở mức ${displayValue}${displayUnit ? " " + displayUnit : ""}, ` +
    `vượt ngưỡng an toàn (${displayLimit}${displayUnit ? " " + displayUnit : ""}). Cần kiểm tra và xử lý ngay.`;

  // Prompt điền sẵn cho AI Advisor (giống web)
  const aiPrefillPrompt =
    `${displayTank} đang có chỉ số ${displaySensorName} là ${displayValue}${displayUnit ? " " + displayUnit : ""} ` +
    `(vượt ngưỡng an toàn ${displayLimit}${displayUnit ? " " + displayUnit : ""}). ` +
    `Hãy hướng dẫn tôi quy trình xử lý SOP khẩn cấp cho tình huống này`;

  const handleConsultAI = () => {
    router.push({
      pathname: "/(tabs)/aiAdvisor",
      params: {
        prefillPrompt: aiPrefillPrompt,
        tankId: displayFishTankId,
        tankName: displayTank,
      },
    });
  };

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
              <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                <View style={[styles.dangerTag, { backgroundColor: displayColor }]}>
                  <Text style={styles.dangerTagText}>
                    {currentStatus === "Đã giải quyết" ? "An toàn" : displayLevel}
                  </Text>
                </View>
                {currentStatus === "Đã giải quyết" && (
                  <View style={[styles.dangerTag, { backgroundColor: "#64748B" }]}>
                    <Text style={styles.dangerTagText}>Đã giải quyết</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.metaRow}>
            <MetaItem icon="business-outline" label={displayTank} />
            <MetaItem icon="time-outline" label={displayTime} />
            <MetaItem icon="alert-circle-outline" label={currentStatus} />
          </View>
        </View>

        {/* MÔ TẢ CẢNH BÁO (giống web) */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 16,
            padding: 14,
            backgroundColor: "#FEF2F2",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#FECACA",
          }}
        >
          <Text style={{ fontSize: 13, color: theme.colors.danger, lineHeight: 20 }}>
            Giá trị{" "}
            <Text style={{ fontWeight: "700" }}>{displaySensorName}</Text>
            {" "}đang ở mức {displayValue}{displayUnit ? " " + displayUnit : ""}, vượt ngưỡng an toàn ({displayLimit}
            {displayUnit ? " " + displayUnit : ""}). Cần kiểm tra và xử lý ngay.
          </Text>
        </View>

        {/* GIÁ TRỊ HIỆN TẠI & NGƯỠNG AN TOÀN (2 cột, giống web) */}
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 20,
            marginBottom: 16,
            gap: 12,
          }}
        >
          {/* Giá trị hiện tại */}
          <View
            style={{
              flex: 1,
              padding: 16,
              backgroundColor: "#FFF",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#FECACA",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: theme.colors.textSecondary,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Giá trị hiện tại
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: displayColor,
                lineHeight: 34,
              }}
            >
              {displayValue}
              {displayUnit ? (
                <Text style={{ fontSize: 16, fontWeight: "600" }}> {displayUnit}</Text>
              ) : null}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
              <MaterialCommunityIcons
                name="trending-down"
                size={14}
                color={displayColor}
              />
              <Text style={{ fontSize: 11, fontWeight: "700", color: displayColor, marginLeft: 4 }}>
                Bất thường
              </Text>
            </View>
          </View>

          {/* Ngưỡng an toàn */}
          <View
            style={{
              flex: 1,
              padding: 16,
              backgroundColor: "#FFF",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#BBF7D0",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: theme.colors.textSecondary,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Ngưỡng an toàn
            </Text>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: theme.colors.success,
                lineHeight: 30,
              }}
            >
              {displayLimit}
              {displayUnit ? (
                <Text style={{ fontSize: 14, fontWeight: "600" }}> {displayUnit}</Text>
              ) : null}
            </Text>
            <Text style={{ fontSize: 11, fontWeight: "600", color: theme.colors.success, marginTop: 4 }}>
              Mức tối ưu
            </Text>
          </View>
        </View>

        {/* NÚT ACTION */}
        <View style={styles.logSection}>
          {/* ── OPEN (Mới / Chờ xử lý): Tiếp nhận + Bỏ qua ── */}
          {(currentStatus === "Mới" || currentStatus === "Đang xảy ra") && (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={[styles.btnSuccess, { flex: 1 }]}
                onPress={handleAcknowledge}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.btnWhiteText}>Tiếp nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnSuccess, { flex: 1, backgroundColor: "#EF4444" }]}
                onPress={handleDismiss}
              >
                <Ionicons name="close-circle-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.btnWhiteText}>Bỏ qua</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── ACKNOWLEDGED (Đang xử lý): Ghi nhật ký + Tham vấn AI ── */}
          {currentStatus === "Đang xử lý" && (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={[styles.btnSuccess, { flex: 1, backgroundColor: theme.colors.warning }]}
                onPress={handleGoToMaintenance}
              >
                <Ionicons name="document-text-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.btnWhiteText}>Ghi nhật ký</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnSuccess, { flex: 1, backgroundColor: theme.colors.primary }]}
                onPress={handleConsultAI}
              >
                <MaterialCommunityIcons name="robot-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.btnWhiteText}>Tham vấn AI</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── RESOLVED: chỉ hiển thị nút Xem nhật ký bảo trì ── */}
          {currentStatus === "Đã giải quyết" && existingLogId && (
            <TouchableOpacity
              style={[styles.btnSuccess, { backgroundColor: theme.colors.primary, flexDirection: "row", justifyContent: "center" }]}
              onPress={handleViewLog}
            >
              <Ionicons name="book-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.btnWhiteText}>Xem nhật ký bảo trì</Text>
            </TouchableOpacity>
          )}
          {currentStatus === "Đã giải quyết" && !existingLogId && (
            <View style={{ padding: 14, backgroundColor: "#F8FAFC", borderRadius: 12, alignItems: "center" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>Chưa có nhật ký bảo trì cho sự cố này</Text>
            </View>
          )}

          {/* ── DISMISSED (Đã bỏ qua) ── */}
          {currentStatus === "Đã bỏ qua" && (
            <View style={[styles.btnSuccess, { backgroundColor: "#94A3B8", flexDirection: "row", justifyContent: "center" }]}>
              <Ionicons name="remove-circle-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.btnWhiteText}>Đã bỏ qua</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

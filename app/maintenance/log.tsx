import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { styles } from "@/styles/maintenance/maintenance.styles";
import { maintenanceService } from "@/services/maintenanceService";
import { toast } from "@/utils/toast";

export default function MaintenanceLogScreen() {
  const router = useRouter();
  const { id, logId, mode, alertTitle } = useLocalSearchParams();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditing, setIsEditing] = useState(mode !== "view");
  const [hasChanges, setHasChanges] = useState(false);

  // Chỉ 2 trường, đồng bộ web
  const [actionTaken, setActionTaken] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [userData] = await Promise.all([
          maintenanceService.getCurrentUser(),
        ]);
        setCurrentUser(userData);

        if (logId) {
          const existingLog = await maintenanceService.getLogById(logId as string);
          if (existingLog) {
            setActionTaken(existingLog.actionTaken || "");
            setNotes(existingLog.notes || "");
          }
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      } finally {
        setLoadingInitial(false);
        setHasChanges(false);
      }
    };
    fetchInitialData();
  }, [logId]);

  const handleBackNavigation = () => {
    if (isEditing && hasChanges) {
      Alert.alert(
        "Dữ liệu chưa được lưu",
        "Bạn có dữ liệu chưa lưu. Bạn có chắc chắn muốn hủy?",
        [
          { text: "Tiếp tục chỉnh sửa", style: "cancel" },
          { text: "Hủy bỏ", style: "destructive", onPress: () => router.back() },
        ],
      );
      return true;
    }
    router.back();
    return true;
  };

  useEffect(() => {
    const backSubscription = BackHandler.addEventListener("hardwareBackPress", handleBackNavigation);
    return () => backSubscription.remove();
  }, [isEditing, hasChanges]);

  const handleChange = (setter: (v: string) => void, value: string) => {
    setter(value);
    if (isEditing) setHasChanges(true);
  };

  // Chỉ actionTaken là bắt buộc (đồng bộ web)
  const isValid = actionTaken.trim().length > 0;

  const handleSave = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      const payload = {
        alertId: id,
        userId: currentUser?.id,
        actionTaken: actionTaken.trim(),
        notes: notes.trim(),
      };

      if (logId) {
        await maintenanceService.updateLog(logId as string, payload);
        setHasChanges(false);
        setIsEditing(false);
        toast.success("Đã cập nhật nhật ký bảo trì!");
      } else {
        await maintenanceService.createLog(payload);
        // Backend tự đóng sự cố khi tạo corrective action
        setHasChanges(false);
        toast.success("Đã ghi nhận nhật ký và đóng sự cố!");
        router.back();
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Không thể lưu nhật ký. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const PLACEHOLDER_COLOR = "#9CA3AF";
  const disabledStyle = !isEditing ? { backgroundColor: "#F8FAFC", color: "#64748B" } : {};

  if (loadingInitial) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackNavigation} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>
            {logId ? (isEditing ? "Cập nhật nhật ký" : "Chi tiết nhật ký") : "Ghi nhật ký bảo trì"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {logId ? "Thông tin hành động khắc phục" : "Ghi nhận hành động xử lý sự cố"}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Banner hướng dẫn */}
          <View style={styles.instructionBanner}>
            <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} style={{ marginTop: 2 }} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.instructionTitle}>Hướng dẫn ghi nhận</Text>
              <Text style={styles.instructionText}>
                Điền hành động khắc phục (*) để đóng sự cố. Ghi chú thêm nếu cần.
              </Text>
            </View>
          </View>

          {/* Cảnh báo liên quan (chỉ hiển thị, không được chỉnh sửa) */}
          {alertTitle ? (
            <>
              <Text style={styles.label}>Cảnh báo liên quan</Text>
              <TextInput
                style={[styles.textArea, { height: 48, backgroundColor: "#F8FAFC", color: "#64748B" }]}
                value={alertTitle as string}
                editable={false}
              />
            </>
          ) : null}

          {/* Hành động khắc phục (bắt buộc) */}
          <Text style={styles.label}>
            Hành động khắc phục <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.textArea, { height: 100 }, disabledStyle]}
            multiline
            editable={isEditing}
            placeholder="Mô tả hành động đã thực hiện để xử lý sự cố..."
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={actionTaken}
            onChangeText={(text) => handleChange(setActionTaken, text)}
          />

          {/* Ghi chú (không bắt buộc) */}
          <Text style={styles.label}>Ghi chú thêm</Text>
          <TextInput
            style={[styles.textArea, { height: 80 }, disabledStyle]}
            multiline
            editable={isEditing}
            placeholder="Ghi chú bổ sung (không bắt buộc)..."
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={notes}
            onChangeText={(text) => handleChange(setNotes, text)}
          />

          {/* Nút action */}
          <View style={{ marginTop: 30, marginBottom: 20 }}>
            {!isEditing ? (
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: "#F59E0B" }]}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="pencil" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.saveBtnText}>Chỉnh sửa nhật ký</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.saveBtn, isValid && { backgroundColor: theme.colors.primary }]}
                disabled={!isValid || isSubmitting}
                onPress={handleSave}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
                ) : (
                  <Ionicons name="save-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                )}
                <Text style={styles.saveBtnText}>
                  {isSubmitting ? "Đang lưu..." : logId ? "Lưu thay đổi" : "Lưu & Đóng sự cố"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

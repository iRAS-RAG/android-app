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
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import { styles } from "@/styles/maintenance/maintenance.styles";
import { maintenanceService } from "@/services/maintenanceService";
import { alertService } from "@/services/alertService";

export default function MaintenanceLogScreen() {
  const router = useRouter();
  const { id, logId, mode } = useLocalSearchParams();

  const [deviceData, setDeviceData] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATE QUẢN LÝ CHẾ ĐỘ XEM / SỬA ---
  const [isEditing, setIsEditing] = useState(mode !== "view");
  const [hasChanges, setHasChanges] = useState(false);

  // Bỏ state maintainType
  const [device, setDevice] = useState("");
  const [errorDesc, setErrorDesc] = useState("");
  const [fixResult, setFixResult] = useState("");
  const [note, setNote] = useState("");
  const [isFocus, setIsFocus] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [userData, deviceList] = await Promise.all([
          maintenanceService.getCurrentUser(),
          maintenanceService.getDevicesForDropdown(),
        ]);
        setCurrentUser(userData);
        setDeviceData(deviceList);

        if (logId) {
          const existingLog = await maintenanceService.getLogById(
            logId as string,
          );
          if (existingLog) {
            setDevice(existingLog.hardwareId || "");
            setErrorDesc(existingLog.errorDescription || "");
            setFixResult(existingLog.actionTaken || "");
            setNote(existingLog.notes || "");
            if (existingLog.timestamp) setDate(new Date(existingLog.timestamp));
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
        "Lịch sử chưa được lưu",
        "Bạn có dữ liệu chưa lưu. Bạn có chắc chắn muốn hủy bỏ các thay đổi này?",
        [
          { text: "Tiếp tục", style: "cancel" },
          {
            text: "Hủy bỏ",
            style: "destructive",
            onPress: () => router.back(),
          },
        ],
      );
      return true;
    }
    router.back();
    return true;
  };

  useEffect(() => {
    const backSubscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackNavigation,
    );
    return () => backSubscription.remove();
  }, [isEditing, hasChanges]);

  const handleChangeText = (setter: any, value: string) => {
    setter(value);
    if (isEditing) setHasChanges(true);
  };

  // VALIDATION: Ngày giờ luôn hợp lệ do default = new Date(), chỉ cần check text
  const isValid = fixResult.trim().length > 0 && note.trim().length > 0;

  const handleSave = async () => {
    if (!isValid) return;
    setIsSubmitting(true);

    try {
      const payload = {
        alertId: id,
        userId: currentUser?.id,
        hardwareId: device || null,
        maintenanceType: "Sửa chữa",
        errorDescription: errorDesc,
        actionTaken: fixResult,
        notes: note,
        timestamp: date.toISOString(),
      };

      if (logId) {
        await maintenanceService.updateLog(logId as string, payload);
        setHasChanges(false);
        setIsEditing(false);
        Alert.alert("Thành công", "Đã cập nhật nhật ký bảo trì!");
      } else {
        await maintenanceService.createLog(payload);
        await alertService.updateStatus(id as string, "resolved");
        setHasChanges(false);
        Alert.alert("Thành công", "Đã lưu nhật ký và đóng sự cố!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể lưu nhật ký. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDateChange = (e: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      if (isEditing) setHasChanges(true);
    }
  };
  const onTimeChange = (e: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setDate(selectedTime);
      if (isEditing) setHasChanges(true);
    }
  };

  const formatDate = (d: Date) =>
    `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  const formatTime = (d: Date) =>
    `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  const PLACEHOLDER_COLOR = "#9CA3AF";

  const disabledStyle = !isEditing
    ? { backgroundColor: "#F8FAFC", color: "#64748B" }
    : {};

  if (loadingInitial) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFF",
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackNavigation} style={styles.backBtn}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>
            {logId
              ? isEditing
                ? "Cập nhật nhật ký"
                : "Chi tiết nhật ký"
              : "Nhật ký bảo trì"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {logId
              ? "Thông tin công việc sửa chữa"
              : "Ghi nhận công việc sửa chữa"}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.instructionBanner}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={theme.colors.primary}
              style={{ marginTop: 2 }}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.instructionTitle}>Hướng dẫn ghi nhận</Text>
              <Text style={styles.instructionText}>
                Vui lòng điền đầy đủ các thông tin bắt buộc (*).
              </Text>
            </View>
          </View>

          <Text style={styles.label}>Thiết bị (không bắt buộc)</Text>
          <Dropdown
            style={[
              styles.dropdown,
              disabledStyle,
              isFocus && { borderColor: theme.colors.primary },
            ]}
            placeholderStyle={[
              styles.placeholderStyle,
              { color: PLACEHOLDER_COLOR },
            ]}
            selectedTextStyle={[
              styles.selectedTextStyle,
              !isEditing && { color: "#64748B" },
            ]}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={deviceData}
            search
            disable={!isEditing}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? "Chọn thiết bị..." : "..."}
            searchPlaceholder="Tìm kiếm..."
            value={device}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={(item: any) => {
              setDevice(item.value);
              setIsFocus(false);
              setHasChanges(true);
            }}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              {/* Thêm dấu sao cho Ngày thực hiện */}
              <Text style={styles.label}>
                Ngày thực hiện{" "}
                {isEditing && <Text style={styles.required}>*</Text>}
              </Text>
              <TouchableOpacity
                style={[styles.dateInput, disabledStyle]}
                disabled={!isEditing}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <Text
                  style={[styles.dateText, !isEditing && { color: "#64748B" }]}
                >
                  {formatDate(date)}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              {/* Thêm dấu sao cho Thời gian */}
              <Text style={styles.label}>
                Thời gian {isEditing && <Text style={styles.required}>*</Text>}
              </Text>
              <TouchableOpacity
                style={[styles.dateInput, disabledStyle]}
                disabled={!isEditing}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#6B7280" />
                <Text
                  style={[styles.dateText, !isEditing && { color: "#64748B" }]}
                >
                  {formatTime(date)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}

          <Text style={styles.label}>Mô tả lỗi (không bắt buộc)</Text>
          <TextInput
            style={[styles.textArea, disabledStyle]}
            multiline
            editable={isEditing}
            placeholder="Mô tả lỗi..."
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={errorDesc}
            onChangeText={(text) => handleChangeText(setErrorDesc, text)}
          />

          <Text style={styles.label}>
            Kết quả sửa chữa{" "}
            {isEditing && <Text style={styles.required}>*</Text>}
          </Text>
          <TextInput
            style={[styles.textArea, disabledStyle]}
            multiline
            editable={isEditing}
            placeholder="Kết quả..."
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={fixResult}
            onChangeText={(text) => handleChangeText(setFixResult, text)}
          />

          <Text style={styles.label}>
            Ghi chú thêm {isEditing && <Text style={styles.required}>*</Text>}
          </Text>
          <TextInput
            style={[styles.textArea, { height: 60 }, disabledStyle]}
            placeholder="Ghi chú..."
            editable={isEditing}
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={note}
            onChangeText={(text) => handleChangeText(setNote, text)}
          />

          {/* KHU VỰC HIỂN THỊ NÚT BẤM DỰA VÀO TRẠNG THÁI */}
          <View style={{ marginTop: 30, marginBottom: 20 }}>
            {!isEditing ? (
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: "#F59E0B" }]}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons
                  name="pencil"
                  size={20}
                  color="#FFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.saveBtnText}>Chỉnh sửa lịch sử</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  isValid && { backgroundColor: theme.colors.primary },
                ]}
                disabled={!isValid || isSubmitting}
                onPress={handleSave}
              >
                {isSubmitting ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFF"
                    style={{ marginRight: 8 }}
                  />
                ) : (
                  <Ionicons
                    name="save-outline"
                    size={20}
                    color="#FFF"
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text style={styles.saveBtnText}>
                  {isSubmitting
                    ? "Đang lưu hệ thống..."
                    : logId
                      ? "Lưu thay đổi"
                      : "Lưu nhật ký bảo trì"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

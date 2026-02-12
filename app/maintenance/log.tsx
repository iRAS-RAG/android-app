import { theme } from "@/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
// 1. Import thư viện ImagePicker
import * as ImagePicker from "expo-image-picker";

const DEVICE_DATA = [
  { label: "Máy sục khí Oxy (Aerator)", value: "Aerator" },
  { label: "Cảm biến pH", value: "Sensor_PH" },
  { label: "Cảm biến DO", value: "Sensor_DO" },
  { label: "Máy bơm nước #1", value: "Pump_01" },
  { label: "Hệ thống lọc Drum", value: "Drum_Filter" },
  { label: "Quạt nước (Paddle Wheel)", value: "Paddle_Wheel" },
  { label: "Đèn UV diệt khuẩn", value: "UV_Lamp" },
];

export default function MaintenanceLogScreen() {
  const router = useRouter();

  // --- STATE DỮ LIỆU ---
  const [maintainType, setMaintainType] = useState("Sửa chữa");
  const [device, setDevice] = useState("");
  const [errorDesc, setErrorDesc] = useState("");
  const [fixResult, setFixResult] = useState("");
  const [note, setNote] = useState("");
  const [isFocus, setIsFocus] = useState(false);

  // State ngày giờ
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // State ảnh
  const [imgBefore, setImgBefore] = useState<string | null>(null);
  const [imgAfter, setImgAfter] = useState<string | null>(null);

  // --- LOGIC XỬ LÝ ẢNH (CAMERA & LIBRARY) ---
  const handleImageAction = async (
    isBefore: boolean,
    type: "camera" | "library",
  ) => {
    let result;

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Cho phép cắt/chỉnh sửa ảnh sau khi chụp
      aspect: [4, 3],
      quality: 0.5, // Nén ảnh giảm dung lượng
    };

    try {
      if (type === "camera") {
        // Xin quyền Camera
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Lỗi", "Cần cấp quyền truy cập Camera để chụp ảnh.");
          return;
        }
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        // Xin quyền Thư viện ảnh
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Lỗi", "Cần cấp quyền truy cập Thư viện để chọn ảnh.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        if (isBefore) setImgBefore(uri);
        else setImgAfter(uri);
      }
    } catch (error) {
      console.log("Lỗi chọn ảnh:", error);
      Alert.alert("Lỗi", "Không thể tải ảnh, vui lòng thử lại.");
    }
  };

  // Hàm hiển thị lựa chọn khi bấm vào ô ảnh
  const openImagePickerOptions = (isBefore: boolean) => {
    Alert.alert(
      "Minh chứng hình ảnh",
      "Bạn muốn chụp ảnh mới hay chọn từ thư viện?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Chụp ảnh",
          onPress: () => handleImageAction(isBefore, "camera"),
        },
        {
          text: "Chọn từ thư viện",
          onPress: () => handleImageAction(isBefore, "library"),
        },
      ],
      { cancelable: true },
    );
  };

  // --- LOGIC CHUNG ---
  const isValid =
    errorDesc.length > 0 &&
    fixResult.length > 0 &&
    imgAfter !== null &&
    device !== "";

  const handleSave = () => {
    if (isValid) {
      // Tại đây bạn sẽ có: imgBefore (uri), imgAfter (uri), device, date...
      Alert.alert("Thành công", "Đã lưu nhật ký bảo trì!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) setDate(selectedTime);
  };

  const formatDate = (date: Date) =>
    `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
  const formatTime = (date: Date) =>
    `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

  const PLACEHOLDER_COLOR = "#9CA3AF";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Nhật ký bảo trì</Text>
          <Text style={styles.headerSubtitle}>Ghi nhận công việc sửa chữa</Text>
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
          {/* BANNER HƯỚNG DẪN */}
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
                Vui lòng điền đầy đủ thông tin và chụp ảnh trước/sau sửa chữa.
              </Text>
            </View>
          </View>

          {/* LOẠI BẢO TRÌ */}
          <Text style={styles.label}>
            Loại bảo trì <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.typeRow}>
            {["Sửa chữa", "Định kỳ", "Kiểm tra"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  maintainType === type && styles.typeButtonActive,
                ]}
                onPress={() => setMaintainType(type)}
              >
                <Text
                  style={[
                    styles.typeText,
                    maintainType === type && styles.typeTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* DROPDOWN THIẾT BỊ */}
          <Text style={styles.label}>
            Thiết bị <Text style={styles.required}>*</Text>
          </Text>
          <Dropdown
            style={[
              styles.dropdown,
              isFocus && { borderColor: theme.colors.primary },
            ]}
            placeholderStyle={[
              styles.placeholderStyle,
              { color: PLACEHOLDER_COLOR },
            ]}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={DEVICE_DATA}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? "Chọn thiết bị gặp sự cố..." : "..."}
            searchPlaceholder="Tìm kiếm..."
            value={device}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={(item: { label: string; value: string }) => {
              setDevice(item.value);
              setIsFocus(false);
            }}
            renderLeftIcon={() => (
              <Ionicons
                style={styles.icon}
                color={isFocus ? theme.colors.primary : "#6B7280"}
                name="hardware-chip-outline"
                size={20}
              />
            )}
            renderItem={(item: { label: string; value: string }) => (
              <View style={styles.dropdownItem}>
                <Text style={styles.textItem}>{item.label}</Text>
                {item.value === device && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={theme.colors.primary}
                  />
                )}
              </View>
            )}
          />

          {/* NGÀY & GIỜ */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Ngày thực hiện</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <Text style={styles.dateText}>{formatDate(date)}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Thời gian</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#6B7280" />
                <Text style={styles.dateText}>{formatTime(date)}</Text>
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

          {/* MÔ TẢ LỖI */}
          <Text style={styles.label}>
            Mô tả lỗi <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.textArea}
            multiline
            placeholder="Mô tả chi tiết tình trạng hỏng hóc..."
            placeholderTextColor={PLACEHOLDER_COLOR}
            maxLength={500}
            value={errorDesc}
            onChangeText={setErrorDesc}
          />
          <Text style={styles.charCount}>{errorDesc.length}/500 ký tự</Text>

          {/* HÌNH ẢNH TRƯỚC SỬA CHỮA */}
          <Text style={styles.label}>Hình ảnh trước sửa chữa</Text>
          <TouchableOpacity
            style={styles.photoBox}
            onPress={() => openImagePickerOptions(true)} // Gọi hàm chọn ảnh mới
          >
            {imgBefore ? (
              <>
                <Image
                  source={{ uri: imgBefore }}
                  style={styles.photoPreview}
                />
                <View style={styles.editBadge}>
                  <Ionicons name="pencil" size={12} color="#FFF" />
                </View>
              </>
            ) : (
              <View style={{ alignItems: "center" }}>
                <Ionicons name="camera-outline" size={24} color="#6B7280" />
                <Text style={styles.photoText}>Chụp / Chọn</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* KẾT QUẢ SỬA CHỮA */}
          <Text style={styles.label}>
            Kết quả sửa chữa <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.textArea}
            multiline
            placeholder="Chi tiết công việc đã thực hiện..."
            placeholderTextColor={PLACEHOLDER_COLOR}
            maxLength={500}
            value={fixResult}
            onChangeText={setFixResult}
          />

          {/* HÌNH ẢNH SAU SỬA CHỮA */}
          <Text style={styles.label}>
            Hình ảnh sau sửa chữa <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.photoBox}
            onPress={() => openImagePickerOptions(false)} // Gọi hàm chọn ảnh mới
          >
            {imgAfter ? (
              <>
                <Image source={{ uri: imgAfter }} style={styles.photoPreview} />
                <View style={styles.editBadge}>
                  <Ionicons name="pencil" size={12} color="#FFF" />
                </View>
              </>
            ) : (
              <View style={{ alignItems: "center" }}>
                <Ionicons name="camera-outline" size={24} color="#6B7280" />
                <Text style={styles.photoText}>Chụp / Chọn</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* NHÂN SỰ */}
          <Text style={styles.label}>Kỹ thuật viên</Text>
          <View style={styles.techCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>NV</Text>
            </View>
            <View>
              <Text style={styles.techName}>Nguyễn Văn A</Text>
              <Text style={styles.techRole}>Kỹ thuật viên</Text>
            </View>
          </View>

          {/* GHI CHÚ */}
          <Text style={styles.label}>Ghi chú thêm</Text>
          <TextInput
            style={[styles.textArea, { height: 60 }]}
            placeholder="Các thông tin bổ sung khác..."
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={note}
            onChangeText={setNote}
          />

          {/* BUTTON SAVE */}
          <View style={{ marginTop: 30, marginBottom: 20 }}>
            <TouchableOpacity
              style={[
                styles.saveBtn,
                isValid && { backgroundColor: theme.colors.primary },
              ]}
              disabled={!isValid}
              onPress={handleSave}
            >
              <Ionicons
                name="checkmark"
                size={20}
                color="#FFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.saveBtnText}>Lưu nhật ký bảo trì</Text>
            </TouchableOpacity>
            {!isValid && (
              <Text style={styles.errorMsg}>
                Vui lòng điền thông tin và ảnh sau sửa chữa
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  scrollContent: { padding: 20 },
  instructionBanner: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  instructionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 4,
  },
  instructionText: { fontSize: 12, color: "#334155", lineHeight: 18 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
  },
  required: { color: theme.colors.danger },

  // --- DROPDOWN STYLES ---
  dropdown: {
    height: 50,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "white",
  },
  icon: { marginRight: 10 },
  placeholderStyle: { fontSize: 14, color: "#9CA3AF" },
  selectedTextStyle: { fontSize: 14, color: theme.colors.textPrimary },
  iconStyle: { width: 20, height: 20 },
  inputSearchStyle: { height: 40, fontSize: 14, borderRadius: 8 },
  dropdownItem: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textItem: { flex: 1, fontSize: 14, color: theme.colors.textPrimary },

  typeRow: { flexDirection: "row", gap: 10 },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  typeButtonActive: {
    backgroundColor: theme.colors.danger,
    borderColor: theme.colors.danger,
  },
  typeText: { fontSize: 12, color: "#6B7280" },
  typeTextActive: { color: "#FFF", fontWeight: "600" },

  row: { flexDirection: "row" },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFF",
    gap: 8,
  },
  dateText: { fontSize: 14, color: "#374151" },
  textArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    fontSize: 14,
    color: theme.colors.textPrimary,
    backgroundColor: "#FFF",
  },
  charCount: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 4,
  },
  photoBox: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderStyle: "dashed",
    position: "relative", // Để định vị nút sửa
  },
  photoText: { fontSize: 11, color: "#6B7280", marginTop: 4 },
  photoPreview: { width: "100%", height: "100%", borderRadius: 8 },
  editBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  techCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#FFF", fontWeight: "700" },
  techName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  techRole: { fontSize: 12, color: theme.colors.textSecondary },
  saveBtn: {
    flexDirection: "row",
    backgroundColor: "#CBD5E1",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  errorMsg: {
    color: theme.colors.danger,
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
  },
});

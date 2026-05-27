import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { styles } from "@/styles/settings/changePassword.styles";
// IMPORT SERVICE GỌI API NGƯỜI DÙNG
import { userService } from "@/services/userService";
import { toast } from "@/utils/toast";
export default function ChangePasswordScreen() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // VALIDATION MẬT KHẨU ĐƯỢC GOM NHÓM THEO YÊU CẦU UI
  const validations = {
    length: newPassword.length >= 8,
    lowerUpper: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
    numberSpecial:
      /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword),
  };
  const isValidPassword = Object.values(validations).every(Boolean);
  const isMatch = newPassword === confirmPassword && newPassword.length > 0;
  const handleChangePassword = async () => {
    if (!oldPassword) {
      toast.warning("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }
    setIsLoading(true);
    try {
      // GỌI API ĐỔI MẬT KHẨU TỪ BE THÔNG QUA SERVICE
      await userService.changePassword({
        oldPassword: oldPassword,
        newPassword: newPassword,
        confirmNewPassword: confirmPassword,
      });
      toast.success("Đổi mật khẩu thành công!");
      router.back();
    } catch (error: any) {
      // Bóc tách thông báo lỗi từ API trả về, hoặc dùng thông báo mặc định
      const errorMsg =
        error?.data?.message ||
        error?.message ||
        "Mật khẩu hiện tại không đúng hoặc có lỗi xảy ra. Vui lòng thử lại.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  // Component hỗ trợ hiển thị từng dòng gợi ý mật khẩu
  const ValidationHint = ({
    isValid,
    text,
  }: {
    isValid: boolean;
    text: string;
  }) => (
    <View style={styles.validationItem}>
      <View
        style={[
          styles.validationDot,
          { backgroundColor: isValid ? "#10B981" : "#CBD5E1" },
        ]}
      />
      <Text
        style={[
          styles.validationText,
          { color: isValid ? "#10B981" : "#64748B" },
        ]}
      >
        {text}
      </Text>
    </View>
  );
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER TỐI GIẢN */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={{ width: 28 }} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.description}>
            Vui lòng nhập mật khẩu hiện tại của bạn và chọn một mật khẩu mới đủ
            mạnh.
          </Text>
          {/* FORM CHÍNH - GOM VÀO 1 THẺ TRẮNG DUY NHẤT */}
          <View style={styles.formCard}>
            {/* 1. MẬT KHẨU HIỆN TẠI */}
            <Text style={styles.label}>Mật khẩu hiện tại</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu cũ"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showOldPassword}
                value={oldPassword}
                onChangeText={setOldPassword}
              />

              <TouchableOpacity
                onPress={() => setShowOldPassword(!showOldPassword)}
              >
                <Ionicons
                  name={showOldPassword ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>

            {/* 2. MẬT KHẨU MỚI */}

            <Text style={[styles.label, { marginTop: 24 }]}>Mật khẩu mới</Text>

            <View style={styles.inputWrapper}>
              <Ionicons name="key-outline" size={20} color="#94A3B8" />

              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu mới"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />

              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons
                  name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>

            {/* GỢI Ý MẬT KHẨU (Tích hợp ngay dưới ô nhập) */}

            {newPassword.length > 0 && (
              <View style={styles.validationContainer}>
                <ValidationHint
                  isValid={validations.length}
                  text="Ít nhất 8 ký tự"
                />

                <ValidationHint
                  isValid={validations.lowerUpper}
                  text="Chữ hoa & chữ thường"
                />

                <ValidationHint
                  isValid={validations.numberSpecial}
                  text="Số & ký tự đặc biệt"
                />
              </View>
            )}

            {/* 3. XÁC NHẬN MẬT KHẨU MỚI */}

            <Text style={[styles.label, { marginTop: 24 }]}>
              Xác nhận mật khẩu mới
            </Text>

            <View
              style={[
                styles.inputWrapper,

                newPassword && confirmPassword && !isMatch && styles.inputError,
              ]}
            >
              <Ionicons
                name="checkmark-done-outline"
                size={20}
                color="#94A3B8"
              />

              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>

            {/* THÔNG BÁO KHỚP MẬT KHẨU */}

            {confirmPassword.length > 0 && (
              <Text
                style={{
                  fontSize: 13,

                  marginTop: 8,

                  fontWeight: "500",

                  color: isMatch ? "#10B981" : "#EF4444",
                }}
              >
                {isMatch ? "✓ Mật khẩu khớp" : "✕ Mật khẩu chưa trùng khớp"}
              </Text>
            )}
          </View>

          {/* NÚT BẤM NỔI BẬT */}

          <TouchableOpacity
            style={[
              styles.submitButton,

              (!(isValidPassword && isMatch && oldPassword) || isLoading) &&
                styles.submitButtonDisabled,
            ]}
            disabled={!(isValidPassword && isMatch && oldPassword) || isLoading}
            onPress={handleChangePassword}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Cập nhật mật khẩu</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

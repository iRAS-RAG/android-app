"use client";

import { styles } from "@/styles/auth/auth.styles"; // Sử dụng đúng đường dẫn style của bạn
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Logic xác thực mật khẩu
  const validations = {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isValidPassword = Object.values(validations).every(Boolean);
  const isMatch = password === confirmPassword && password.length > 0;

  const handleConfirm = () => {
    if (!(isValidPassword && isMatch)) return;
    router.push("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        {/* Nút quay lại */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: 20 }}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.header}>
            <Image
              source={require("@/assets/images/logo1.png")}
              style={[styles.logo]}
              resizeMode="contain"
            />
            <Text style={styles.title}>Tạo mật khẩu mới</Text>
            <Text style={[styles.subTitleDescription, { textAlign: "center" }]}>
              Mật khẩu mới của bạn phải đủ mạnh để bảo vệ dữ liệu hệ thống RAS.
            </Text>
          </View>

          <View style={styles.form}>
            {/* Trường nhập Mật khẩu mới */}
            <View
              style={[
                styles.inputWrapper,
                focusedInput === "pass" && styles.inputWrapperFocused,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu mới"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput("pass")}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Quy tắc mật khẩu */}
            {password.length > 0 && (
              <View style={{ marginBottom: theme.spacing.md, paddingLeft: 5 }}>
                <RuleItem label="Ít nhất 8 ký tự" valid={validations.length} />
                <RuleItem
                  label="Gồm chữ thường và chữ hoa"
                  valid={validations.lower && validations.upper}
                />
                <RuleItem
                  label="Gồm chữ số và ký tự đặc biệt"
                  valid={validations.number && validations.special}
                />
              </View>
            )}

            {/* Trường xác nhận mật khẩu */}
            <View
              style={[
                styles.inputWrapper,
                focusedInput === "confirm" && styles.inputWrapperFocused,
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={theme.colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedInput("confirm")}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Báo lỗi không khớp */}
            {confirmPassword.length > 0 && !isMatch && (
              <Text
                style={{
                  color: theme.colors.danger,
                  ...theme.typography.caption,
                  marginBottom: theme.spacing.md,
                  marginLeft: 5,
                }}
              >
                Mật khẩu xác nhận không khớp.
              </Text>
            )}

            {/* Nút xác nhận */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                !(isValidPassword && isMatch) && styles.loginButtonDisabled,
              ]}
              disabled={!(isValidPassword && isMatch)}
              onPress={handleConfirm}
            >
              <Text style={styles.loginButtonText}>CẬP NHẬT MẬT KHẨU</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Component phụ hiển thị quy tắc
function RuleItem({ label, valid }: { label: string; valid: boolean }) {
  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
    >
      <Ionicons
        name={valid ? "checkmark-circle" : "ellipse-outline"}
        size={16}
        color={valid ? theme.colors.success : theme.colors.textSecondary}
      />
      <Text
        style={{
          ...theme.typography.caption,
          marginLeft: 8,
          color: valid ? theme.colors.textPrimary : theme.colors.textSecondary,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

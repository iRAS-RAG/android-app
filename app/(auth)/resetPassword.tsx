"use client";

import { styles } from "@/styles/auth/auth.styles";
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import authService from "../../services/authService";
import {
  Alert,
  ActivityIndicator,
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
  const params = useLocalSearchParams();

  // Đảm bảo lấy đúng giá trị chuỗi từ params
  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  const otp = Array.isArray(params.otp) ? params.otp[0] : params.otp;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validations = {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isValidPassword = Object.values(validations).every(Boolean);
  const isMatch = password === confirmPassword && password.length > 0;

  const handleConfirm = async () => {
    if (!(isValidPassword && isMatch)) return;

    setIsLoading(true);
    try {
      // Gọi API với đầy đủ các trường mà Backend yêu cầu
      await authService.resetPassword({
        email: email as string,
        code: otp as string, // otp từ trang trước truyền sang
        newPassword: password, // Mật khẩu mới
        confirmNewPassword: confirmPassword, // Xác nhận mật khẩu mới
      });

      Alert.alert("Thành công", "Mật khẩu của bạn đã được cập nhật.", [
        { text: "Đăng nhập", onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        typeof err === "string" ? err : "Mã xác thực hoặc mật khẩu không đúng.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Image
              source={require("../../assets/images/logo1.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Mật khẩu mới</Text>
            <Text style={styles.subTitleDescription}>
              Thiết lập mật khẩu mới cho tài khoản của bạn
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu mới (ít nhất 8 ký tự)"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={theme.colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Xác nhận lại mật khẩu"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* Hint hướng dẫn bảo mật */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: isMatch ? "green" : theme.colors.textSecondary,
                }}
              >
                {isMatch ? "✓ Mật khẩu khớp" : "Mật khẩu phải trùng khớp"}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                (!(isValidPassword && isMatch) || isLoading) &&
                  styles.loginButtonDisabled,
              ]}
              disabled={!(isValidPassword && isMatch) || isLoading}
              onPress={handleConfirm}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Cập nhật mật khẩu</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

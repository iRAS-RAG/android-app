"use client";

import { styles } from "@/styles/auth/auth.styles";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import authService from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../theme";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [error, setError] = useState(""); // State lưu trữ thông báo lỗi

  const isButtonDisabled = email.length === 0 || password.length === 0;

  // Xử lý logic đăng nhập
  // Xử lý logic đăng nhập
  const handleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      // 1. Gọi service đăng nhập thực tế
      const result = await authService.login(email, password);

      console.log("Login Success result:", result); // Log khi thành công

      if (result && result.token) {
        // 2. Cập nhật trạng thái đăng nhập vào AuthContext
        await signIn({
          accessToken: result.token.accessToken,
          refreshToken: result.token.refreshToken,
        });

        // 3. Điều hướng dựa trên logic (Tabs chính)
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      // --- PHẦN LOG LỖI CHI TIẾT ---
      console.log("========= LOGIN ERROR LOG =========");
      if (err.response) {
        // Lỗi trả về từ Server (C#) ví dụ: 400, 401, 500
        console.log("Data:", err.response.data);
        console.log("Status:", err.response.status);
        console.log("Headers:", err.response.headers);
        setError(
          `Server error: ${err.response.status} - ${err.response.data?.message || "Lỗi hệ thống"}`,
        );
      } else if (err.request) {
        // Lỗi không kết nối được tới Server (Sai IP, sai mạng, Firewall chặn)
        console.log("Request info:", err.request);
        setError(
          "Không thể kết nối tới máy chủ. Vui lòng kiểm tra Wi-Fi hoặc IP của Backend.",
        );
      } else {
        // Các lỗi thiết lập khác
        console.log("Error Message:", err.message);
        setError(err.message);
      }
      console.log("Config:", err.config);
      console.log("====================================");
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
        {/* Header Section */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/logo1.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subTitleDescription}>
            Hệ thống quản lý RAS thông minh
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.form}>
          {/* Email Input */}
          <View
            style={[
              styles.inputWrapper,
              focusedInput === "email" && styles.inputWrapperFocused,
              error !== "" && { borderColor: theme.colors.danger }, // Đổi viền đỏ nếu có lỗi
            ]}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={
                focusedInput === "email"
                  ? theme.colors.primary
                  : theme.colors.textSecondary
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Tài khoản / Email"
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError(""); // Xóa lỗi khi bắt đầu nhập lại
              }}
              autoCapitalize="none"
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          {/* Password Input */}
          <View
            style={[
              styles.inputWrapper,
              focusedInput === "password" && styles.inputWrapperFocused,
              error !== "" && { borderColor: theme.colors.danger }, // Đổi viền đỏ nếu có lỗi
            ]}
          >
            <Ionicons
              name="key-outline"
              size={20}
              color={
                focusedInput === "password"
                  ? theme.colors.primary
                  : theme.colors.textSecondary
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor={theme.colors.textSecondary}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) setError(""); // Xóa lỗi khi bắt đầu nhập lại
              }}
              secureTextEntry={secureText}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
            />
            <TouchableOpacity
              onPress={() => setSecureText(!secureText)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={secureText ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Hiển thị thông báo lỗi hệ thống */}
          {error ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                marginTop: -5,
                marginBottom: 10,
                marginLeft: 5, // đẩy nhẹ sang trái cho đẹp
              }}
            >
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={theme.colors.danger}
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  color: theme.colors.danger,
                  fontSize: 12,
                }}
              >
                {error}
              </Text>
            </View>
          ) : null}

          {/* Forgot Password Link */}
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push("/(auth)/forgotPassword")}
          >
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              (email === "" || password === "" || isLoading) &&
                styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading || email === "" || password === ""}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </Text>
          </TouchableOpacity>

          {/* Register Link */}
          {/* <View style={styles.footer}>
            <Text style={styles.footerText}>Bạn chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.registerText}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View> */}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

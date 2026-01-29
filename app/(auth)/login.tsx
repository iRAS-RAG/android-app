"use client";

import { styles } from "@/styles/auth/auth.styles";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [error, setError] = useState(""); // State lưu trữ thông báo lỗi

  const isButtonDisabled = email.length === 0 || password.length === 0;

  // Xử lý logic đăng nhập
  const handleLogin = () => {
    // Tài khoản Demo để kiểm tra

    const DEMO_EMAIL = "tech@fpt.edu.vn";
    const DEMO_PASS = "123456";

    if (email === DEMO_EMAIL && password === DEMO_PASS) {
      setError("");
      // Đăng nhập thành công -> Chuyển hướng vào Tabs chính
      // Dùng replace để không quay lại màn hình Login bằng nút Back
      router.replace("/(tabs)");
    } else {
      // Hiển thị lỗi màu đỏ dựa trên theme
      setError("Email hoặc mật khẩu của bạn không chính xác.");
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
              isButtonDisabled && styles.loginButtonDisabled,
            ]}
            disabled={isButtonDisabled}
            onPress={handleLogin} // Gọi hàm kiểm tra đăng nhập
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Bạn chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.registerText}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

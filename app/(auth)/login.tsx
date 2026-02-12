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
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setIsLoading(true);
    setError(""); // Reset lỗi

    try {
      const result = await authService.login(email, password);
      console.log("Login Success:", result);

      if (result && result.token) {
        await signIn({
          accessToken: result.token.accessToken,
          refreshToken: result.token.refreshToken,
        });
        router.replace("/(tabs)");
      } else {
        // Trường hợp API trả về 200 nhưng không có token (hiếm gặp nhưng cần xử lý)
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (err: any) {
      console.log("Login Error:", err);
      // Bây giờ err là object axios đầy đủ, ta có thể check status
      if (err.response) {
        if (err.response.status === 400 || err.response.status === 401) {
          setError("Email hoặc mật khẩu không chính xác. Vui lòng thử lại.");
        } else if (err.response.status === 500) {
          setError("Lỗi máy chủ (500). Vui lòng thử lại sau.");
        } else {
          setError(err.response.data?.message || "Đăng nhập thất bại.");
        }
      } else if (err.request) {
        setError("Không thể kết nối đến máy chủ. Kiểm tra mạng của bạn.");
      } else {
        setError("Đã xảy ra lỗi không xác định.");
      }
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

        <View style={styles.form}>
          {/* Email Input */}
          <View
            style={[
              styles.inputWrapper,
              focusedInput === "email" && styles.inputWrapperFocused,
              error !== "" && { borderColor: theme.colors.danger },
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
                if (error) setError("");
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
              error !== "" && { borderColor: theme.colors.danger },
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
                if (error) setError("");
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

          {/* === HIỂN THỊ LỖI TẠI ĐÂY === */}
          {error ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
                paddingHorizontal: 4,
              }}
            >
              <Ionicons
                name="alert-circle"
                size={16}
                color={theme.colors.danger}
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  color: theme.colors.danger,
                  fontSize: 13,
                  fontWeight: "400",
                  flex: 1, // Để text xuống dòng nếu quá dài
                }}
              >
                {error}
              </Text>
            </View>
          ) : null}
          {/* =========================== */}

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push("/(auth)/forgotPassword")}
          >
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

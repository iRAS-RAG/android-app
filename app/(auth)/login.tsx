"use client";

import { styles } from "@/styles/auth/auth.styles";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import authService from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import axiosClient from "../../api/axiosClient"; // Import để xem cấu hình
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
    setError("");

    // LOG 1: Kiểm tra cấu hình kết nối trước khi gửi
    console.log("--- BẮT ĐẦU ĐĂNG NHẬP ---");
    console.log("URL Cấu hình:", axiosClient.defaults.baseURL);
    console.log("Dữ liệu gửi đi:", { email, password });

    try {
      const result = await authService.login(email, password);

      // LOG 2: Đăng nhập thành công
      console.log("Kết quả từ Server:", result);

      if (result && result.token) {
        await signIn({
          accessToken: result.token.accessToken,
          refreshToken: result.token.refreshToken,
        });
        console.log("Đã lưu Token thành công. Chuyển trang...");
        router.replace("/(tabs)");
      } else {
        console.log("Cảnh báo: Server trả về 200 nhưng không có Token");
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (err: any) {
      // LOG 3: Log toàn bộ lỗi ra Terminal để xem
      console.log("--- LỖI ĐĂNG NHẬP CHI TIẾT ---");

      if (err.response) {
        // Lỗi từ phía Server trả về (400, 401, 500...)
        console.log("Status Code:", err.response.status);
        console.log("Data từ Server:", err.response.data);

        if (err.response.status === 400 || err.response.status === 401) {
          setError("Email hoặc mật khẩu không chính xác.");
        } else if (err.response.status === 500) {
          setError("Lỗi máy chủ (500).");
        } else {
          setError(err.response.data?.message || "Đăng nhập thất bại.");
        }
      } else if (err.request) {
        // Lỗi không gửi được request (Sai IP, sai Port, Firewall chặn)
        console.log("Lỗi Request (Không kết nối được):", err.request);
        setError(
          "Không thể kết nối đến máy chủ. Hãy kiểm tra IP: " +
            axiosClient.defaults.baseURL,
        );
      } else {
        // Lỗi thiết lập code
        console.log("Lỗi không xác định:", err.message);
        setError("Đã xảy ra lỗi: " + err.message);
      }
    } finally {
      setIsLoading(false);
      console.log("--- KẾT THÚC QUY TRÌNH ---");
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
            <TouchableOpacity onPress={() => setSecureText(!secureText)}>
              <Ionicons
                name={secureText ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {error ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Ionicons
                name="alert-circle"
                size={16}
                color={theme.colors.danger}
                style={{ marginRight: 6 }}
              />
              <Text
                style={{ color: theme.colors.danger, fontSize: 13, flex: 1 }}
              >
                {error}
              </Text>
            </View>
          ) : null}

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

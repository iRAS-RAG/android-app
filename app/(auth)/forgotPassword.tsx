import { styles } from "@/styles/auth/auth.styles";
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import authService from "../../services/authService"; // Đảm bảo đường dẫn chính xác
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Hàm kiểm tra định dạng Email chuẩn
  const validateEmail = (text: string) => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    return reg.test(text);
  };

  const isValidEmail = email.length === 0 || validateEmail(email);
  const isButtonDisabled =
    email.length === 0 || !validateEmail(email) || isLoading;

  // Xử lý gửi yêu cầu khôi phục mật khẩu
  const handleCheckEmail = async () => {
    if (isButtonDisabled) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      console.log("--- BẮT ĐẦU GỬI YÊU CẦU QUÊN MẬT KHẨU ---");
      console.log("Email gửi đi:", email); // Gọi đến Backend C# thông qua authService

      const result = await authService.requestPasswordReset(email); // LOG DỮ LIỆU PHẢN HỒI THUẦN TÚY (PLAIN CODE)

      console.log(
        "Dữ liệu phản hồi từ Server (Full Result):",
        JSON.stringify(result, null, 2),
      );

      if (result) {
        console.log("Thông báo từ Backend:", result.message); // Chuyển sang trang VerifyOTP kèm theo email để xác thực
        router.push({
          pathname: "/(auth)/verifyOTP",
          params: { email: email, mode: "forgot" },
        });
      }
    } catch (error: any) {
      console.log("--- LỖI PHÁT SINH ---"); // Log chi tiết lỗi từ Axios nếu có
      if (error.response) {
        console.log("Status Code lỗi:", error.response.status);
        console.log(
          "Nội dung lỗi thô (Plain Error):",
          JSON.stringify(error.response.data, null, 2),
        );
      } else {
        console.log("Lỗi không có response (Network/Timeout):", error.message);
      }

      setErrorMessage(
        typeof error === "string" ? error : "Có lỗi xảy ra, vui lòng thử lại.",
      );
    } finally {
      console.log("--- KẾT THÚC QUY TRÌNH ---");
      setIsLoading(false);
    }
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
          disabled={isLoading}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>

        {/* Header Section */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/logo1.png")}
            style={[styles.logo]}
            resizeMode="contain"
          />
          <Text style={styles.title}>Quên mật khẩu</Text>
          <Text style={[styles.subTitleDescription, { textAlign: "center" }]}>
            Vui lòng nhập email của bạn để hệ thống kiểm tra và gửi hướng dẫn
            khôi phục.
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.form}>
          <View
            style={[
              styles.inputWrapper,
              focusedInput === "email" && styles.inputWrapperFocused,
              (!isValidEmail || errorMessage !== "") && {
                borderColor: theme.colors.danger,
              },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={
                !isValidEmail || errorMessage !== ""
                  ? theme.colors.danger
                  : focusedInput === "email"
                    ? theme.colors.primary
                    : theme.colors.textSecondary
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Nhập địa chỉ email"
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          {/* Cảnh báo định dạng email hoặc lỗi từ server */}
          {(!isValidEmail || errorMessage !== "") && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: -10,
                marginBottom: 15,
                marginLeft: 5,
                gap: 4,
              }}
            >
              <Ionicons
                name="alert-circle-outline"
                size={14}
                color={theme.colors.danger}
              />
              <Text
                style={{
                  color: theme.colors.danger,
                  ...theme.typography.caption,
                }}
              >
                {errorMessage || "Email không hợp lệ. Vui lòng thử lại"}
              </Text>
            </View>
          )}

          {/* Button Kiểm tra Email */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isButtonDisabled && styles.loginButtonDisabled,
            ]}
            disabled={isButtonDisabled}
            activeOpacity={0.8}
            onPress={handleCheckEmail}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Kiểm tra email</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

import { styles } from "@/styles/auth/auth.styles";
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Hàm kiểm tra định dạng Email chuẩn
  const validateEmail = (text: string) => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    return reg.test(text);
  };

  const isValidEmail = email.length === 0 || validateEmail(email);
  const isButtonDisabled = email.length === 0 || !validateEmail(email);

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
              !isValidEmail && { borderColor: theme.colors.danger }, // Đổi viền đỏ khi sai
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={
                !isValidEmail
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
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          {/* Dòng cảnh báo hiển thị khi email không hợp lệ */}
          {!isValidEmail && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: -10,
                marginBottom: 15,
                marginLeft: 5,
                gap: 4, // khoảng cách icon - text
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
                Email không hợp lệ. Vui lòng thử lại
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
            onPress={() => {
              // Khi email hợp lệ, chuyển hướng sang trang VerifyOTP
              // Truyền thêm params email để trang sau sử dụng
              router.push({
                pathname: "/(auth)/verifyOTP", // Đảm bảo đường dẫn này khớp với cấu trúc thư mục của bạn
                params: { email: email, mode: "forgot" },
              });

              console.log("Đang chuyển sang trang xác thực cho:", email);
            }}
          >
            <Text style={styles.loginButtonText}>Kiểm tra email</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

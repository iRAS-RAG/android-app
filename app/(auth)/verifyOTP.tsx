"use client";

import { styles } from "@/styles/auth/auth.styles"; // Sử dụng đúng đường dẫn file style của bạn
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

export default function VerifyOTP() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = (params.email as string) || "user@example.com";
  const mode = (params.mode as string) || "forgot";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const inputsRef = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError(""); // Xóa lỗi khi người dùng nhập lại
      if (value && index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleBackspace = (event: any, index: number) => {
    if (event.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      setError("Vui lòng nhập đủ 6 số.");
      return;
    }

    const DEMO_OTP = "123456";

    if (enteredOtp === DEMO_OTP) {
      setError("");
      console.log("Xác thực OTP thành công!");

      // SỬA LỖI ROUTE TẠI ĐÂY:
      // Cách 1: Sử dụng đường dẫn trực tiếp (khuyên dùng nếu file là app/(auth)/resetPassword.tsx)
      router.push({
        pathname: "/resetPassword",
        params: { email: email },
      });

      /* Cách 2: Nếu cách trên vẫn lỗi, hãy thử dùng đường dẫn tuyệt đối đầy đủ:
      router.push(`/(auth)/resetPassword?email=${email}`);
      */
    } else {
      setError("Mã OTP không hợp lệ. Vui lòng thử lại.");
    }
  };

  const handleResendOTP = () => {
    setTimeLeft(60);
    setOtp(Array(6).fill(""));
    setError("");
    inputsRef.current[0]?.focus();
  };

  const isButtonDisabled = otp.join("").length !== 6;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        {/* Nút quay lại sử dụng style thống nhất */}
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
          {/* Header Section kế thừa từ style chung */}
          <View style={styles.header}>
            <Image
              source={require("@/assets/images/logo1.png")}
              style={[styles.logo]} // Điều chỉnh size logo nhỏ lại cho OTP
              resizeMode="contain"
            />
            <Text style={styles.title}>Xác thực OTP</Text>
            <Text style={[styles.subTitleDescription, { textAlign: "center" }]}>
              Mã xác thực đã được gửi đến:{"\n"}
              <Text
                style={{ fontWeight: "700", color: theme.colors.textPrimary }}
              >
                {email}
              </Text>
            </Text>
          </View>

          {/* Khu vực nhập OTP */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => {
                  // Chỉ thực hiện gán giá trị, không sử dụng hàm mũi tên trả về giá trị trực tiếp
                  inputsRef.current[index] = el;
                }}
                style={[
                  styles.otpInput,
                  // Hiển thị viền xanh khi đang nhấn vào ô (focused)
                  focusedIndex === index && styles.otpInputFocus,
                  // Hiển thị viền đỏ nếu có lỗi xác thực
                  error ? styles.otpInputError : null,
                ]}
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleChange(value, index)}
                onKeyPress={(e) => handleBackspace(e, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
              />
            ))}
          </View>

          {/* Đồng hồ đếm ngược và Gửi lại mã */}
          <View style={{ marginBottom: theme.spacing.lg }}>
            {timeLeft > 0 ? (
              <Text style={styles.timerText}>
                Gửi lại sau {Math.floor(timeLeft / 60)}:
                {String(timeLeft % 60).padStart(2, "0")}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOTP}>
                <Text style={styles.resendButtonText}>Gửi lại mã OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Hiển thị lỗi đồng nhất màu danger */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Nút xác nhận sử dụng lại loginButton style */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isButtonDisabled && styles.loginButtonDisabled,
            ]}
            disabled={isButtonDisabled}
            onPress={handleVerify}
          >
            <Text style={styles.loginButtonText}>XÁC NHẬN</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

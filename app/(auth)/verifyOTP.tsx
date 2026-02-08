"use client";

import { styles } from "@/styles/auth/auth.styles";
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
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

export default function VerifyOTP() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = (params.email as string) || "";
  const mode = (params.mode as string) || "forgot";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const inputsRef = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError("");
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

  const handleVerify = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) return;

    setIsLoading(true);
    setError("");

    try {
      // Trong luồng iRAS-RAG, ta chuyển mã OTP sang trang reset để Backend xác thực cùng lúc với mật khẩu mới
      router.push({
        pathname: "/(auth)/resetPassword",
        params: { email: email, otp: enteredOtp },
      });
    } catch (err: any) {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = otp.join("").length !== 6 || isLoading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
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
          <View style={styles.header}>
            <Image
              source={require("../../assets/images/logo1.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>
              {mode === "register" ? "Kích hoạt" : "Xác nhận mã"}
            </Text>
            <Text style={[styles.subTitleDescription, { textAlign: "center" }]}>
              Mã xác thực đã được gửi đến email: {email}
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el: TextInput | null) => {
                  inputsRef.current[index] = el;
                }}
                style={[
                  styles.otpInput,
                  focusedIndex === index && styles.otpInputFocus,
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

          <View style={{ marginBottom: theme.spacing.lg }}>
            {timeLeft > 0 ? (
              <Text style={styles.timerText}>
                Gửi lại sau {Math.floor(timeLeft / 60)}:
                {String(timeLeft % 60).padStart(2, "0")}s
              </Text>
            ) : (
              <TouchableOpacity onPress={() => setTimeLeft(60)}>
                <Text style={styles.resendButtonText}>Gửi lại mã OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[
              styles.loginButton,
              isButtonDisabled && styles.loginButtonDisabled,
            ]}
            disabled={isButtonDisabled}
            onPress={handleVerify}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Xác nhận</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

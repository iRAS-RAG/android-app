"use client";

import { styles } from "@/styles/auth/auth.styles";
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

export default function RegisterScreen() {
  const router = useRouter();

  // --- Form State ---
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // --- Logic Validation ---
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 8;
  const isMatch = password === confirmPassword && password.length > 0;

  const isFormValid =
    fullName.trim().length > 0 &&
    username.trim().length > 0 &&
    isValidEmail &&
    isPasswordValid &&
    isMatch;

  // Component nhãn có dấu *
  const RequiredLabel = ({ label }: { label: string }) => (
    <Text
      style={[
        theme.typography.body2,
        { color: theme.colors.textPrimary, marginBottom: 4, marginLeft: 4 },
      ]}
    >
      {label} <Text style={{ color: theme.colors.danger }}>*</Text>
    </Text>
  );

  return (
    <LinearGradient colors={["#E3F2FD", "#F4F7FA"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.inner}
        >
          {/* Nút quay lại */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginBottom: 10 }}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View style={styles.header}>
              <Image
                source={require("../../assets/images/logo1.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Đăng ký tài khoản</Text>
              <Text style={styles.subTitleDescription}>
                Hệ thống trợ lý AI RAS thông minh
              </Text>
            </View>

            <View style={styles.form}>
              {/* Họ và tên */}
              <RequiredLabel label="Họ và tên" />
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === "name" && styles.inputWrapperFocused,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={theme.colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={fullName}
                  onChangeText={setFullName}
                  onFocus={() => setFocusedInput("name")}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              {/* Username */}
              <RequiredLabel label="Tên đăng nhập" />
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === "user" && styles.inputWrapperFocused,
                ]}
              >
                <Ionicons
                  name="at-outline"
                  size={20}
                  color={theme.colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: kythuatvien01"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput("user")}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              {/* Email */}
              <RequiredLabel label="Địa chỉ Email" />
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === "email" && styles.inputWrapperFocused,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={theme.colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              {/* Mật khẩu */}
              <RequiredLabel label="Mật khẩu" />
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
                  placeholder="Tối thiểu 8 ký tự"
                  placeholderTextColor={theme.colors.textSecondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedInput("pass")}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Xác nhận mật khẩu */}
              <RequiredLabel label="Xác nhận mật khẩu" />
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === "confirm" && styles.inputWrapperFocused,
                  confirmPassword.length > 0 &&
                    !isMatch && { borderColor: theme.colors.danger },
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={theme.colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập lại mật khẩu phía trên"
                  placeholderTextColor={theme.colors.textSecondary}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocusedInput("confirm")}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              {/* Nút đăng ký */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  !isFormValid && styles.loginButtonDisabled,
                  { marginTop: 10 },
                ]}
                disabled={!isFormValid}
                onPress={() => router.push("/(auth)/verifyOTP")}
              >
                <Text style={styles.loginButtonText}>Đăng ký tài khoản</Text>
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Bạn đã có tài khoản? </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                  <Text style={styles.registerText}>Đăng nhập ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

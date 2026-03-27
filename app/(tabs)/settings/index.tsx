import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { theme } from "@/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import authService from "@/services/authService";
import { styles } from "@/styles/settings/setting.styles";

// ==========================================
// 1. ĐỊNH NGHĨA COMPONENT DÙNG CHUNG
// ==========================================

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subTitle?: string;
  type?: "navigate" | "switch" | "value" | "action";
  valueText?: string;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  isDestructive?: boolean;
  hideBottomBorder?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  iconColor = "#3B82F6",
  title,
  subTitle,
  type = "navigate",
  valueText,
  switchValue = false,
  onSwitchChange,
  onPress,
  isDestructive = false,
  hideBottomBorder = false,
}) => {
  const textColor = isDestructive ? "#EF4444" : "#1E293B";
  const finalIconColor = isDestructive ? "#EF4444" : iconColor;

  return (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        hideBottomBorder && { borderBottomWidth: 0 },
      ]}
      onPress={onPress}
      disabled={
        type === "switch" || type === "value" || (!onPress && !isDestructive)
      }
      activeOpacity={0.7}
    >
      <View
        style={[styles.iconBox, { backgroundColor: `${finalIconColor}15` }]}
      >
        <Ionicons name={icon} size={20} color={finalIconColor} />
      </View>

      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: textColor }]}>{title}</Text>
        {subTitle && <Text style={styles.itemSubTitle}>{subTitle}</Text>}
      </View>

      <View style={styles.itemAction}>
        {type === "navigate" && (
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        )}
        {type === "switch" && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: "#E2E8F0", true: "#10B981" }}
            thumbColor="#FFF"
          />
        )}
        {type === "value" && (
          <Text style={styles.itemValueText}>{valueText}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ==========================================
// 2. MÀN HÌNH CHÍNH (LOGIC GIỮ NGUYÊN)
// ==========================================

export default function SettingsScreen() {
  const router = useRouter();

  // State logic cũ giữ nguyên (mặc dù bỏ QR nhưng vẫn giữ để không đụng logic)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // STATE DỮ LIỆU NGƯỜI DÙNG THẬT
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await authService.getCurrentUserProfile();
        setUserData(profile);
      } catch (error) {
        console.error("Lỗi tải thông tin cài đặt:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await authService.logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8FAFC",
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cài đặt</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* A. THẺ PROFILE CARD */}
        <LinearGradient
          colors={["#3B82F6", "#1D4ED8"]} // Gradient xanh đậm sang trọng
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={32} color="#3B82F6" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {userData
                ? `${userData.firstName} ${userData.lastName}`
                : "Chưa cập nhật"}
            </Text>
            <Text style={styles.profileEmail}>
              {userData?.email || "nguyenvana@aquatech.vn"}
            </Text>
            <View style={styles.roleBadge}>
              <MaterialCommunityIcons
                name="shield-check"
                size={14}
                color="#10B981"
              />
              <Text style={styles.roleText}>
                {userData?.roleName || "Kỹ thuật viên"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* B. KHỐI 1: QUẢN LÝ TÀI KHOẢN */}
        <Text style={styles.sectionTitle}>QUẢN LÝ TÀI KHOẢN</Text>
        <View style={styles.sectionBlock}>
          <SettingItem
            icon="lock-closed-outline"
            iconColor="#F59E0B"
            title="Đổi mật khẩu"
            subTitle="Cập nhật mật khẩu"
            type="navigate"
            onPress={() => router.push("/changePassword")}
          />
          <SettingItem
            icon="log-out-outline"
            title="Đăng xuất"
            type="action"
            isDestructive={true}
            hideBottomBorder={true}
            onPress={handleLogout}
          />
        </View>

        {/* C. KHỐI 2: TRỢ GIÚP & THÔNG TIN (Đã bỏ Camera/QR) */}
        <Text style={styles.sectionTitle}>TRỢ GIÚP & THÔNG TIN</Text>
        <View style={styles.sectionBlock}>
          <SettingItem
            icon="help-circle-outline"
            iconColor="#3B82F6"
            title="Hướng dẫn sử dụng"
            subTitle="Tài liệu Mobile App"
            type="navigate"
            onPress={() => router.push("/userGuide")}
          />
          <SettingItem
            icon="call-outline"
            iconColor="#10B981"
            title="Liên hệ Hỗ trợ"
            subTitle="support@aquatech.vn"
            type="navigate"
            onPress={() => router.push("/support")}
          />
          <SettingItem
            icon="information-circle-outline"
            iconColor="#64748B"
            title="Phiên bản ứng dụng"
            subTitle="Build info"
            type="navigate" // <-- Đổi thành navigate để có thể bấm vào
            valueText="v1.2.3"
            onPress={() => router.push("/appVersion")}
          />
          <SettingItem
            icon="document-text-outline"
            iconColor="#F59E0B"
            title="Điều khoản & Chính sách"
            subTitle="Terms of Service & Privacy"
            type="navigate"
            hideBottomBorder={true}
            onPress={() => router.push("/terms")}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

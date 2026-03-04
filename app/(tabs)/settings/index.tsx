import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { theme } from "@/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import authService from "@/services/authService"; // Import để lấy profile thật
import { styles } from "@/styles/settings/setting.styles";

export default function SettingsScreen() {
  const router = useRouter();
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // STATE DỮ LIỆU NGƯỜI DÙNG THẬT
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await authService.getCurrentUserProfile(); // Gọi API /users/me
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
          await authService.logout(); // Xóa sạch token khi logout
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* A. HEADER & USER CARD - ĐÃ ĐỔI SANG DATA THẬT */}
        <View style={styles.headerContainer}>
          <Text style={styles.pageTitle}>Cài đặt</Text>

          <LinearGradient
            colors={[theme.colors.primary, "#1E40AF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.userCard}
          >
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={32} color="#FFF" />
              </View>
              <View>
                <Text style={styles.userName}>
                  {userData
                    ? `${userData.firstName} ${userData.lastName}`
                    : "Chưa cập nhật"}
                </Text>
                <Text style={styles.userEmail}>
                  {userData?.email || "nguyenvana@aquatech.vn"}
                </Text>
                <View style={styles.roleBadge}>
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={12}
                    color="#FFF"
                  />
                  <Text style={styles.roleText}>
                    {userData?.roleName || "User"}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* B. KHỐI 1: QUẢN LÝ TÀI KHOẢN */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>QUẢN LÝ TÀI KHOẢN</Text>
          <View style={styles.cardContainer}>
            <SettingItem
              icon="person-outline"
              iconColor={theme.colors.primary}
              iconBg="#E3F2FD"
              title="Thông tin cá nhân"
              subtitle="Xem và chỉnh sửa"
              onPress={() => {}}
            />
            <Divider />
            <SettingItem
              icon="lock-closed-outline"
              iconColor={theme.colors.warning}
              iconBg="#FFF3E0"
              title="Đổi mật khẩu"
              subtitle="Cập nhật mật khẩu"
              onPress={() => {}}
            />
            <Divider />
            <SettingItem
              icon="shield-checkmark-outline"
              iconColor={theme.colors.success}
              iconBg="#E8F5E9"
              title="Vai trò"
              subtitle="Không thể thay đổi"
              rightElement={
                <View
                  style={[styles.statusBadge, { backgroundColor: "#E0F2F1" }]}
                >
                  <Text
                    style={{
                      color: "#00695C",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {userData?.roleName || "Operator"}
                  </Text>
                </View>
              }
            />
            <Divider />
            <SettingItem
              icon="log-out-outline"
              iconColor={theme.colors.danger}
              iconBg="#FFEBEE"
              title="Đăng xuất"
              titleStyle={{ color: theme.colors.danger }}
              isDestructive
              onPress={handleLogout}
            />
          </View>
        </View>

        {/* C. KHỐI 2: CẤU HÌNH CAMERA/QR */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>CẤU HÌNH CAMERA/QR</Text>
          <View style={styles.cardContainer}>
            <View style={styles.cameraItemContainer}>
              <SettingItem
                icon="camera-outline"
                iconColor={theme.colors.primary}
                iconBg="#E3F2FD"
                title="Quyền truy cập Camera"
                subtitle="Cho phép quét QR và chụp ảnh"
                hideArrow
              />
              <View style={styles.permissionStatusRow}>
                <Text style={styles.permissionLabel}>Trạng thái</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={theme.colors.success}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={{
                      color: theme.colors.success,
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    Đã cho phép
                  </Text>
                </View>
              </View>
            </View>

            <Divider />

            <SettingItem
              icon="volume-high-outline"
              iconColor={theme.colors.warning}
              iconBg="#FFF3E0"
              title="Âm thanh quét QR"
              subtitle="Phát âm khi quét thành công"
              hideArrow
              rightElement={
                <Switch
                  trackColor={{ false: "#767577", true: theme.colors.success }}
                  thumbColor={"#f4f3f4"}
                  onValueChange={setIsSoundEnabled}
                  value={isSoundEnabled}
                />
              }
            />
          </View>
        </View>

        {/* D. KHỐI 3: TRỢ GIÚP & THÔNG TIN */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>TRỢ GIÚP & THÔNG TIN</Text>
          <View style={styles.cardContainer}>
            <SettingItem
              icon="help-circle-outline"
              iconColor={theme.colors.primary}
              iconBg="#E3F2FD"
              title="Hướng dẫn sử dụng"
              subtitle="Tài liệu Mobile App"
              onPress={() => {}}
            />
            <Divider />
            <SettingItem
              icon="call-outline"
              iconColor={theme.colors.secondary}
              iconBg="#E0F2F1"
              title="Liên hệ Hỗ trợ"
              subtitle="support@aquatech.vn"
              onPress={() => {}}
            />
            <Divider />
            <SettingItem
              icon="information-circle-outline"
              iconColor={theme.colors.textSecondary}
              iconBg="#F3F4F6"
              title="Phiên bản ứng dụng"
              subtitle="Build info"
              hideArrow
              rightElement={
                <Text
                  style={{ color: theme.colors.textSecondary, fontSize: 13 }}
                >
                  v1.2.3
                </Text>
              }
            />
            <Divider />
            <SettingItem
              icon="document-text-outline"
              iconColor="#F59E0B"
              iconBg="#FEF3C7"
              title="Điều khoản & Chính sách"
              subtitle="Terms of Service & Privacy"
              onPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ------------------- COMPONENTS CON & STYLES (GIỮ NGUYÊN) ------------------- //

const SettingItem = ({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  rightElement,
  hideArrow,
  onPress,
  titleStyle,
  isDestructive,
}: any) => (
  <TouchableOpacity
    style={styles.itemContainer}
    onPress={onPress}
    disabled={!onPress && !isDestructive}
    activeOpacity={0.7}
  >
    <View style={styles.itemLeft}>
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={{ marginLeft: 12 }}>
        <Text style={[styles.itemTitle, titleStyle]}>{title}</Text>
        {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <View style={styles.itemRight}>
      {rightElement}
      {!hideArrow && !rightElement && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDestructive ? theme.colors.danger : "#CBD5E1"}
        />
      )}
    </View>
  </TouchableOpacity>
);

const Divider = () => <View style={styles.divider} />;

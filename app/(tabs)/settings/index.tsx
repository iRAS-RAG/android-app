import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { theme } from "@/theme";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const router = useRouter();
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => router.replace("/(auth)/login"),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* A. HEADER & USER CARD */}
        <View style={styles.headerContainer}>
          <Text style={styles.pageTitle}>Cài đặt</Text>

          <LinearGradient
            colors={[theme.colors.primary, "#1E40AF"]} // Gradient Blue
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.userCard}
          >
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={32} color="#FFF" />
              </View>
              <View>
                <Text style={styles.userName}>Nguyễn Văn A</Text>
                <Text style={styles.userEmail}>nguyenvana@aquatech.vn</Text>
                <View style={styles.roleBadge}>
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={12}
                    color="#FFF"
                  />
                  <Text style={styles.roleText}>Supervisor</Text>
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
              iconBg="#E3F2FD" // Xanh nhạt
              title="Thông tin cá nhân"
              subtitle="Xem và chỉnh sửa"
              onPress={() => {}}
            />
            <Divider />
            <SettingItem
              icon="lock-closed-outline"
              iconColor={theme.colors.warning}
              iconBg="#FFF3E0" // Cam nhạt
              title="Đổi mật khẩu"
              subtitle="Cập nhật mật khẩu"
              onPress={() => {}}
            />
            <Divider />
            <SettingItem
              icon="shield-checkmark-outline"
              iconColor={theme.colors.success}
              iconBg="#E8F5E9" // Xanh lá nhạt
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
                    Supervisor
                  </Text>
                </View>
              }
            />
            <Divider />
            <SettingItem
              icon="log-out-outline"
              iconColor={theme.colors.danger}
              iconBg="#FFEBEE" // Đỏ nhạt
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
              iconBg="#E0F2F1" // Xanh ngọc nhạt
              title="Liên hệ Hỗ trợ"
              subtitle="support@aquatech.vn"
              onPress={() => {}}
            />
            <Divider />
            <SettingItem
              icon="information-circle-outline"
              iconColor={theme.colors.textSecondary}
              iconBg="#F3F4F6" // Xám nhạt
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
              iconBg="#FEF3C7" // Vàng nhạt
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

// ------------------- COMPONENTS CON & STYLES ------------------- //

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Nền xám rất nhạt cho toàn trang
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
    backgroundColor: "#FFF",
    paddingBottom: 20,
  },
  pageTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: 20,
  },
  userCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  roleText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardContainer: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    overflow: "hidden", // Để bo góc hoạt động với các item con
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 68, // Canh lề để không cắt icon
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  // Style riêng cho mục Camera
  cameraItemContainer: {
    backgroundColor: "#FFF",
  },
  permissionStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingLeft: 68, // Thụt vào thẳng hàng với text trên
    marginTop: -8,
  },
  permissionLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});

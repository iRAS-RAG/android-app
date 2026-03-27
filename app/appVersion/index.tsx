import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function AppVersionScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phiên bản ứng dụng</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="fish" size={80} color="#3B82F6" />
        </View>

        <Text style={styles.appName}>iRAS-RAG Mobile</Text>
        <Text style={styles.versionText}>Phiên bản 1.2.3 (Build 20260327)</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓ Đã cập nhật mới nhất</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Tính năng mới trong bản cập nhật:
          </Text>
          <Text style={styles.infoLine}>
            • Tối ưu hóa biểu đồ giám sát thời gian thực.
          </Text>
          <Text style={styles.infoLine}>
            • Nâng cấp giao diện Settings & Đổi mật khẩu.
          </Text>
          <Text style={styles.infoLine}>
            • Cập nhật module RAG AI Advisory.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: { justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1E293B" },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  appName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 8,
  },
  versionText: { fontSize: 14, color: "#64748B", marginBottom: 20 },
  badge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 40,
  },
  badgeText: { color: "#059669", fontWeight: "600", fontSize: 13 },
  infoCard: {
    width: "100%",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },
  infoLine: { fontSize: 14, color: "#475569", lineHeight: 24, marginBottom: 6 },
});

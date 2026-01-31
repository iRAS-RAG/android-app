import { theme } from "@/theme";
import { Dimensions, Platform, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  headerSection: {
    paddingHorizontal: 20,
    // Giảm padding để đẩy chữ và icon lên sát mép trên
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 15,
    backgroundColor: "#FFF",
  },
  headerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  farmName: { ...theme.typography.h3, color: theme.colors.textPrimary },
  techName: { ...theme.typography.body2, color: theme.colors.textSecondary },
  notiBtn: { padding: 5 },
  notiBadge: {
    position: "absolute",
    right: 5,
    top: 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.danger,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  quickStatsRow: {
    flexDirection: "row",
    gap: 15,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    padding: 15,
    backgroundColor: "#F1F5F9",
    borderRadius: theme.borderRadius.md,
  },
  statLabel: { ...theme.typography.caption, color: theme.colors.textSecondary },
  statValue: { ...theme.typography.h1, color: theme.colors.textPrimary },

  sensorContainer: { padding: 20 },
  sectionTitle: { ...theme.typography.h3, marginBottom: 15 },
  sensorCard: {
    width: width * 0.4, // Tăng độ rộng lên khoảng 40% màn hình để giống trang chi tiết
    marginRight: 15,
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  sensorLabel: {
    ...theme.typography.caption,
    marginTop: 8,
    color: theme.colors.textSecondary,
  },
  sensorValue: {
    fontSize: 20, // Kích thước chữ giống trang chi tiết
    fontWeight: "700",
    marginVertical: 2,
  },
  sensorUnit: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  sensorTime: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },

  tankCard: {
    backgroundColor: "#FFF",
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  tankHeader: { flexDirection: "row", alignItems: "center" },
  tankAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
  },
  tankName: { ...theme.typography.h3 },
  fishName: { fontSize: 14, fontWeight: "600" },
  fishEnglish: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
  },

  tankStatsGrid: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  gridItem: { flex: 1 },
  gridLabel: { fontSize: 10, color: theme.colors.textSecondary },
  gridValue: { fontSize: 13, fontWeight: "700" },

  envGrid: { flexDirection: "row", gap: 8, marginBottom: 12 },
  envItem: { flex: 1, padding: 8, borderRadius: 6, alignItems: "center" },
  envLabel: { fontSize: 9, fontWeight: "600" },
  envValue: { fontSize: 12, fontWeight: "700" },

  detailBtn: {
    padding: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  detailBtnText: {
    color: theme.colors.primary,
    fontWeight: "700",
    marginRight: 4,
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
  },
  activeDot: {
    width: 20,
    backgroundColor: theme.colors.primary,
  },
  tankContainer: {
    padding: 20,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  viewAll: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "600",
  },
});

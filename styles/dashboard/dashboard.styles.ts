import { theme } from "@/theme";
import { Dimensions, Platform, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  headerSection: {
    paddingHorizontal: 20,

    paddingTop: Platform.OS === "ios" ? 45 : 15,
    paddingBottom: 35,
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15, // Giảm margin từ 20 xuống 15
  },
  farmName: {
    ...theme.typography.h3,
    color: theme.colors.white,
    fontWeight: "700",
  },
  techName: {
    ...theme.typography.caption,
    color: "rgba(255, 255, 255, 0.8)",
  },

  // Giữ nguyên các phần thông báo để tránh lỗi
  notiBtn: {
    padding: 5,
    position: "relative",
  },
  notiBadge: {
    position: "absolute",
    right: 5,
    top: 5,
    width: 8, // Thu nhỏ badge một chút cho tinh tế
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.danger,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },

  // THẺ THỐNG KÊ TRONG HEADER
  quickStatsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12, // Giảm padding từ 15 xuống 12
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.white,
    opacity: 0.85,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 22, // Giảm nhẹ font size từ 26 xuống 22 để tổng thể gọn lại
    fontWeight: "800",
    color: theme.colors.white,
  },

  // THANH TÌM KIẾM NỔI (FLOATING SEARCH)
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: -25, // Điều chỉnh lại độ đè để cân đối với paddingBottom của header
    marginBottom: 15,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: 25, // Giảm nhẹ độ bo tròn
    paddingHorizontal: 18,
    height: 50, // Giảm chiều cao từ 56 xuống 50
    ...theme.shadows.light,
  },

  // Các phần khác giữ nguyên để đảm bảo không phát sinh lỗi Problem
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  tankContainer: {
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.textPrimary,
  },
  viewAll: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  tankCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 20, // Chỉnh lại 20 cho cân đối với header
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...theme.shadows.light,
  },
  tankHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  tankAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.kpi.temp.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  tankName: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  fishName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  tankStatsGrid: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 12,
  },
  gridItem: { flex: 1 },
  gridLabel: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  detailBtn: {
    paddingVertical: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    alignItems: "center",
  },
  detailBtnText: {
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
});

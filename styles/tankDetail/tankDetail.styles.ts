import { theme } from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: "#FFF",
  },
  headerTitleContainer: { flex: 1, marginLeft: 15 },
  headerTitle: { ...theme.typography.h3, color: theme.colors.textPrimary },
  headerSubTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  headerActions: { flexDirection: "row" },
  sectionContainer: { padding: 20 },
  sectionLabel: { ...theme.typography.h3, marginBottom: 15 },
  metricRow: { flexDirection: "row" },
  metricCard: {
    width: 130,
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginRight: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
  },
  metricLabel: { ...theme.typography.caption, marginTop: 8 },
  metricValue: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 4,
  },
  metricTime: { fontSize: 10, color: theme.colors.textSecondary },
  chartCard: {
    margin: 20,
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 16,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  chartTitle: { fontWeight: "700", color: theme.colors.textPrimary },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
    marginRight: 4,
  },
  liveText: { fontSize: 10, color: "#EF4444", fontWeight: "700" },
  thresholdRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  aiButton: {
    margin: 20,
    padding: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  aiButtonText: { color: "#FFF", fontWeight: "700" },
  aiButtonSub: { color: "rgba(255,255,255,0.7)", fontSize: 11 },
  pumpContainer: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
  },
  pumpHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  pumpTitle: { fontWeight: "700" },
  pumpStatus: { fontSize: 12 },
  pumpGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridItem: {
    width: "48%",
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  progressContainer: {
    width: "48%",
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    marginTop: 8,
  },
  progressBarFill: { height: 6, borderRadius: 3 },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  activeDot: {
    width: 20,
    backgroundColor: theme.colors.primary,
  },
  // Thêm vào trong StyleSheet.create của bạn
  // Bổ sung metricUnit tại đây
  metricUnit: {
    fontSize: 12,
    color: theme.colors.textSecondary, // Hoặc dùng màu theo props như trong file [id].tsx
    marginLeft: 2,
    fontWeight: "600",
  },
});

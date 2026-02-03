import { theme } from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: "#FFF",
  },
  headerTitle: { ...theme.typography.h3, color: theme.colors.textPrimary },

  // Ô thông tin sự cố khẩn cấp
  emergencyCard: {
    margin: 20,
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.danger,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
  },
  emergencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  dangerTag: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  dangerTagText: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  alertDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },

  metaRow: { flexDirection: "row", marginTop: 15, gap: 15 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaLabel: { fontSize: 11, color: "#64748B" },

  // Dữ liệu thực tế
  currentValueCard: {
    padding: 20,
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    borderRadius: 16,
  },
  sectionLabel: { fontSize: 14, fontWeight: "700", marginBottom: 15 },
  mainValueContainer: { alignItems: "center", marginBottom: 20 },
  currentValueText: {
    fontSize: 36,
    fontWeight: "800",
    color: theme.colors.danger,
  },
  trendingRow: { flexDirection: "row", alignItems: "center" },

  comparisonGrid: { flexDirection: "row", gap: 10 },
  compBox: { flex: 1, padding: 10, borderRadius: 12, alignItems: "center" },
  compLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  compValue: { fontSize: 13, fontWeight: "700" },

  chartCard: {
    padding: 20,
    backgroundColor: "#FFF",
    margin: 20,
    borderRadius: 16,
  },

  // Hướng dẫn AI RAG
  aiSection: {
    padding: 20,
    backgroundColor: "#EFF6FF",
    marginHorizontal: 20,
    borderRadius: 16,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },
  aiTitle: { fontSize: 15, fontWeight: "700", color: theme.colors.primary },

  stepCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  stepTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  stepDesc: { fontSize: 12, color: theme.colors.textSecondary, lineHeight: 18 },
  priorityTag: { marginTop: 6 },
  priorityText: { fontSize: 10, fontWeight: "700", color: theme.colors.danger },

  // Ghi chú & Nút hành động
  logSection: { padding: 20 },
  noteInput: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  btnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    marginBottom: 10,
  },
  btnSecondaryText: {
    marginLeft: 8,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  btnWarning: {
    backgroundColor: "#F59E0B",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  btnSuccess: {
    backgroundColor: theme.colors.success,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  btnWhiteText: { color: "#FFF", fontWeight: "700" },
});

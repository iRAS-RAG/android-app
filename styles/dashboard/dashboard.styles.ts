import { theme } from "@/theme";
import { Dimensions, Platform, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 45 : 15,
    paddingBottom: 8,
    backgroundColor: theme.colors.primary,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  // Replaced farmName + techName with single userRoleText
  userRoleText: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.white,
  },
  // kept for compatibility
  farmName: {
    ...theme.typography.h3,
    color: theme.colors.white,
    fontWeight: "700",
  },
  techName: {
    ...theme.typography.caption,
    color: "rgba(255, 255, 255, 0.8)",
  },

  notiBtn: {
    padding: 5,
    position: "relative",
  },
  notiBadge: {
    position: "absolute",
    right: 5,
    top: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.danger,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },

  // STATS (kept for compat, no longer rendered)
  quickStatsRow: { flexDirection: "row", gap: 8 },
  statCard: { flex: 1, padding: 10, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14 },
  statLabel: { fontSize: 10, color: theme.colors.white, opacity: 0.85, marginBottom: 2 },
  statValue: { fontSize: 20, fontWeight: "800", color: theme.colors.white },

  // STATS SECTION — outside blue header
  statsSection: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  statCardHalf: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...theme.shadows.light,
  },
  statLabelDark: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  statValueDark: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },

  // TABS
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 0,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: theme.colors.white,
    ...theme.shadows.light,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.primary,
  },

  // SEARCH
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 0,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: 25,
    paddingHorizontal: 18,
    height: 50,
    ...theme.shadows.light,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },

  // FILTERS (row below search, batches tab only)
  filterRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
  },
  filterBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...theme.shadows.light,
  },
  filterBtnText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: "500",
  },

  // PICKER MODAL
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  pickerItemActive: {
    // no extra bg — just checkmark + text color
  },
  pickerItemText: {
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  pickerItemTextActive: {
    color: theme.colors.primary,
    fontWeight: "600",
  },

  // LIST
  tankContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
    borderRadius: 20,
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

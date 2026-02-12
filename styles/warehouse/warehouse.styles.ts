import { theme } from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  // HEADER
  headerContainer: {
    backgroundColor: "#FFF",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  screenTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: 15,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  filterBtn: {
    width: 44,
    height: 44,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  // TABS
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTabBtn: {
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  // BODY
  bodyContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 80, // Để tránh FAB che mất item cuối
  },
  listHeaderLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  // CARD STYLES
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBoxPrimary: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  badgeContainer: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginRight: 6,
  },
  footerValue: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  // LOG CARD STYLES
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  logTankName: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  logFeedName: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  amountText: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  userText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  noteBox: {
    marginTop: 10,
    backgroundColor: "#FFF7ED",
    padding: 8,
    borderRadius: 6,
  },
  noteText: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#C2410C",
  },
  // FAB
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 8,
    marginTop: 12,
  },
  fakeDropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#F8FAFC",
  },
  placeholderText: {
    color: "#94A3B8",
  },
  inputText: {
    color: theme.colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  inputWithUnit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  unitText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  modalFooter: {
    flexDirection: "row",
    marginTop: 30,
    gap: 15,
  },
  btnCancel: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  btnCancelText: {
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  btnSave: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  btnSaveText: {
    fontWeight: "700",
    color: "#FFF",
  },
});

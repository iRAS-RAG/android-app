import { theme } from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: theme.colors.primary,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  headerTitleContainer: { flex: 1 },
  headerTitle: { ...theme.typography.h2, color: theme.colors.textPrimary },
  headerSubTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  filterGroupCentered: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    width: "31%",
    backgroundColor: "#F1F5F9",
  },
  filterTabText: { fontWeight: "600", fontSize: 13 },
  subTabContainer: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    padding: 6,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 10,
  },
  subTabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  subTabActive: { backgroundColor: "#FFF" },
  subTabText: { color: "#64748B", fontWeight: "600", fontSize: 13 },
  subTabTextActive: { color: theme.colors.primary },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center", // Giúp icon, text và nút Edit luôn thẳng hàng ngang
    justifyContent: "space-between",
  },
  iconBox: {
    width: 48, // Tăng nhẹ kích thước để cân đối
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  cardSubTitle: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 8,
  },
  actionBtn: {
    marginTop: 12,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  actionBtnText: { color: "#FFF", fontWeight: "700" },
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
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
    marginTop: 15,
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  btnSave: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
  },
  btnTextSave: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },

  detailContainer: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: "#64748B",
    width: 80, // Cố định độ rộng để phần giá trị luôn thẳng hàng dọc
  },
  detailValue: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: "600",
    flex: 1,
  },
  editButton: {
    padding: 8,
    alignSelf: "flex-start", // Đưa nút lên ngang hàng với tiêu đề
  },
});

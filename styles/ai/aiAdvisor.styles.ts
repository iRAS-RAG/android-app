import { theme } from "@/theme";
import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  aiIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  aiName: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: theme.colors.success,
    fontWeight: "600",
  },

  // Khu vực hội thoại
  chatContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  botMsgContainer: {
    alignSelf: "flex-start",
    maxWidth: "85%",
    marginBottom: 20,
  },
  msgBubbleBot: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  msgTextBot: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  msgTime: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 6,
  },

  userMsgContainer: {
    alignSelf: "flex-end",
    maxWidth: "85%",
    marginBottom: 20,
  },
  msgBubbleUser: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 16,
    borderTopRightRadius: 4,
  },
  msgTextUser: {
    fontSize: 14,
    color: "#FFF",
    lineHeight: 20,
  },
  msgTimeUser: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 6,
    textAlign: "right",
  },

  // Hướng dẫn SOP và Linh kiện
  sopSection: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 15,
  },
  sopHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sopTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
    marginLeft: 8,
  },
  sopCard: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  stepDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  stepTime: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },

  sparePartSection: {
    marginTop: 20,
  },
  partCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  partIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  partHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  partName: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  partStatus: {
    fontSize: 10,
    fontWeight: "700",
  },
  partSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  partFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 10,
  },
  partQty: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  partPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  requestBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  requestBtnText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // Nhập liệu
  inputArea: {
    backgroundColor: "#FFF",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  suggestionRow: {
    flexDirection: "row",
    marginBottom: 15,
  },
  suggestionTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 10,
    backgroundColor: "#F8FAFC",
  },
  suggestionText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  textInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 22,
    paddingHorizontal: 15,
    marginHorizontal: 10,
  },
  textInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});

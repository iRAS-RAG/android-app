import { theme } from "@/theme";
import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Nền xám nhạt hiện đại
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: "#F8FAFC",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Profile Card Styles
  profileCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileEmail: {
    color: "#DBEAFE",
    fontSize: 13,
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20, // Bo tròn badge
    alignSelf: "flex-start",
  },
  roleText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },

  // Section Styles
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  sectionBlock: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },

  // Setting Item Styles
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  itemContent: {
    flex: 1,
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  itemSubTitle: {
    fontSize: 12,
    color: "#94A3B8",
  },
  itemAction: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  itemValueText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
});

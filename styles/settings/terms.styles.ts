import { theme } from "@/theme";
import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
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
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1E293B" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  card: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 10,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 16,
  },
});

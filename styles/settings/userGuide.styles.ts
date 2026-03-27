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
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1E293B" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  introText: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 20,
    marginTop: 8,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3B82F6",
    marginBottom: 8,
  },
  cardDesc: { fontSize: 14, color: "#475569", lineHeight: 22 },
});

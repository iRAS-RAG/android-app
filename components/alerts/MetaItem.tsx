import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { styles } from "@/styles/alerts/alertDetail.styles";

export default function MetaItem({ icon, label }: any) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={14} color="#64748B" />
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

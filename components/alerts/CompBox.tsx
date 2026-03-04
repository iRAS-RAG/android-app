import { Text, View } from "react-native";
import { styles } from "@/styles/alerts/alertDetail.styles";

export default function CompBox({ label, value, color }: any) {
  return (
    <View style={[styles.compBox, { backgroundColor: `${color}10` }]}>
      <Text style={styles.compLabel}>{label}</Text>
      <Text style={[styles.compValue, { color }]}>{value}</Text>
    </View>
  );
}

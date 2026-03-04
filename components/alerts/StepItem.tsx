import { Text, View } from "react-native";
import { styles } from "@/styles/alerts/alertDetail.styles";

export default function StepItem({ num, title, desc, priority }: any) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumText}>{num}</Text>
      </View>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDesc}>{desc}</Text>

        <View style={styles.priorityTag}>
          <Text style={styles.priorityText}>{priority}</Text>
        </View>
      </View>
    </View>
  );
}

import { View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { styles } from "@/styles/alerts/alertDetail.styles";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#FFF",
  backgroundGradientTo: "#FFF",
  color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
  strokeWidth: 2,
  decimalPlaces: 2,
};

export default function AlertChart() {
  return (
    <View style={styles.chartCard}>
      <Text style={styles.sectionLabel}>Biến động 24 giờ</Text>

      <LineChart
        data={{
          labels: ["00:00", "06:00", "12:00", "18:00", "Hiện tại"],
          datasets: [{ data: [0.1, 0.15, 0.22, 0.32, 0.35] }],
        }}
        width={screenWidth - 70}
        height={180}
        chartConfig={chartConfig}
        bezier
        style={{ marginVertical: 10, borderRadius: 16 }}
      />
    </View>
  );
}

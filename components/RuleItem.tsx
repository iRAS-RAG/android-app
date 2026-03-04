import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Text } from "react-native";
export function RuleItem({ label, valid }: { label: string; valid: boolean }) {
  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}
    >
      <Ionicons
        name={valid ? "checkmark-circle" : "ellipse-outline"}
        size={14}
        color={valid ? theme.colors.success : theme.colors.textSecondary}
      />
      <Text
        style={{
          ...theme.typography.caption,
          marginLeft: 8,
          color: valid ? theme.colors.success : theme.colors.textSecondary,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

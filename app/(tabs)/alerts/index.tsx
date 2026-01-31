import React from "react";
import { View, Text, SafeAreaView } from "react-native";
import { theme } from "@/theme";

export default function AlertsScreen() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={theme.typography.h2}>Danh sách Cảnh báo</Text>
      <Text
        style={[
          theme.typography.body2,
          { marginTop: 10, color: theme.colors.textSecondary },
        ]}
      >
        Các sự cố về bể nuôi sẽ hiển thị tại đây.
      </Text>
    </SafeAreaView>
  );
}

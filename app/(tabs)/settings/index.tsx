import React from "react";
import { View, Text, SafeAreaView } from "react-native";
import { theme } from "@/theme";

export default function SettingsScreen() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={theme.typography.h2}>Cài đặt hệ thống</Text>
    </SafeAreaView>
  );
}

import React from "react";
import { View, Text, SafeAreaView } from "react-native";
import { theme } from "@/theme";

export default function WarehouseScreen() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={theme.typography.h2}>Quản lý Kho</Text>
      <Text style={[theme.typography.body2, { marginTop: 10 }]}>
        Thức ăn và vật tư trang trại.
      </Text>
    </SafeAreaView>
  );
}

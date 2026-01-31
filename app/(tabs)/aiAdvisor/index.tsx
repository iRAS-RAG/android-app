import React from "react";
import { View, Text, SafeAreaView } from "react-native";
import { theme } from "@/theme";

export default function AIAdvisorScreen() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={theme.typography.h2}>Trợ lý AI Advisory</Text>
      <Text
        style={[
          theme.typography.body2,
          { marginTop: 10, textAlign: "center", paddingHorizontal: 20 },
        ]}
      >
        Hệ thống RAG đang sẵn sàng tư vấn kỹ thuật nuôi cho bạn.
      </Text>
    </SafeAreaView>
  );
}

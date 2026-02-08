import { styles } from "@/styles/alerts/alertDetail.styles"; // Dùng chung style base
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function MaintenanceLogScreen() {
  const router = useRouter();
  const { id, type } = useLocalSearchParams();
  const [logContent, setLogContent] = useState("");

  const handleSaveAndClose = () => {
    // Logic: 1. Lưu log vào DB/Storage | 2. Đổi trạng thái cảnh báo thành "Đã giải quyết"
    console.log(`Lưu nhật ký cho sự cố #${id}`);
    router.replace("/(tabs)/alerts"); // Quay về danh sách cảnh báo
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhật ký bảo trì #{id}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ padding: 20 }}>
        <Text style={{ fontWeight: "700", marginBottom: 10 }}>
          Hành động đã thực hiện
        </Text>
        <TextInput
          style={[styles.noteInput, { height: 200 }]}
          multiline
          placeholder="Ví dụ: Đã kiểm tra hệ thống sục khí, thay 20% nước và vệ sinh màng lọc..."
          value={logContent}
          onChangeText={setLogContent}
        />

        <TouchableOpacity
          style={[
            styles.btnSuccess,
            { marginTop: 20, opacity: logContent.length > 10 ? 1 : 0.6 },
          ]}
          disabled={logContent.length <= 10}
          onPress={handleSaveAndClose}
        >
          <Text style={styles.btnWhiteText}>Lưu & Đóng sự cố</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

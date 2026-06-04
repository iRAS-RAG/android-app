import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { styles } from "@/styles/settings/userGuide.styles";

export default function UserGuideScreen() {
  const router = useRouter();

  const guides = [
    {
      title: "1. Giám sát thông số bể nuôi",
      desc: "Vào tab Dashboard, chọn bể cần xem. Bạn có thể xem biểu đồ xu hướng bằng cách bấm vào từng thẻ cảm biến (Nhiệt độ, pH, Oxy).",
    },
    {
      title: "2. Xử lý cảnh báo (Alerts)",
      desc: "Khi có thông số vượt ngưỡng, hệ thống sẽ báo đỏ. Chuyển sang tab Cảnh báo, chọn 'Xem chi tiết' để đọc khuyến nghị AI và xác nhận xử lý.",
    },
    {
      title: "3. Quản lý lô nuôi & Cho ăn",
      desc: "Sử dụng tính năng Vận hành để ghi chép lượng thức ăn và tỷ lệ hao hụt (Vật nuôi chết) hàng ngày nhằm giúp AI tính toán FCR chính xác nhất.",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hướng dẫn sử dụng</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.introText}>
          Chào mừng bạn đến với ứng dụng iRAS-RAG. Dưới đây là các hướng dẫn cơ
          bản để vận hành hệ thống.
        </Text>

        {guides.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

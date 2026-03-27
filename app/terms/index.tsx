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
import { styles } from "@/styles/settings/terms.styles";

export default function TermsScreen() {
  const router = useRouter();

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
        <Text style={styles.headerTitle}>Điều khoản & Chính sách</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Text style={styles.title}>1. Điều khoản sử dụng</Text>
          <Text style={styles.paragraph}>
            Bằng việc sử dụng ứng dụng iRAS-RAG, bạn đồng ý tuân thủ các quy
            định về vận hành an toàn và bảo mật thông tin của trang trại. Ứng
            dụng cung cấp số liệu tham khảo và cảnh báo hỗ trợ quyết định, người
            vận hành chịu trách nhiệm cuối cùng đối với các thao tác điều khiển
            thiết bị.
          </Text>

          <Text style={styles.title}>2. Thu thập dữ liệu</Text>
          <Text style={styles.paragraph}>
            Hệ thống thu thập dữ liệu từ các cảm biến IoT (Nhiệt độ, pH, DO...)
            và thao tác của người dùng nhằm mục đích phân tích, huấn luyện mô
            hình AI để đưa ra các khuyến nghị nuôi trồng tối ưu nhất.
          </Text>

          <Text style={styles.title}>3. Bảo mật thông tin</Text>
          <Text style={styles.paragraph}>
            Dữ liệu của trang trại được mã hóa và lưu trữ an toàn. Chúng tôi cam
            kết không chia sẻ dữ liệu kinh doanh của bạn cho bất kỳ bên thứ ba
            nào khi chưa có sự đồng ý.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

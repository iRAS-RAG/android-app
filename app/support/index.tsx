import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { styles } from "@/styles/settings/support.styles";

export default function SupportScreen() {
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
        <Text style={styles.headerTitle}>Liên hệ Hỗ trợ</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="headset" size={40} color="#3B82F6" />
          </View>
          <Text style={styles.mainText}>Chúng tôi có thể giúp gì cho bạn?</Text>
          <Text style={styles.subText}>
            Đội ngũ kỹ thuật của iRAS luôn sẵn sàng hỗ trợ bạn 24/7.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => Linking.openURL("tel:19001234")}
          activeOpacity={0.7}
        >
          <View style={[styles.contactIcon, { backgroundColor: "#ECFDF5" }]}>
            <Ionicons name="call" size={24} color="#10B981" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Hotline 24/7</Text>
            <Text style={styles.contactValue}>1900 1234</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => Linking.openURL("mailto:support@aquatech.vn")}
          activeOpacity={0.7}
        >
          <View style={[styles.contactIcon, { backgroundColor: "#EFF6FF" }]}>
            <Ionicons name="mail" size={24} color="#3B82F6" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Email hỗ trợ</Text>
            <Text style={styles.contactValue}>support@aquatech.vn</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

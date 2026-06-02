import { theme } from "@/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View, Platform } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Ẩn header hệ thống để không hiện chữ "Dashboard"
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          height: Platform.OS === "ios" ? 90 : 70,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          backgroundColor: "#FFF",
          borderTopWidth: 1,
          borderTopColor: "#F1F5F9",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="warehouse/index"
        options={{
          title: "Vận hành",
          tabBarIcon: ({ color }) => (
            <Ionicons name="construct" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="aiAdvisor/index" // Khớp với thư mục aiAdvisor của bạn
        options={{
          title: "AI",
          tabBarIcon: () => (
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                backgroundColor: theme.colors.primary,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 35, // Đẩy nút nổi lên trên
                borderWidth: 5,
                borderColor: "#FFF",
                elevation: 4,
                shadowColor: "#000",
                shadowOpacity: 0.2,
              }}
            >
              <MaterialCommunityIcons name="robot" size={28} color="#FFF" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="alerts/index"
        options={{
          title: "Cảnh báo",
          tabBarIcon: ({ color }) => (
            <Ionicons name="warning" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: "Cài đặt",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

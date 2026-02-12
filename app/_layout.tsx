import { AuthProvider } from "@/contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      {/* 1. AuthProvider nên nằm ngoài cùng để bao bọc logic toàn app */}
      <AuthProvider>
        {/* 2. LinearGradient bao phủ giao diện */}
        <LinearGradient colors={["#E3F2FD", "#F4F7FA"]} style={{ flex: 1 }}>
          <StatusBar style="dark" backgroundColor="transparent" />

          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="(auth)/login"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(auth)/forgotPassword"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(auth)/verifyOTP"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(auth)/resetPassword"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(auth)/register"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="tankDetail/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="alertDetail/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="maintenance/log"
              options={{ headerShown: false }}
            />
          </Stack>
        </LinearGradient>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

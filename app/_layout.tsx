import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#E3F2FD" />
      <Stack>
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
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
        <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}

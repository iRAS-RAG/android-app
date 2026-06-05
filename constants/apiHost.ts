import Constants from "expo-constants";
import { Platform } from "react-native";
import * as Device from "expo-device";

function getApiHost(): string {
  // Override via .env (e.g. ngrok URL): EXPO_PUBLIC_API_HOST=https://xxxx.ngrok-free.app
  const envHost = process.env.EXPO_PUBLIC_API_HOST;
  if (envHost) {
    return envHost;
  }

  // Android emulator: special alias to host machine
  if (Platform.OS === "android" && !Device.isDevice) {
    return "http://10.0.2.2:5027";
  }

  // Physical device (dev): derive host IP from Metro bundler connection
  // Only use hostUri when it's a local IP (not a tunnel/ngrok domain)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    const isLocalIP = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);
    if (isLocalIP) {
      return `http://${host}:5027`;
    }
  }

  // Fallback: same-network WiFi without AP isolation
  return "http://192.168.20.166:5027";
}

export const API_HOST = getApiHost();

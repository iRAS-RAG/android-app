import { HubConnectionBuilder, type HubConnection } from "@microsoft/signalr";
import { useEffect, useRef } from "react";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { Platform } from "react-native";
import * as Device from "expo-device";

const API_HOST =
  Platform.OS === "android" && !Device.isDevice
    ? "http://10.0.2.2:5027"
    : "http://192.168.1.10:5027";

const HUB_URL = `${API_HOST}/hubs/alerts`;

export interface AlertPush {
  alertId: string;
  tankId: string;
  tankName: string;
  sensorTypeName?: string;
  triggerValue: number;
  minValue: number;
  maxValue: number;
}

interface Handlers {
  onReceiveAlert?: (push: AlertPush) => void;
  onAlertCreated?: (notification: { alertId: string; tankId: string }) => void;
}

export function useAlertSignalR(handlers: Handlers) {
  const connRef = useRef<HubConnection | null>(null);
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    let cancelled = false;

    const getToken = async () => {
      try {
        return (await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN)) ?? "";
      } catch {
        return "";
      }
    };

    const conn = new HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: getToken })
      .withAutomaticReconnect()
      .build();

    conn.on("ReceiveAlert", (push: AlertPush) => {
      handlersRef.current.onReceiveAlert?.(push);
    });

    conn.on("AlertCreated", (n: { alertId: string; tankId: string }) => {
      handlersRef.current.onAlertCreated?.(n);
    });

    conn.start().catch((e) => {
      if (!cancelled) console.warn("AlertSignalR connection failed:", e);
    });

    connRef.current = conn;

    return () => {
      cancelled = true;
      conn.stop().catch(() => {});
      connRef.current = null;
    };
  }, []);
}

// components/common/Toast.tsx
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export type ToastType = "success" | "error" | "warning" | "info" | "alert";

export interface ToastOptions {
  type: ToastType;
  message: string;
  duration?: number; // ms, mặc định 3000
  onPress?: () => void;
}

export interface ToastRef {
  show: (opts: ToastOptions) => void;
}

const CONFIG: Record<
  ToastType,
  { bg: string; border: string; icon: string; iconColor: string; textColor?: string }
> = {
  success: {
    bg: "#F0FDF4",
    border: "#86EFAC",
    icon: "checkmark-circle",
    iconColor: "#16A34A",
  },
  error: {
    bg: "#FEF2F2",
    border: "#FCA5A5",
    icon: "close-circle",
    iconColor: "#DC2626",
  },
  warning: {
    bg: "#FFFBEB",
    border: "#FCD34D",
    icon: "warning",
    iconColor: "#D97706",
  },
  info: {
    bg: "#EFF6FF",
    border: "#93C5FD",
    icon: "information-circle",
    iconColor: "#2563EB",
  },
  alert: {
    bg: "#FFFFFF",
    border: "#EF4444",
    icon: "warning",
    iconColor: "#EF4444",
    textColor: "#111827",
  },
};

const Toast = forwardRef<ToastRef>((_, ref) => {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");
  const [visible, setVisible] = useState(false);
  const [onPressHandler, setOnPressHandler] = useState<(() => void) | undefined>();

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  }, [translateY, opacity]);

  const show = useCallback(
    (opts: ToastOptions) => {
      // Huỷ timer cũ nếu đang hiển thị toast khác
      if (timerRef.current) clearTimeout(timerRef.current);

      setMessage(opts.message);
      setType(opts.type);
      setOnPressHandler(() => opts.onPress);
      setVisible(true);

      // Reset và animate vào
      translateY.setValue(-120);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        hide();
      }, opts.duration ?? 3000);
    },
    [translateY, opacity, hide],
  );

  useImperativeHandle(ref, () => ({ show }), [show]);

  if (!visible) return null;

  const cfg = CONFIG[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 8,
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.inner}
        activeOpacity={onPressHandler ? 0.7 : 1}
        onPress={() => {
          if (onPressHandler) {
            hide();
            onPressHandler();
          }
        }}
      >
        <Ionicons
          name={cfg.icon as any}
          size={22}
          color={cfg.iconColor}
          style={styles.icon}
        />
        <Text style={[styles.message, { color: cfg.textColor ?? cfg.iconColor }]} numberOfLines={3}>
          {message}
        </Text>
        {onPressHandler && (
          <Ionicons name="chevron-forward" size={16} color={cfg.iconColor} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

Toast.displayName = "Toast";
export default Toast;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
  },
  icon: {
    marginRight: 10,
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
});
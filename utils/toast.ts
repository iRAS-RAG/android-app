// utils/toast.ts
// Singleton imperative API — gọi toast.success/error/warning/info từ bất kỳ đâu
// mà không cần hook hay context.

import type { ToastRef, ToastType } from "@/components/common/Toast";

let _ref: ToastRef | null = null;

/** Đăng ký ref Toast từ _layout.tsx */
export const setToastRef = (ref: ToastRef | null) => {
  _ref = ref;
};

const show = (
  type: ToastType,
  message: string,
  duration?: number,
  onPress?: () => void,
) => {
  _ref?.show({ type, message, duration, onPress });
};

export const toast = {
  success: (message: string, duration?: number, onPress?: () => void) =>
    show("success", message, duration, onPress),
  error: (message: string, duration?: number, onPress?: () => void) =>
    show("error", message, duration, onPress),
  warning: (message: string, duration?: number, onPress?: () => void) =>
    show("warning", message, duration, onPress),
  info: (message: string, duration?: number, onPress?: () => void) =>
    show("info", message, duration, onPress),
  alert: (message: string, duration?: number, onPress?: () => void) =>
    show("alert", message, duration, onPress),
};
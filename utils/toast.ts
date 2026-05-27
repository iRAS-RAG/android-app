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
) => {
  _ref?.show({ type, message, duration });
};

export const toast = {
  success: (message: string, duration?: number) =>
    show("success", message, duration),
  error: (message: string, duration?: number) =>
    show("error", message, duration),
  warning: (message: string, duration?: number) =>
    show("warning", message, duration),
  info: (message: string, duration?: number) =>
    show("info", message, duration),
};
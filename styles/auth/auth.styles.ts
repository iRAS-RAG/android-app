import { theme } from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  inner: {
    flex: 1,
    paddingHorizontal: theme.grid.mobileGutter,
    justifyContent: "flex-start",
    paddingTop: 20, // kéo cả layout lên
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: theme.spacing.xs, // giảm khoảng cách logo → text
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subTitleDescription: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
  },
  form: {
    width: "100%",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg, // Tăng bo góc theo đề xuất
    paddingHorizontal: theme.spacing.md,
    height: 50,
    marginBottom: theme.spacing.md,
  },
  inputWrapperFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    ...theme.typography.body1,
    color: theme.colors.textPrimary,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: theme.spacing.xl,
  },
  forgotText: {
    ...theme.typography.subtitle,
    color: theme.colors.primary,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    height: 58,
    borderRadius: theme.borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.light,
  },
  loginButtonDisabled: {
    backgroundColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    ...theme.typography.subtitle,
    color: theme.colors.white,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.xl,
  },
  footerText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
  },
  registerText: {
    ...theme.typography.subtitle,
    color: theme.colors.primary,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: theme.spacing.xl,
  },
  otpInput: {
    width: 60,
    height: 70,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    textAlign: "center",
    ...theme.typography.h3, // Font số to rõ ràng
    color: theme.colors.textPrimary,
  },
  otpInputFocus: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  otpInputError: {
    borderColor: theme.colors.danger,
  },
  timerText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  resendButtonText: {
    ...theme.typography.subtitle,
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  // Sử dụng lại nút login cho thống nhất
  btnConfirm: {
    // Kế thừa từ loginButton của bạn
    backgroundColor: theme.colors.primary,
    height: 58,
    borderRadius: theme.borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.light,
  },
});

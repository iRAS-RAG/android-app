// theme/index.ts
import { colors } from "./color";
import { typography } from "./typography";

export const theme = {
  colors,
  typography,
  // Grid & Spacing chuẩn cho Mobile
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  grid: {
    mobileColumns: 4,
    mobileGutter: 16,
    maxWidth: 390, // Theo yêu cầu thiết kế Mobile
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
  shadows: {
    light: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  },
};

export type Theme = typeof theme;

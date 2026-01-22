// theme/typography.ts
export const typography = {
  fontFamily: "Inter", // Hoặc hệ thống font mặc định của máy
  h1: {
    fontSize: 32,
    fontWeight: "800" as const,
    lineHeight: 38,
  },
  h2: {
    fontSize: 24,
    fontWeight: "700" as const,
    lineHeight: 30,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 22,
  },
  body1: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
  },
};

// Design tokens for the app. Figma/Spiced-aligned: vibrant purple primary,
// coral accent, clean neutrals, generous spacing, rounded corners.
//
// COLORS keeps every key the existing screens already import, plus new ones.
// FONTS/TYPE/SPACING/RADII/SHADOWS are the new system primitives.

export const COLORS = {
  // Surfaces
  background: "#F4F5FA",
  surface: "#FFFFFF",
  surfaceAlt: "#EFEFF7",

  // Brand
  primary: "#6C3BFF",
  primaryPressed: "#5A2FE6",
  primarySoft: "#EFEAFF",
  accent: "#FF6B5E",
  accentSoft: "#FFE9E6",

  // Text
  textPrimary: "#16141F",
  textSecondary: "#615C75",
  textMuted: "#9A95AD",
  textOnPrimary: "#FFFFFF",

  // Lines
  border: "#E7E5F0",
  borderStrong: "#D6D2E6",

  // Status
  danger: "#D92D20",
  dangerSoft: "#FEE4E2",
  success: "#067647",
  successSoft: "#D3F8DF",
  warning: "#B54708",
  warningSoft: "#FEF0C7",

  // States
  disabled: "#C7C2D8",
  focus: "#6C3BFF",
} as const;

// Plus Jakarta Sans weight variants (loaded in app/_layout.tsx).
// With custom fonts, RN's fontWeight is unreliable — set fontFamily per weight.
export const FONTS = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
} as const;

// Typography presets — spread into a Text style, e.g. style={[TYPE.title, { color }]}.
export const TYPE = {
  display: { fontFamily: FONTS.extrabold, fontSize: 32, lineHeight: 38, letterSpacing: -0.5 },
  title: { fontFamily: FONTS.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
  subtitle: { fontFamily: FONTS.semibold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: FONTS.regular, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: FONTS.semibold, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: FONTS.semibold, fontSize: 13, lineHeight: 18, letterSpacing: 0.2 },
  caption: { fontFamily: FONTS.medium, fontSize: 13, lineHeight: 18 },
  button: { fontFamily: FONTS.bold, fontSize: 16, lineHeight: 20, letterSpacing: 0.2 },
} as const;

// 4-pt spacing scale.
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const RADII = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const SHADOWS = {
  card: {
    shadowColor: "#1A1330",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  soft: {
    shadowColor: "#1A1330",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
} as const;

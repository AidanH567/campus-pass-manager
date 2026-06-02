import { COLORS, FONTS, RADII, SPACING } from "@/lib/theme";
import * as Haptics from "expo-haptics";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";

type AppButtonProps = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
};

export default function AppButton({
  title,
  onPress,
  style,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "md",
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        size === "lg" ? styles.lg : styles.md,
        variantStyles[variant].container,
        pressed && !isDisabled ? variantStyles[variant].pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? COLORS.textOnPrimary : COLORS.primary}
        />
      ) : (
        <Text
          style={[styles.text, variantStyles[variant].text, isDisabled ? styles.disabledText : null]}
          numberOfLines={1}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADII.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: SPACING.sm,
    width: "100%",
    maxWidth: 460,
    borderWidth: 1,
  },
  md: { paddingVertical: 14, minHeight: 50 },
  lg: { paddingVertical: 17, minHeight: 56 },
  text: { fontFamily: FONTS.bold, fontSize: 16, letterSpacing: 0.2 },
  disabled: { backgroundColor: COLORS.disabled, borderColor: COLORS.disabled },
  disabledText: { color: COLORS.surface },
});

const variantStyles = {
  primary: StyleSheet.create({
    container: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    pressed: { backgroundColor: COLORS.primaryPressed, borderColor: COLORS.primaryPressed },
    text: { color: COLORS.textOnPrimary },
  }),
  secondary: StyleSheet.create({
    container: { backgroundColor: COLORS.surface, borderColor: COLORS.borderStrong },
    pressed: { backgroundColor: COLORS.surfaceAlt },
    text: { color: COLORS.textPrimary },
  }),
  ghost: StyleSheet.create({
    container: { backgroundColor: "transparent", borderColor: "transparent" },
    pressed: { backgroundColor: COLORS.primarySoft },
    text: { color: COLORS.primary },
  }),
};

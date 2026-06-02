import { COLORS, RADII, SHADOWS, SPACING } from "@/lib/theme";
import type { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

type CardProps = {
  children: ReactNode;
  style?: ViewStyle;
  variant?: "elevated" | "outlined";
};

export default function Card({ children, style, variant = "elevated" }: CardProps) {
  return (
    <View
      style={[styles.card, variant === "elevated" ? SHADOWS.card : styles.outlined, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

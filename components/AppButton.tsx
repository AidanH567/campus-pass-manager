import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import { COLORS } from "@/lib/theme";

type AppButtonProps = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  variant?: "primary" | "secondary";
};

export default function AppButton({
  title,
  onPress,
  style,
  disabled = false,
  variant = "primary",
}: AppButtonProps) {
  const buttonVariantStyle =
    variant === "secondary" ? styles.secondaryButton : styles.primaryButton;
  const textVariantStyle =
    variant === "secondary" ? styles.secondaryText : styles.primaryText;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        buttonVariantStyle,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, textVariantStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 460,
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
  },
  primaryText: {
    color: "#fff",
  },
  secondaryText: {
    color: COLORS.textPrimary,
  },
  pressed: {
    backgroundColor: COLORS.primaryPressed,
    borderColor: COLORS.primaryPressed,
  },
  disabled: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.disabled,
  },
});

import { COLORS, FONTS, RADII, SPACING, TYPE } from "@/lib/theme";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

type FormInputProps = TextInputProps & {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  error?: string;
};

export default function FormInput({
  value,
  onChangeText,
  label,
  error,
  onFocus,
  onBlur,
  style,
  ...rest
}: FormInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          focused ? styles.focused : null,
          error ? styles.errored : null,
          style,
        ]}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChangeText}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.xs, width: "100%" },
  label: { ...TYPE.label, color: COLORS.textSecondary },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
    minHeight: 52,
  },
  focused: { borderColor: COLORS.primary },
  errored: { borderColor: COLORS.danger, backgroundColor: COLORS.dangerSoft },
  errorText: { ...TYPE.caption, color: COLORS.danger },
});

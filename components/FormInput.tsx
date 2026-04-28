import { TextInput, StyleSheet, TextInputProps } from "react-native";
import { COLORS } from "@/lib/theme";

type FormInputProps = TextInputProps & {
  value: string;
  onChangeText: (text: string) => void;
};

export default function FormInput({
  value,
  onChangeText,
  ...rest
}: FormInputProps) {
  return (
    <TextInput
      style={styles.input}
      placeholderTextColor={COLORS.textSecondary}
      value={value}
      onChangeText={onChangeText}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
  },
});

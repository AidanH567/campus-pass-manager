import { TextInput, StyleSheet, TextInputProps } from "react-native";

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
            value={value}
            onChangeText={onChangeText}
            {...rest}
        />
    );
} 

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
});
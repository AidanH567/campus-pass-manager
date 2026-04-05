import { TextInput, StyleSheet } from "react-native";

type FormInputProps = {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
};

export default function FormInput({
    placeholder,
    value,
    onChangeText,
}: FormInputProps) {
    return (
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
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
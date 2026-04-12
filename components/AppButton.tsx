import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";

type AppButtonProps = {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    disabled?: boolean;
}

export default function AppButton({title, onPress, style, disabled = false
    }: AppButtonProps) {
    return (
        <Pressable style={[styles.button, style]} onPress={onPress} disabled={disabled}>
            <Text style={styles.buttonText}>{title}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#222",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        width: 220,

    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
})
import { Pressable, Text, StyleSheet } from "react-native";

type AppButtonProps = {
    title: string;
    onPress: () => void;
}

export default function AppButton({ title, onPress }: AppButtonProps) {
    return (
        <Pressable style={styles.button} onPress={onPress}>
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
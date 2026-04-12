import { View, Text, StyleSheet } from 'react-native';
import { router } from "expo-router"
import AppButton from '@/components/AppButton';

export default function BorrowOptionsScreen() {
    return (
        <View style={styles.container}>

            <Text style={styles.title}>Borrow Pass</Text>
            <Text style={styles.subtitle}>Choose an option</Text>

            <AppButton
                title="Never borrowed a pass before"
                onPress={() => router.push("/borrow")} />

            <AppButton
                title="I have borrowed a pass before"
                onPress={() => router.push("/borrow-existing")}
            />

            <AppButton
                title="Back to Home"
                onPress={() => router.replace("/")}
                style={styles.secondaryButton}
            />

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: "center",
        gap: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 18,
        textAlign: "center",
        marginBottom: 12,
    },
    secondaryButton: {
        width: "100%",
        backgroundColor: "#666",
    },
});
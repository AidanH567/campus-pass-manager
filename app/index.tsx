import AppButton from "@/components/AppButton";
import { router } from "expo-router";
import { View, Text, Button, StyleSheet, Pressable } from "react-native";

export default function HomeScreen() {
    return (
        <View style={styles.container}>

            <Text style={styles.title}>Campus Pass Manager</Text>
            <Text style={styles.subtitle}>Choose an option</Text>

            <AppButton
                title="Borrow Pass"
                onPress={() => router.push("/borrow-options")}
            />

            <AppButton
                title="Return Pass"
                onPress={() => router.push("/return")}
            />

            <AppButton
                title="Staff"
                onPress={() => router.push("/staff")}
            />

        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        gap: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 20,
    },
});
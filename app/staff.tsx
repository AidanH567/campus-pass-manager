import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import AppButton from "../components/AppButton";

export default function StaffScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Staff View</Text>
            <Text style={styles.subtitle}></Text>
            <Text></Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Currently Borrowed</Text>
                <Text style={styles.placeholderText}>No active passes yet.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Returned Today</Text>
                <Text style={styles.placeholderText}>No returned passes yet.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Overdue Passes</Text>
                <Text style={styles.placeholderText}>No overdue passes yet.</Text>
            </View>

            <AppButton
                title="Back to Home"
                onPress={() => router.back()}
                style={styles.backButton}
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
    section: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 12,
        padding: 16,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    placeholderText: {
        fontSize: 15,
        color: "#666",
    },
    backButton: {
        width: "100%",
        backgroundColor: "#666",
        marginTop: 8,
    },
});
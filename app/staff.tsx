import AppButton from "@/components/AppButton";
import { usePassContext } from "@/context/PassContext";
import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function StaffScreen() {

    function formatReminderTimestamp(timestamp?: string | null) {
        if (!timestamp) return "Not sent";

        return new Date(timestamp).toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    const { passRecords, markPassOverdue, checkForOverduePasses } = usePassContext();

    useEffect(() => {
        async function runOverdueCheck() {
            await checkForOverduePasses();
        }

        runOverdueCheck();
    }, []);


    const borrowedPasses = passRecords.filter(
        (record) => record.status === "borrowed"
    )

    const returnedPasses = passRecords.filter(
        (record) => record.status === "returned"
    );

    const overduePasses = passRecords.filter(
        (record) => record.status === "overdue"
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>

            <Text style={styles.title}>Staff View</Text>
            <Text style={styles.subtitle}>Card Overview</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Currently Borrowed ({borrowedPasses.length})</Text>
                {borrowedPasses.length === 0 ? (
                    <Text style={styles.placeholderText}>No borrowed passes yet.</Text>
                ) : (
                    borrowedPasses.map((record) => (
                        <View key={record.id} style={styles.card}>
                            <Text style={styles.cardText}>
                                {record.studentName} - Pass {record.passNumber}
                            </Text>

                            <Text style={styles.cardSubtext}>
                                Borrowed at {record.borrowedAt}
                            </Text>

                            <Pressable onPress={async () => await markPassOverdue(record.passNumber)}>
                                <Text style={styles.cardSubtext}>Mark Overdue</Text>
                            </Pressable>

                        </View>
                    ))
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Returned Today ({returnedPasses.length})</Text>
                {returnedPasses.length === 0 ? (
                    <Text style={styles.placeholderText}>No returned passes.</Text>
                ) : (
                    returnedPasses.map((record) => (
                        <View key={record.id} style={styles.card}>
                            <Text style={styles.cardText}>
                                {record.studentName} — Pass {record.passNumber}
                            </Text>
                            <Text style={styles.cardSubtext}>
                                Returned at {record.returnedAt}
                            </Text>
                        </View>
                    ))
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Overdue Passes ({overduePasses.length})</Text>
                {overduePasses.length === 0 ? (
                    <Text style={styles.placeholderText}>No overdue passes.</Text>
                ) : (
                    overduePasses.map((record) => (
                        <View key={record.id} style={styles.card}>
                            <Text style={styles.cardText}>
                                {record.studentName} — Pass {record.passNumber}
                            </Text>
                            <Text style={styles.cardSubtext}>
                                Borrowed at {record.borrowedAt}
                            </Text>

                            <Text style={styles.cardSubtext}>
                                First reminder: {formatReminderTimestamp(record.firstReminderSentAt)}
                            </Text>

                            <Text style={styles.cardSubtext}>
                                Second reminder: {formatReminderTimestamp(record.secondReminderSentAt)}
                            </Text>

                        </View>
                    ))
                )}
            </View>

            <AppButton
                title="Back to Home"
                onPress={() => router.replace("/")}
                style={styles.backButton}
            />

        </ScrollView>
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
        gap: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    placeholderText: {
        fontSize: 15,
        color: "#666",
    },
    card: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        backgroundColor: "#f8f8f8",
    },
    cardText: {
        fontSize: 16,
        fontWeight: "600",
    },
    cardSubtext: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },
    backButton: {
        width: "100%",
        backgroundColor: "#666",
        marginTop: 8,
    },
});
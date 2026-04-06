import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import AppButton from "../components/AppButton";

type PassRecord = {
    id: string;
    studentName: string;
    email: string;
    passNumber: string;
    checkedOutAt: string;
    returnedAt?: string;
    status: "borrowed" | "returned" | "overdue";
}

const mockPassRecords: PassRecord[] = [
    {
        id: "1",
        studentName: "Aidan",
        email: "aidan@example.com",
        passNumber: "3",
        checkedOutAt: "09:05",
        status: "borrowed",
    },
    {
        id: "2",
        studentName: "Mia",
        email: "mia@example.com",
        passNumber: "7",
        checkedOutAt: "10:15",
        returnedAt: "14:40",
        status: "returned",
    },
    {
        id: "3",
        studentName: "Sam",
        email: "sam@example.com",
        passNumber: "2",
        checkedOutAt: "08:50",
        status: "overdue",
    },
];

export default function StaffScreen() {

    const borrowedPasses = mockPassRecords.filter(
        (record) => record.status === "borrowed"
    )

    const returnedPasses = mockPassRecords.filter(
        (record) => record.status === "returned"
    );

    const overduePasses = mockPassRecords.filter(
        (record) => record.status === "overdue"
    );

    return (
        <View style={styles.container}>

            <Text style={styles.title}>Staff View</Text>
            <Text style={styles.subtitle}></Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Currently Borrowed</Text>
                {borrowedPasses.length === 0 ? (
                    <Text style={styles.placeholderText}>No borrowed passes yet.</Text>
                ) : (
                    borrowedPasses.map((record) => (
                        <View key={record.id} style={styles.card}>
                            <Text style={styles.cardText}>
                                {record.studentName} - Pass {record.passNumber}
                            </Text>

                            <Text style={styles.cardSubtext}>
                                Borrowed at {record.checkedOutAt}
                            </Text>

                        </View>
                    ))
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Returned Today</Text>
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
                <Text style={styles.sectionTitle}>Overdue Passes</Text>
                {overduePasses.length === 0 ? (
                    <Text style={styles.placeholderText}>No overdue passes.</Text>
                ) : (
                    overduePasses.map((record) => (
                        <View key={record.id} style={styles.card}>
                            <Text style={styles.cardText}>
                                {record.studentName} — Pass {record.passNumber}
                            </Text>
                            <Text style={styles.cardSubtext}>
                                Checked out at {record.checkedOutAt}
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
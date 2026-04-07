import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import AppButton from "@/components/AppButton";
import FormInput from "@/components/FormInput";
import { router } from "expo-router";

export default function BorrowScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [passNumber, setPassNumber] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    function handleBorrow() {
        setError("");
        setSuccessMessage("");

        if (!name.trim() || !email.trim() || !passNumber.trim()) {
            setError("Please fill in all fields.");
            return;
        }

        console.log({
            name,
            email,
            passNumber,
        });

        setName("");
        setEmail("");
        setPassNumber("");
        setSuccessMessage("You have successfully borrowed a pass");
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Borrow Pass</Text>

            <FormInput
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
            />

            <FormInput
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <FormInput
                placeholder="Enter pass number"
                value={passNumber}
                onChangeText={setPassNumber}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {successMessage ? (
                <Text style={styles.successText}>{successMessage}</Text>
            ) : null}

            <AppButton title="Confirm Borrow" onPress={handleBorrow} />

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
        gap: 14,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 10,
        textAlign: "center",
    },
    errorText: {
        color: "red",
        textAlign: "center",
        fontSize: 14,
    },
    successText: {
        color: "green",
        textAlign: "center",
        fontSize: 14,
    },
    secondaryButton: {
        width: "100%",
        backgroundColor: "#666",
    },
});
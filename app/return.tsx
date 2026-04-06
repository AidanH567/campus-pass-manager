import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import FormInput from "@/components/FormInput";
import AppButton from "@/components/AppButton";

export default function ReturnScreen() {
    const [passNumber, setPassNumber] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    function handleReturn() {
        setError("");
        setSuccessMessage("");

        if (!passNumber.trim()) {
            setError("Please Enter a Pass Number")
            return;
        }

        console.log({
            passNumber,
        });

        setSuccessMessage("Pass returned successfully")
        setPassNumber("")
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Return Pass</Text>

            <FormInput
                placeholder="Enter pass number"
                value={passNumber}
                onChangeText={setPassNumber}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {successMessage ? (
                <Text style={styles.successText}>{successMessage}</Text>
            ): null}

            <AppButton title="Confirm Return" onPress={handleReturn} />

        </View>
    );
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
});
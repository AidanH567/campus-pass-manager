import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import AppButton from "@/components/AppButton";
import FormInput from "@/components/FormInput";

export default function BorrowScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [passNumber, setPassNumber] = useState("");

    function handleBorrow() {
        console.log({
            name,
            email,
            passNumber
        })
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
            />

            <FormInput
                placeholder="Enter pass number"
                value={passNumber}
                onChangeText={setPassNumber}
            />

            <AppButton title="Confirm Borrow" onPress={handleBorrow} />

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
    input: {
        borderWidth: 1,
        borderColor: "#bbb",
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
    },
});
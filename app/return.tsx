import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import FormInput from "@/components/FormInput";
import AppButton from "@/components/AppButton";

export default function ReturnScreen() {
    const [passNumber, setPassNumber] = useState("");

    function handleReturn() {
        console.log({
            passNumber,
        });
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Return Pass</Text>

            <FormInput
                placeholder="Enter pass number"
                value={passNumber}
                onChangeText={setPassNumber}
            />

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
});
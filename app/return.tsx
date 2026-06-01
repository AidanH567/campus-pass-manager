import { View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import FormInput from "@/components/FormInput";
import AppButton from "@/components/AppButton";
import { router } from "expo-router";
import { usePassContext } from "@/context/PassContext";
import { COLORS } from "@/lib/theme";

export default function ReturnScreen() {
  const [passNumber, setPassNumber] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { returnPass } = usePassContext();

  async function handleReturn() {
    setError("");
    setSuccessMessage("");

    if (!passNumber.trim()) {
      setError("Please Enter a Pass Number");
      return;
    }

    const didReturn = await returnPass(passNumber.trim());

    if (!didReturn) {
      setError("No matching borrowed pass found with that number.");
      return;
    }

    setSuccessMessage("Pass returned successfully");
    setPassNumber("");
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Return Pass</Text>

        <FormInput
          placeholder="Enter pass number"
          value={passNumber}
          onChangeText={setPassNumber}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {successMessage ? (
          <Text style={styles.successText}>{successMessage}</Text>
        ) : null}

        <View style={styles.buttonGroup}>
          <AppButton title="Confirm Return" onPress={handleReturn} />

          <AppButton
            title="Back to Home"
            onPress={() => router.replace("/")}
            variant="secondary"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  card: {
    width: "100%",
    maxWidth: 560,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: "center",
    fontSize: 14,
  },
  successText: {
    color: COLORS.success,
    textAlign: "center",
    fontSize: 14,
  },
  buttonGroup: {
    marginTop: 4,
    gap: 10,
    alignItems: "center",
  },
});

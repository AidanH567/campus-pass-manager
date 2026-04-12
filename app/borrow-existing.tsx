import { View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import FormInput from "@/components/FormInput";
import AppButton from "@/components/AppButton";
import { usePassContext } from "@/context/PassContext";

export default function BorrowExistingScreen() {
  const [email, setEmail] = useState("");
  const [passNumber, setPassNumber] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { borrowPassWithExistingEmail, passRecords } = usePassContext();

  async function handleBorrowExisting() {
    setError("");
    setSuccessMessage("");

    if (!email.trim() || !passNumber.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    const passAlreadyBorrowed = passRecords.some(
      (record) =>
        record.passNumber === passNumber.trim() &&
        record.status === "borrowed"
    );

    if (passAlreadyBorrowed) {
      setError("That pass is already checked out.");
      return;
    }

    const didBorrow = await borrowPassWithExistingEmail(
      email.trim(),
      passNumber.trim()
    );

    if (!didBorrow) {
      setError(
        "No previous borrower found with that email. Please use the new borrower form."
      );
      return;
    }

    setEmail("");
    setPassNumber("");
    setSuccessMessage("You have successfully borrowed a pass.");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Borrow Pass</Text>
      <Text style={styles.subtitle}>Returning borrower</Text>

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

      <AppButton title="Confirm Borrow" onPress={handleBorrowExisting} />

      <AppButton
        title="Back"
        onPress={() => router.replace("/borrow-options")}
        style={styles.secondaryButton}
      />
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
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 12,
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